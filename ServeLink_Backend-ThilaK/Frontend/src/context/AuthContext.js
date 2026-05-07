import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loginRequest, registerRequest } from '../services/authService';
import { setAuthToken } from '../services/api';
import { getMyProfileRequest, updateMyProfileRequest } from '../services/userService';
import { STORAGE_KEYS } from '../utils/constants';
import { getStoredObject, removeStoredObject, setStoredObject } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: '', user: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const boot = async () => {
      const stored = await getStoredObject(STORAGE_KEYS.auth);
      if (stored?.token) {
        setAuth(stored);
        setAuthToken(stored.token);
      }
      setLoading(false);
    };

    boot();
  }, []);

  const persist = async value => {
    setAuth(value);
    setAuthToken(value.token);
    await setStoredObject(STORAGE_KEYS.auth, value);
  };

  const login = async credentials => {
    setError('');
    try {
      const data = await loginRequest(credentials);
      const payload = { token: data.token, user: data.user };
      await persist(payload);
      return data;
    } catch (apiError) {
      const message = apiError?.response?.data?.message || 'Login failed.';
      setError(message);
      throw apiError;
    }
  };

  const register = async values => {
    setError('');
    try {
      const data = await registerRequest(values);
      const payload = { token: data.token, user: data.user };
      await persist(payload);
      return data;
    } catch (apiError) {
      const message = apiError?.response?.data?.message || 'Registration failed.';
      setError(message);
      throw apiError;
    }
  };

  const logout = async () => {
    setAuth({ token: '', user: null });
    setAuthToken('');
    await removeStoredObject(STORAGE_KEYS.auth);
  };

  const refreshProfile = async () => {
    const profile = await getMyProfileRequest();
    const nextAuth = { ...auth, user: { ...(auth.user || {}), ...profile } };
    await persist(nextAuth);
    return nextAuth.user;
  };

  const updateProfile = async payload => {
    const user = await updateMyProfileRequest(payload);
    const nextAuth = { ...auth, user };
    await persist(nextAuth);
    return user;
  };

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      isAuthenticated: Boolean(auth.token),
      loading,
      error,
      login,
      register,
      logout,
      refreshProfile,
      updateProfile,
    }),
    [auth, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used inside AuthProvider');
  return context;
};
