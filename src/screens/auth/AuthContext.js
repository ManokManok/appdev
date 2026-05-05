import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { userLogin, userRegister } from '../../app/api/auth';

const AuthContext = createContext();

const getAuthenticatedUser = (data, fallbackEmail) => {
  const user = data?.user || data?.data?.user || data?.data || data;

  if (user && typeof user === 'object') {
    return {
      ...user,
      email: user.email || fallbackEmail,
      token: user.token || data?.token || data?.access_token,
    };
  }

  return {
    email: fallbackEmail,
    token: data?.token || data?.access_token,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isLoggedIn = useMemo(() => !!user?.email, [user]);

  const login = useCallback(async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    setIsLoading(true);
    try {
      const data = await userLogin({ email, password });
      setUser(getAuthenticatedUser(data, email));
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }
    setIsLoading(true);
    try {
      const data = await userRegister({ name, email, password });
      setUser(getAuthenticatedUser(data, email));
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    isLoggedIn,
    login,
    register,
    logout,
  }), [user, isLoading, isLoggedIn, login, register, logout]);

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext;
