import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userLogin, userRegister, getProfile } from '../../core/api/auth';
import { setUnauthorizedHandler } from '../../core/api/client';

const AUTH_STORAGE_KEY = '@onins_auth_user';

const AuthContext = createContext();

const getAuthenticatedUser = (data, fallbackEmail) => {
  const user = data?.user || data?.data?.user || data?.data || data;
  const token = data?.token ?? data?.data?.token ?? user?.token;

  if (user && typeof user === 'object') {
    return {
      ...user,
      email: user.email || fallbackEmail,
      token,
      roles: user.roles || data?.roles,
    };
  }

  return {
    email: fallbackEmail,
    token,
    roles: data?.roles,
  };
};

const isCustomerRole = roles => {
  if (!Array.isArray(roles) || roles.length === 0) {
    return false;
  }
  return !roles.includes('ROLE_ADMIN') && !roles.includes('ROLE_STAFF');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  const enrichUserFromProfile = useCallback(async (authUser) => {
    if (!authUser?.token) {
      return authUser;
    }
    if (Array.isArray(authUser.roles) && authUser.roles.length > 0) {
      return authUser;
    }
    try {
      const profileResponse = await getProfile(authUser.token);
      const profile = profileResponse?.data ?? profileResponse;
      return {
        ...authUser,
        ...profile,
        token: authUser.token,
        roles: profile?.roles ?? authUser.roles,
      };
    } catch {
      return authUser;
    }
  }, []);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          setIsHydrating(false);
          enrichUserFromProfile(parsed)
            .then(enriched => setUser(enriched))
            .catch(() => {});
          return;
        }
      } catch {
        // ignore corrupt storage
      }
      setIsHydrating(false);
    };
    hydrate();
  }, [enrichUserFromProfile]);

  useEffect(() => {
    const persist = async () => {
      if (user?.token) {
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      }
    };
    if (!isHydrating) {
      persist();
    }
  }, [user, isHydrating]);

  const isLoggedIn = useMemo(() => !!user?.token, [user]);
  const isCustomer = useMemo(() => isCustomerRole(user?.roles), [user]);

  const login = useCallback(async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    setIsLoading(true);
    try {
      const data = await userLogin({ email, password });
      const authUser = await enrichUserFromProfile(getAuthenticatedUser(data, email));
      setUser(authUser);
      return data;
    } finally {
      setIsLoading(false);
    }
  }, [enrichUserFromProfile]);

  const register = useCallback(async ({ name, email, password }) => {
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }
    setIsLoading(true);
    try {
      const data = await userRegister({ name, email, password });
      const authUser = await enrichUserFromProfile(getAuthenticatedUser(data, email));
      setUser(authUser);
      return data;
    } finally {
      setIsLoading(false);
    }
  }, [enrichUserFromProfile]);

  const googleLogin = useCallback(async jwt => {
    if (!jwt) {
      throw new Error('Google sign-in did not return a token.');
    }
    setIsLoading(true);
    try {
      const authUser = await enrichUserFromProfile({ token: jwt });
      if (!isCustomerRole(authUser?.roles)) {
        throw new Error(
          'This account must use the web dashboard. The mobile app is for customers only.'
        );
      }
      setUser(authUser);
      return authUser;
    } finally {
      setIsLoading(false);
    }
  }, [enrichUserFromProfile]);

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const updateUser = useCallback((partial) => {
    setUser(prev => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    isHydrating,
    isLoggedIn,
    isCustomer,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
  }), [user, isLoading, isHydrating, isLoggedIn, isCustomer, login, register, googleLogin, logout, updateUser]);

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
