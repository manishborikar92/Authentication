# Authentication API Documentation

## Overview
This document outlines the authentication endpoints and their usage for the API service.

## Base URL
```
http://localhost:3000/api/auth
```

## Authentication Flow
1. User registers with email/password
2. User verifies email via OTP
3. User logs in to receive access and refresh tokens
4. Access token is used for API requests
5. Refresh token is used to obtain new access tokens
6. User can logout to invalidate tokens

## Token Management
- Access tokens are short-lived JWT tokens (15 minutes)
- Refresh tokens are long-lived JWT tokens (7 days)
- System automatically logs out users when refresh token expires
- All protected routes require `Authorization: Bearer <access_token>` header

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
  message: string;  // "Registration initiated. OTP sent to your email."
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
  accessToken: string;   // JWT access token
  refreshToken: string;  // JWT refresh token
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
  accessToken: string;  // New JWT access token
}
```

**Error Responses:**
- 403: Forbidden
  ```typescript
  {
    message: "Refresh token not found." |
             "Refresh token expired. Please log in again." |
             "Invalid refresh token."
  }
  ```

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
}
```

**Error Responses:**
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

### 8. Protected Route Example
**Endpoint:** `GET /protected`

**Headers Required:**
```typescript
{
  Authorization: "Bearer <access_token>"
}
```

**Success Response:** (200)
```typescript
{
  message: "You have accessed a protected route!",
  user: {
    id: string;
    name: string;
    email: string;
  }
}
```

**Error Responses:**
- 401: Unauthorized
  ```typescript
  {
    message: "Access token is required." |
             "Invalid token."
  }
  ```

## Notes
1. All error responses follow the same structure with a `message` property.
2. OTP expiration time is configurable (default in minutes).
3. Password requirements: minimum 6 characters.
4. Access tokens and refresh tokens are JWT-based.
5. All protected routes require the Authorization header with a valid access token.

