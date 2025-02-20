# Access and Refresh Tokens

This document explains the key differences between access tokens and refresh tokens, and their implementation in our authentication system.

## Access Token

### Purpose
- Used for authenticating API requests
- Provides direct access to protected resources
- Carries user identity information

### Characteristics
- Short-lived (15 minutes by default)
- Stateless (JWT-based)
- Contains user data (id, name, email)
- Uses 'api:access' audience claim
- Requires Authorization header: `Bearer <token>`

### Implementation Example
```typescript
// Generate access token
export const generateAccessToken = (payload: object): string => {
  return jwt.sign(payload, config.jwtSecret as jwt.Secret, {
    expiresIn: config.jwtExpiresIn,
    audience: 'api:access'
  } as SignOptions);
};

// Validate access token
const decoded = jwt.verify(token, config.jwtSecret as jwt.Secret, {
  audience: 'api:access',
  complete: true
}) as unknown as { 
  payload: { id: string; email: string; name: string; aud: string; }
};
```

## Refresh Token

### Purpose
- Used to obtain new access tokens
- Enables long-term persistence of authentication
- Provides secure way to maintain sessions

### Characteristics
- Long-lived (7 days by default)
- Stateful (stored in database)
- Contains minimal user data (user ID only)
- Uses 'api:refresh' audience claim
- Rotated on each use (old token invalidated)

### Implementation Example
```typescript
// Generate and store refresh token
const decoded = jwt.verify(refreshToken, config.jwtSecret as jwt.Secret, {
  audience: 'api:refresh',
  complete: true
}) as unknown as {
  payload: { id: string; aud: string; }
};
```

## Error Handling

### Access Token Errors
```typescript
{
  message: string;
  code: 'ACCESS_TOKEN_REQUIRED' |
        'INVALID_TOKEN_TYPE' |
        'USER_NOT_FOUND' |
        'TOKEN_EXPIRED' |
        'INVALID_TOKEN';
}
```

### Refresh Token Errors
```typescript
{
  message: string;
  code: 'REFRESH_TOKEN_REQUIRED' |
        'INVALID_TOKEN_TYPE' |
        'INVALID_REFRESH_TOKEN' |
        'REFRESH_TOKEN_EXPIRED';
}
```

## Security Features

1. **Strict Audience Separation**
   - Access tokens can only be used for API requests
   - Refresh tokens can only be used for token refresh
   - Wrong token type results in INVALID_TOKEN_TYPE error

2. **Token Rotation**
   - New refresh token issued with each refresh
   - Old refresh token immediately invalidated
   - Prevents token reuse attacks

3. **Database Tracking**
   - All refresh tokens stored with expiration
   - Enables token revocation
   - Automatic cleanup of expired tokens

4. **Error Codes**
   - Specific error codes for each failure case
   - Enables precise frontend handling
   - Clear security-related messaging

## Token Management

### Database Schema
```typescript
const RefreshTokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  expires: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});
```

### Configuration
```typescript
export const config = {
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_here',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
};
```

## Best Practices

1. **Token Storage**
   - Access tokens: Memory/short-term storage
   - Refresh tokens: Secure HTTP-only cookies (recommended)

2. **Error Handling**
   - Always include error codes for frontend handling
   - Clear expired tokens from database
   - Proper logging of token-related issues

3. **Security Measures**
   - Use strong JWT secrets
   - Implement rate limiting
   - Regular token cleanup
   - Monitor for suspicious activity

4. **Token Lifecycle**
   - Issue both tokens at login
   - Rotate refresh tokens on use
   - Clear both tokens at logout
   - Handle expired tokens gracefully

## Key Differences

### 1. Lifetime Configuration
```