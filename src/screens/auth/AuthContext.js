import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const isLoggedIn = useMemo(() => !!user && user.email !== undefined, [user]);

  const login = useCallback(async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    setIsLoading(true);
    try {
      setUser({ email });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    setIsLoading(true);
    try {
      setUser({ email });
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
