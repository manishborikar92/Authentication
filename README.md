# Advanced Authentication System

A production-ready authentication system featuring advanced security measures, two-step registration with OTP verification, JWT-based authentication (access & refresh tokens), robust input validation, data sanitization, rate limiting, and centralized logging. The system is built with:

- **Backend:** Node.js, TypeScript, Express, MongoDB (via Mongoose)
- **Frontend:** React (with Vite), React Router, Axios

---

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Usage](#usage)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Two-Step Registration:**  
  Temporary user registration with OTP verification.
- **Secure Login:**  
  Password hashing using bcrypt, and JWT-based authentication.
- **Token Management:**  
  Issues both short-lived access tokens and long-lived refresh tokens.
- **Token Refresh & Logout:**  
  Refresh token endpoint to renew access tokens; logout endpoint clears refresh tokens.
- **Robust Security:**  
  - CORS configured to allow requests from trusted origins.
  - Input validation with `express-validator`.
  - Data sanitization with `express-mongo-sanitize`.
  - Security headers via Helmet.
  - Rate limiting to prevent abuse.
- **Centralized Logging:**  
  Logging implemented using Winston.
- **Modern Frontend:**  
  A React (Vite) frontend with protected routes, authentication context, and Axios interceptors for token management.

---

## Technologies Used

- **Backend:**  
  Node.js, TypeScript, Express, MongoDB, Mongoose, JSON Web Tokens (JWT), bcrypt, cors, helmet, express-rate-limit, express-validator, express-mongo-sanitize, winston

- **Frontend:**  
  React, Vite, React Router, Axios

---

## Prerequisites

- **Node.js:** v14 or later (LTS recommended)
- **MongoDB:** Local instance or a cloud-based MongoDB service
- **Package Manager:** npm or yarn

---

## Project Structure

```
advanced-auth-system/
advanced-auth-system/
├── backend/
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   └── src
│       ├── app.ts
│       ├── server.ts
│       ├── config
│       │   ├── config.ts
│       │   └── database.ts
│       ├── controllers
│       │   └── authController.ts
│       ├── middleware
│       │   ├── authMiddleware.ts
│       │   ├── errorHandler.ts
│       │   └── validationMiddleware.ts
│       ├── models
│       │   ├── User.ts
│       │   ├── TempUser.ts
│       │   ├── RefreshToken.ts
│       │   └── PasswordReset.ts   <-- New: For storing password reset OTPs
│       ├── routes
│       │   └── authRoutes.ts
│       ├── services
│       │   ├── authService.ts
│       │   └── emailService.ts
│       ├── templates
│       │   └── email
│       │       ├── otp.hbs
│       │       └── resetPassword.hbs   <-- New: Email template for password reset
│       └── utils
│           └── logger.ts
└── frontend/
    ├── .env
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    └── src
        ├── main.tsx
        ├── App.tsx
        ├── api.ts
        ├── context
        │   └── AuthContext.tsx
        ├── hooks
        │   └── useAuth.ts
        ├── routes
        │   └── AppRoutes.tsx
        ├── pages
        │   ├── Login.tsx
        │   ├── Register.tsx
        │   ├── VerifyOTP.tsx
        │   ├── Dashboard.tsx
        │   └── ProtectedPage.tsx
        └── index.css
```

---

## Installation and Setup

### Backend

1. **Clone the repository** and navigate to the `backend` directory.

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` file** in the `backend` root with the following content (adjust values as needed):

   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=15m
   REFRESH_TOKEN_EXPIRES_IN=7d
   OTP_EXPIRATION_MINUTES=5
   BCRYPT_SALT_ROUNDS=10
   MONGO_URI=mongodb://localhost:27017/advanced_auth_system
   ```

4. **Run the backend** in development mode:

   ```bash
   npm run dev
   ```

   Or build and run in production mode:

   ```bash
   npm run build
   npm start
   ```

   The backend will start on `http://localhost:5000`.

### Frontend

1. **Navigate to the `frontend` directory.**

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` file** in the `frontend` root with the following content:

   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Run the frontend** in development mode:

   ```bash
   npm run dev
   ```

   The frontend application will be available at `http://localhost:5173`.

---

## Usage

- **Registration:**
  - Visit `/register` and complete the form to initiate registration.
  - An OTP will be generated (in demo mode, the OTP is returned in the response) and sent to your email.
  - The email used for registration is stored temporarily.

- **OTP Verification:**
  - Visit `/verify-otp` to enter the OTP and complete your registration.
  - Once verified, you can log in.

- **Login:**
  - Visit `/login` and provide your email and password.
  - On successful login, an access token and a refresh token are issued.
  - The access token is stored in localStorage and attached automatically to API requests.

- **Password Reset:**
  - **Forgot Password:** Visit `/forgot-password` and provide your email. The system checks if the email exists in the database and, if so, sends an OTP to the email address.
  - **Reset Password:** Visit `/reset-password` with your email, the received OTP, and a new password. The system verifies the OTP and enforces that the new password is different from the existing one.

- **Protected Routes:**
  - Access the `/dashboard` or `/protected` routes which require authentication.
  - Axios interceptors will automatically attempt a token refresh if the access token expires.

- **Logout:**
  - Click the Logout button from the dashboard to end your session and clear tokens.

---

## Security Considerations

- **CORS:**  
  The backend is configured using the `cors` middleware to allow requests from the frontend's origin (e.g., `http://localhost:5173`).

- **Input Validation & Sanitization:**  
  Uses `express-validator` for validating inputs and `express-mongo-sanitize` to prevent NoSQL injection attacks.

- **HTTP Security Headers:**  
  Configured via Helmet to secure HTTP headers.

- **Rate Limiting:**  
  Implemented using `express-rate-limit` to mitigate brute force and DDoS attacks.

- **Token Security:**  
  - Access tokens (short-lived) with 'api:access' audience
  - Refresh tokens (long-lived) with 'api:refresh' audience
  - Refresh tokens stored in database with expiration tracking
  - Automatic token rotation on refresh
  - Old refresh tokens invalidated when new ones are issued

- **Logging:**  
  Winston is used for centralized logging, which can be extended to include file or remote transports.

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests with any improvements or bug fixes.

---

## License

This project is licensed under the MIT License.

---

*Note:* In a production environment, ensure that environment variables and sensitive secrets are securely managed. Additionally, consider using HTTPS and integrating a robust email/SMS service for OTP delivery.
```

---

This `README.md` covers the project overview, features, setup instructions for both backend and frontend, usage guidelines, security considerations, and contribution information.