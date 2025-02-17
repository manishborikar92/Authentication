import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import User from '../models/User';
import TempUser from '../models/TempUser';
import RefreshToken from '../models/RefreshToken';
import PasswordReset from '../models/PasswordReset';
import { generateOTP, hashPassword, comparePassword, generateAccessToken, generateRefreshToken } from '../services/authService';
import { sendOTPEmail, sendResetPasswordEmail } from '../services/emailService';
import logger from '../utils/logger';

/**
 * POST /api/auth/register
 * Initiates registration by creating (or updating) a temporary record with an OTP.
 */
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }
  try {
    // Check if the email is already registered.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already registered. Please login.' });
    }

    // Generate OTP and expiration.
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + config.otpExpirationMinutes * 60 * 1000);
    const passwordHash = await hashPassword(password);

    let tempUser = await TempUser.findOne({ email });
    if (tempUser) {
      tempUser.name = name;
      tempUser.passwordHash = passwordHash;
      tempUser.otp = otp;
      tempUser.otpExpires = otpExpires;
      await tempUser.save();
    } else {
      tempUser = new TempUser({ name, email, passwordHash, otp, otpExpires });
      await tempUser.save();
    }

    await sendOTPEmail(email, otp, config.otpExpirationMinutes);

    return res.status(201).json({ message: 'Registration initiated. OTP sent to your email.'});
  } catch (error) {
    logger.error('Registration error: %o', error);
    return res.status(500).json({ message: 'Error during registration.' });
  }
};

/**
 * POST /api/auth/verify-otp
 * Verifies the OTP and creates a permanent user.
 */
export const verifyOTP = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }
  try {
    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      return res.status(400).json({ message: 'No pending registration for this email.' });
    }
    if (new Date() > tempUser.otpExpires) {
      await TempUser.deleteOne({ email });
      return res.status(400).json({ message: 'OTP expired. Please register again.' });
    }
    if (tempUser.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }
    const newUser = new User({
      name: tempUser.name,
      email: tempUser.email,
      passwordHash: tempUser.passwordHash
    });
    await newUser.save();
    await TempUser.deleteOne({ email });
    return res.json({ message: 'Registration verified successfully. You can now log in.' });
  } catch (error) {
    logger.error('OTP verification error: %o', error);
    return res.status(500).json({ message: 'Error verifying OTP.' });
  }
};

/**
 * POST /api/auth/login
 * Authenticates the user and issues an access token and a refresh token.
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }
    // Generate tokens.
    const accessToken = generateAccessToken({ id: user._id, name: user.name, email: user.email });
    const refreshTokenValue = generateRefreshToken({ id: user._id });
    const refreshTokenExpiry = new Date(Date.now() + parseInt(config.refreshTokenExpiresIn) * 24 * 60 * 60 * 1000 || 7 * 24 * 60 * 60 * 1000);
    // Save refresh token in DB.
    const refreshToken = new RefreshToken({
      user: user._id,
      token: refreshTokenValue,
      expires: refreshTokenExpiry
    });
    await refreshToken.save();
    return res.json({ accessToken, refreshToken: refreshTokenValue });
  } catch (error) {
    logger.error('Login error: %o', error);
    return res.status(500).json({ message: 'Error during login.' });
  }
};

/**
 * POST /api/auth/refresh-token
 * Accepts a refresh token and, if valid, issues a new access token.
 */
export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken: requestToken } = req.body;
  if (!requestToken) {
    return res.status(400).json({ message: 'Refresh token is required.' });
  }
  try {
    const savedToken = await RefreshToken.findOne({ token: requestToken });
    if (!savedToken) {
      return res.status(403).json({ message: 'Refresh token not found.' });
    }
    if (new Date() > savedToken.expires) {
      await RefreshToken.deleteOne({ token: requestToken });
      return res.status(403).json({ message: 'Refresh token expired. Please log in again.' });
    }
    // Synchronously verify the refresh token.
    const decoded = jwt.verify(requestToken, config.jwtSecret) as { id: string, email: string };
    // Issue new access token.
    const newAccessToken = generateAccessToken({ id: decoded.id, email: decoded.email });
    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid refresh token.' });
  }
};

/**
 * POST /api/auth/logout
 * Logs the user out by deleting the refresh token.
 */
export const logout = async (req: Request, res: Response) => {
  const { refreshToken: requestToken } = req.body;
  if (!requestToken) {
    return res.status(400).json({ message: 'Refresh token is required.' });
  }
  try {
    await RefreshToken.deleteOne({ token: requestToken });
    return res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    logger.error('Logout error: %o', error);
    return res.status(500).json({ message: 'Error during logout.' });
  }
};

/**
 * GET /api/auth/protected
 * A sample protected route.
 */
export const protectedRoute = (req: Request, res: Response) => {
  return res.json({ message: 'You have accessed a protected route!', user: (req as any).user });
};

/**
 * POST /api/auth/forgot-password
 * Initiates a password reset by generating an OTP and sending it to the user's email.
 */
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }
  try {
    const user = await User.findOne({ email });
    // For security reasons, do not reveal if the user exists.
    if (!user) {
      return res.status(200).json({ message: 'If that email exists, an OTP has been sent.' });
    }
    // Generate OTP and expiration.
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + config.otpExpirationMinutes * 60 * 1000);
    
    // Check/update existing password reset request.
    let passwordReset = await PasswordReset.findOne({ email });
    if (passwordReset) {
      passwordReset.otp = otp;
      passwordReset.otpExpires = otpExpires;
      await passwordReset.save();
    } else {
      passwordReset = new PasswordReset({ email, otp, otpExpires });
      await passwordReset.save();
    }
    
    // Send the password reset email.
    await sendResetPasswordEmail(email, otp, config.otpExpirationMinutes);
    return res.status(200).json({ message: 'If that email exists, an OTP has been sent.' });
  } catch (error) {
    logger.error('Forgot password error: %o', error);
    return res.status(500).json({ message: 'Error initiating password reset.' });
  }
};

/**
 * POST /api/auth/reset-password
 * Resets the user's password after verifying the OTP.
 */
export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
  }
  try {
    const passwordReset = await PasswordReset.findOne({ email });
    if (!passwordReset) {
      return res.status(400).json({ message: 'No password reset request found for this email.' });
    }
    if (new Date() > passwordReset.otpExpires) {
      await PasswordReset.deleteOne({ email });
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }
    if (passwordReset.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }
    // Validate that the new password is different from the current one.
    const isSamePassword = await comparePassword(newPassword, user.passwordHash);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password must be different from the current password.' });
    }
    // Update the user's password.
    const passwordHash = await hashPassword(newPassword);
    user.passwordHash = passwordHash;
    await user.save();
    // Remove the password reset record.
    await PasswordReset.deleteOne({ email });
    return res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    logger.error('Reset password error: %o', error);
    return res.status(500).json({ message: 'Error resetting password.' });
  }
};
