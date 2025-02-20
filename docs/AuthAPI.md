# Authentication API Documentation

## Overview
This document outlines the authentication endpoints and their usage for the API service.

## Base URL
```
http://localhost:5000/api/auth
```

## Authentication Flow
1. User registers with email/password
2. User verifies email via OTP
3. User logs in to receive access and refresh tokens
4. Access token is used for API requests
5. Refresh token is used to obtain new access tokens
6. System automatically logs out users and navigates to login page when refresh token expires

## Token Management
- Access tokens are short-lived JWT tokens (15 minutes) with 'api:access' audience
- Refresh tokens are long-lived JWT tokens (7 days) with 'api:refresh' audience
- System automatically handles token refresh when access token expires
- All protected routes require `Authorization: Bearer <access_token>` header
- Refresh tokens are stored in database with expiration dates
- Each refresh token operation generates a new refresh token pair
- Old refresh tokens are automatically invalidated when new ones are issued

## API Endpoints

### 1. Register User
**Endpoint:** `POST /register`

**Input:**
```typescript
{
  name: string;     // Required, non-empty
  email: string;    // Required, valid email format
  password: string; // Required, minimum 6 characters
}
```

**Success Response:** (201)
```typescript
{
  message: "Registration initiated. OTP sent to your email."
}
```

**Error Responses:**
- 400: Bad Request
  ```typescript
  {
    message: "User already registered. Please login." |
             "Name, email, and password are required."
  }
  ```
- 500: Server Error
  ```typescript
  {
    message: "Error during registration."
  }
  ```

### 2. Verify OTP
**Endpoint:** `POST /verify-otp`

**Input:**
```typescript
{
  email: string;  // Required, valid email
  otp: string;    // Required, non-empty
}
```

**Success Response:** (200)
```typescript
{
  message: "Registration verified successfully. You can now log in."
}
```

**Error Responses:**
- 400: Bad Request
  ```typescript
  {
    message: "No pending registration for this email." |
             "OTP expired. Please register again." |
             "Invalid OTP."
  }
  ```
- 500: Server Error
  ```typescript
  {
    message: "Error verifying OTP."
  }
  ```

### 3. Login
**Endpoint:** `POST /login`

**Input:**
```typescript
{
  email: string;    // Required, valid email
  password: string; // Required, non-empty
}
```

**Success Response:** (200)
```typescript
{
  accessToken: string;          // JWT access token
  refreshToken: string;         // JWT refresh token
  expiresIn: string;           // Access token expiration (e.g. "15m")
  refreshTokenExpiry: Date;     // Refresh token expiration date (e.g. "2025-02-27T16:43:44.454Z")
}
```

**Error Responses:**
- 400: Bad Request
  ```typescript
  {
    message: "Invalid credentials."
  }
  ```
- 500: Server Error
  ```typescript
  {
    message: "Error during login."
  }
  ```

### 4. Refresh Token
**Endpoint:** `POST /refresh-token`

**Input:**
```typescript
{
  refreshToken: string;  // Required, valid refresh token
}
```

**Success Response:** (200)
```typescript
{
  accessToken: string;          // New JWT access token
  refreshToken: string;         // New JWT refresh token
  expiresIn: string;           // Access token expiration (e.g. "15m")
  refreshTokenExpiry: Date;     // Refresh token expiration date (e.g. "2025-02-27T16:43:44.454Z")
}
```

**Error Responses:**
- 403: Forbidden
  ```typescript
  {
    message: "Refresh token is required" |
             "Refresh token expired" |
             "Invalid refresh token",
    code: "REFRESH_TOKEN_REQUIRED" |
          "REFRESH_TOKEN_EXPIRED" |
          "INVALID_REFRESH_TOKEN"
  }
  ```
Note: When receiving "REFRESH_TOKEN_EXPIRED", the system will:
- Clear auth state (tokens and user data)
- Redirect to login page
- Require user to log in again

### 5. Logout
**Endpoint:** `POST /logout`

**Input:**
```typescript
{
  refreshToken: string;  // Required
}
```

**Success Response:** (200)
```typescript
{
  message: "Logged out successfully."
  code: "LOGOUT_SUCCESS"
}
```

**Error Responses:**
- 400: Bad Request
  ```typescript
  {
    message: "Refresh token is required." |
             "Refresh token expired." |
             "Invalid refresh token.",
    code: "REFRESH_TOKEN_REQUIRED" |
          "REFRESH_TOKEN_EXPIRED" |
          "INVALID_REFRESH_TOKEN"
  }
  ```
- 500: Server Error
  ```typescript
  {
    message: "Error during logout."
  }
  ```

### 6. Forgot Password
**Endpoint:** `POST /forgot-password`

**Input:**
```typescript
{
  email: string;  // Required, valid email
}
```

**Success Response:** (200)
```typescript
{
  message: "If that email exists, an OTP has been sent."
}
```

**Error Responses:**
- 500: Server Error
  ```typescript
  {
    message: "Error initiating password reset."
  }
  ```

### 7. Reset Password
**Endpoint:** `POST /reset-password`

**Input:**
```typescript
{
  email: string;      // Required, valid email
  otp: string;        // Required, non-empty
  newPassword: string; // Required, minimum 6 characters
}
```

**Success Response:** (200)
```typescript
{
  message: "Password has been reset successfully."
}
```

**Error Responses:**
- 400: Bad Request
  ```typescript
  {
    message: "No password reset request found for this email." |
             "OTP expired. Please request a new one." |
             "Invalid OTP." |
             "User not found." |
             "New password must be different from the current password."
  }
  ```
- 500: Server Error
  ```typescript
  {
    message: "Error resetting password."
  }
  ```

## Error Handling

### Token Errors
1. Access Token Errors (401):
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

2. Refresh Token Errors (403):
```typescript
{
  message: string;
  code: 'REFRESH_TOKEN_REQUIRED' |
        'INVALID_TOKEN_TYPE' |
        'INVALID_REFRESH_TOKEN' |
        'REFRESH_TOKEN_EXPIRED';
}
```

### System Behavior
- On `TOKEN_EXPIRED`: Frontend should attempt token refresh
- On `REFRESH_TOKEN_EXPIRED`: System will:
  - Clear auth state
  - Redirect to login
  - Require re-authentication
- On `INVALID_TOKEN_TYPE`: System will reject the request
- On other errors: Display appropriate error message

## Notes
1. All error responses follow the same structure with a `message` property
2. OTP expiration time is configurable (default in minutes)
3. Password requirements: minimum 6 characters
4. Access tokens and refresh tokens are JWT-based
5. All protected routes require the Authorization header with a valid access token
6. System handles concurrent requests during token refresh
7. Automatic logout and redirect occurs on refresh token expiration

