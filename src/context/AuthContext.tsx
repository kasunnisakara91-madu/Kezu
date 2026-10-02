import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Admin, SystemSettings } from '../types.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  admin: Admin | null;
  adminToken: string | null;
  systemInfo: SystemSettings | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  register: (token: string, user: User) => void;
  logout: () => void;
  adminLogin: (token: string, admin: Admin) => void;
  adminLogout: () => void;
  refreshUser: () => Promise<void>;
  refreshSystemInfo: () => Promise<void>;
  regenerateUserApiKey: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('crim_user_token'));
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('crim_admin_token'));
  const [systemInfo, setSystemInfo] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load public system information
  const refreshSystemInfo = async () => {
    try {
      const res = await fetch('/api/public/info');
      if (res.ok) {
        const data = await res.json();
        setSystemInfo(data);
      }
    } catch (err) {
      console.warn('Failed to load system info:', err);
    }
  };

  // Fetch current user session
  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status && data.user) {
          setUser(data.user);
        }
      } else {
        // Token expired or invalid
        logout();
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  // Fetch current admin session
  const verifyAdmin = async () => {
    if (!adminToken) {
      setAdmin(null);
      return;
    }
    try {
      const res = await fetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status && data.admin) {
          setAdmin(data.admin);
        }
      } else {
        adminLogout();
      }
    } catch {
      adminLogout();
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([refreshSystemInfo(), refreshUser(), verifyAdmin()]);
      setLoading(false);
    };
    init();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('crim_user_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const register = (newToken: string, newUser: User) => {
    localStorage.setItem('crim_user_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('crim_user_token');
    setToken(null);
    setUser(null);
  };

  const adminLogin = (newToken: string, newAdmin: Admin) => {
    localStorage.setItem('crim_admin_token', newToken);
    setAdminToken(newToken);
    setAdmin(newAdmin);
  };

  const adminLogout = () => {
    localStorage.removeItem('crim_admin_token');
    setAdminToken(null);
    setAdmin(null);
  };

  const regenerateUserApiKey = async (): Promise<string | null> => {
    if (!token) return null;
    try {
      const res = await fetch('/api/auth/regenerate-key', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status && data.apiKey) {
          if (user) {
            setUser({ ...user, apiKey: data.apiKey });
          }
          return data.apiKey;
        }
      }
    } catch (err) {
      console.error('Failed to regenerate key:', err);
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        admin,
        adminToken,
        systemInfo,
        loading,
        login,
        register,
        logout,
        adminLogin,
        adminLogout,
        refreshUser,
        refreshSystemInfo,
        regenerateUserApiKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
