import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_here',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  otpExpirationMinutes: process.env.OTP_EXPIRATION_MINUTES ? parseInt(process.env.OTP_EXPIRATION_MINUTES, 10) : 5,
  bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : 10,
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/advanced_auth_system'
};
