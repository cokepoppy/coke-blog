import { createContext, useContext, useState, useEffect } from 'react';
import { endpoints } from '../config/api';

export type UserRole = 'admin' | 'editor' | 'author' | 'reader';

export interface User {
  id: number;
  username: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  const login = async (email: string, password: string) => {
    // Using fetch to match design doc, but could use axios
    const response = await fetch(endpoints.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      // The backend returns { code: 200, message: "...", data: { user, accessToken, refreshToken } }
      // Adjust based on actual backend response structure. 
      // Assuming standard structure from response.ts utils: { success: true, data: ... }
      // Let's verify response structure in next steps if needed, but standard is usually data.data
      
      // Based on AuthController:
      // return successResponse(res, result, '登录成功');
      // successResponse format: { code, message, data: data }
      
      const { accessToken, user: loggedInUser } = data.data;
      setUser(loggedInUser);
      localStorage.setItem('token', accessToken);
      // Optional: Store refresh token if backend sends it
      if (data.data.refreshToken) {
        localStorage.setItem('refreshToken', data.data.refreshToken);
      }
    } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    // Optional: Call backend logout endpoint
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch(endpoints.me, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          // Assuming response.data contains the user
          setUser(data.data);
        } else {
          // Token might be invalid/expired
          logout();
        }
      } catch (error) {
        console.error("Auth check failed", error);
        logout();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout, checkAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
