import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import RefreshToken from '../models/RefreshToken';
import { SignOptions } from 'jsonwebtoken';

/**
 * Generate a 6-digit OTP.
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash a plain-text password.
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, config.bcryptSaltRounds);
};

/**
 * Compare a plain-text password with a hash.
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate an access JWT token.
 */
export const generateAccessToken = (payload: object): string => {
  return jwt.sign(payload, config.jwtSecret as jwt.Secret, {
    expiresIn: config.jwtExpiresIn,
    audience: 'api:access'
  } as SignOptions);
};

/**
 * Generate a refresh token.
 */
export const generateRefreshToken = (payload: object): string => {
  return jwt.sign(payload, config.jwtSecret as jwt.Secret, {
    expiresIn: config.refreshTokenExpiresIn,
    audience: 'api:refresh'
  } as SignOptions);
};

/**
 * Create and save a new refresh token
 */
export const createRefreshToken = async (userId: string): Promise<{ token: string, expires: Date }> => {
  const refreshTokenValue = generateRefreshToken({ id: userId });
  const expiresIn = parseInt(config.refreshTokenExpiresIn) * 24 * 60 * 60 * 1000 || 7 * 24 * 60 * 60 * 1000;
  const expires = new Date(Date.now() + expiresIn);

  const refreshToken = new RefreshToken({
    user: userId,
    token: refreshTokenValue,
    expires
  });

  await refreshToken.save();
  return { token: refreshTokenValue, expires };
};

/**
 * Revoke all refresh tokens for a user
 */
export const revokeAllRefreshTokens = async (userId: string): Promise<void> => {
  await RefreshToken.deleteMany({ user: userId });
};
