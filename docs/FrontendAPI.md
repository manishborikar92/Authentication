# Frontend API Integration Guide

## Setup

1. First, set up axios with interceptors:

```typescript:src/api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add access token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await api.post('/auth/refresh-token', { refreshToken });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (error) {
        if (error.response?.data?.code === 'REFRESH_TOKEN_EXPIRED') {
          localStorage.clear();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

## Authentication API Calls

### 1. Register
```typescript
const register = async (data: { name: string; email: string; password: string }) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};
```

### 2. Verify OTP
```typescript
const verifyOTP = async (data: { email: string; otp: string }) => {
  const response = await api.post('/auth/verify-otp', data);
  return response.data;
};
```

### 3. Login
```typescript
const login = async (data: { email: string; password: string }) => {
  const response = await api.post('/auth/login', data);
  const { accessToken, refreshToken } = response.data;
  
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  
  return response.data;
};
```

### 4. Logout
```typescript
const logout = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  await api.post('/auth/logout', { refreshToken });
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
```

### 5. Forgot Password
```typescript
const forgotPassword = async (data: { email: string }) => {
  const response = await api.post('/auth/forgot-password', data);
  return response.data;
};
```

### 6. Reset Password
```typescript
const resetPassword = async (data: { 
  email: string; 
  otp: string; 
  newPassword: string; 
}) => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};
```

### 7. Get User Profile
```typescript
const getProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
```

## Error Handling

```typescript
interface ApiError {
  message: string;
  code?: string;
}

try {
  await someApiCall();
} catch (error) {
  if (axios.isAxiosError(error) && error.response) {
    const apiError = error.response.data as ApiError;
    
    switch (apiError.code) {
      case 'TOKEN_EXPIRED':
        // Handle by interceptor
        break;
      case 'REFRESH_TOKEN_EXPIRED':
        // Clear auth state and redirect to login
        localStorage.clear();
        window.location.href = '/login';
        break;
      case 'INVALID_TOKEN_TYPE':
        console.error('Wrong token type used');
        break;
      default:
        // Show error message to user
        console.error(apiError.message);
    }
  }
}
```

## Usage Example

```typescript
// Authentication Context
interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      const userResponse = await api.get('/auth/me');
      setUser(userResponse.data.user);
    } catch (error) {
      // Handle error
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {
        refreshToken: localStorage.getItem('refreshToken')
      });
    } finally {
      localStorage.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Protected Route Component

```typescript
const ProtectedRoute: React.FC = ({ children }) => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      navigate('/login');
    }
  }, [auth?.isAuthenticated]);

  return auth?.isAuthenticated ? children : null;
};
```

## Notes

1. Store tokens:
   - Access token in memory (localStorage for demo)
   - Refresh token in httpOnly cookie (recommended for production)

2. Error handling:
   - Token expiration handled automatically by interceptor
   - Other errors should be handled in components

3. Security:
   - Clear all tokens on logout
   - Redirect to login on refresh token expiration
   - Handle concurrent requests during token refresh

4. State management:
   - Use context for auth state
   - Update user data after successful login
   - Clear state on logout 