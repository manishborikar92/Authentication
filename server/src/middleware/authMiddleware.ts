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
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        message: 'Access token is required',
        code: 'ACCESS_TOKEN_REQUIRED'
      });
    }

    try {
      // Verify token and ensure it's an access token
      const decoded = jwt.verify(token, config.jwtSecret as jwt.Secret, {
        audience: 'api:access',
        complete: true
      }) as unknown as { 
        payload: { id: string; email: string; name: string; aud: string; }
      };

      // Reject if not an access token
      if (decoded.payload.aud !== 'api:access') {
        return res.status(401).json({ 
          message: 'Invalid token type',
          code: 'INVALID_TOKEN_TYPE'
        });
      }

      const user = await User.findById(decoded.payload.id).select('-passwordHash');
      if (!user) {
        return res.status(401).json({ 
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      req.user = user;
      req.accessToken = token;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ 
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({ 
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
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
      return res.status(401).json({ 
        message: 'Refresh token is required',
        code: 'REFRESH_TOKEN_REQUIRED'
      });
    }

    try {
      // Verify token and ensure it's a refresh token
      const decoded = jwt.verify(refreshToken, config.jwtSecret as jwt.Secret, {
        audience: 'api:refresh',
        complete: true
      }) as unknown as {
        payload: { id: string; aud: string; }
      };

      // Reject if not a refresh token
      if (decoded.payload.aud !== 'api:refresh') {
        return res.status(403).json({ 
          message: 'Invalid token type',
          code: 'INVALID_TOKEN_TYPE'
        });
      }

      const savedToken = await RefreshToken.findOne({ token: refreshToken });
      if (!savedToken) {
        return res.status(403).json({ 
          message: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN'
        });
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
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(403).json({ 
          message: 'Refresh token expired',
          code: 'REFRESH_TOKEN_EXPIRED'
        });
      }
      return res.status(403).json({ 
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }
  } catch (error) {
    logger.error('Refresh token verification error: %o', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 