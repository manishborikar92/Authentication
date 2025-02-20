# Authentication API Documentation

## Base URL
```
http://localhost:3000/api/auth
```
## Workflow
1. Register User
2. Verify OTP
3. Login
4. Refresh Token
5. Logout
6. Forgot Password
7. Reset Password

- User should authmatically logout if the refresh token is expired

## Endpoints

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

