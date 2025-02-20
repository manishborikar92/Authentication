import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import User from '../models/User';
import RefreshToken from '../models/RefreshToken';
import logger from '../utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      accessToken?: string;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token is required' });
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as {
        id: string;
        email: string;
        name: string;
      };

      // Get user data from database
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Attach user and token to request object
      req.user = user;
      req.accessToken = token;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ 
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'  // Add specific code for frontend handling
        });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    logger.error('Auth middleware error: %o', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Middleware to verify refresh token
export const verifyRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }

    const savedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!savedToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    if (new Date() > savedToken.expires) {
      await RefreshToken.deleteOne({ token: refreshToken });
      return res.status(403).json({ 
        message: 'Refresh token expired',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
    }

    req.user = { id: savedToken.user };
    next();
  } catch (error) {
    logger.error('Refresh token verification error: %o', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 