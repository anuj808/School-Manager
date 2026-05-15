import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { setToken as setApiToken } from '../api/axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshToken = async () => {
    try {
      const res = await api.post('/auth/refresh-token');
      const { accessToken } = res.data;
      setApiToken(accessToken);
      const decoded = jwtDecode(accessToken);
      setUser({ userId: decoded.userId, schoolId: decoded.schoolId, role: decoded.role, username: decoded.username, token: accessToken });
      return accessToken;
    } catch (err) {
      setUser(null);
      setApiToken(null);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await refreshToken();
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (school_id, username, password) => {
    const res = await api.post('/auth/login', { school_id, username, password });
    const { accessToken } = res.data;
    setApiToken(accessToken);
    const decoded = jwtDecode(accessToken);
    setUser({ userId: decoded.userId, schoolId: decoded.schoolId, role: decoded.role, username: decoded.username, token: accessToken });
    return decoded;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) { }
    setUser(null);
    setApiToken(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-indigo-600">
        Loading Session...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
