import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

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
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as jwt.SignOptions);
};

/**
 * Generate a refresh token.
 */
export const generateRefreshToken = (payload: object): string => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.refreshTokenExpiresIn } as jwt.SignOptions);
};
