import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const stored = localStorage.getItem('aasanUser');
      if (stored) {
        try {
          const res = await fetch(`${API_URL}/api/auth/profile`, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
          } else {
            localStorage.removeItem('aasanUser'); // Stale session
          }
        } catch (e) {
          console.error("Profile refresh failed", e);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    delete data.token; // Ensure token is not saved to localStorage
    setUser(data);
    localStorage.setItem('aasanUser', JSON.stringify(data));
    return data;
  };

  const register = async (name, email, password, phone) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone }),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    delete data.token;
    setUser(data);
    localStorage.setItem('aasanUser', JSON.stringify(data));
    return data;
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {}
    setUser(null);
    localStorage.removeItem('aasanUser');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
