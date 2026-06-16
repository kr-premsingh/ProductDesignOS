"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type User = { id: string; username: string; email?: string; display_name?: string } | null;

type AuthContextValue = {
  user: User;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('pdos_auth');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setToken(parsed.token || null);
        setUser(parsed.user || null);
      } catch (err) {}
    }
  }, []);

  async function login(username: string, password: string) {
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    if (!res.ok) throw new Error('Invalid credentials');
    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('pdos_auth', JSON.stringify({ token: data.token, user: data.user }));
  }

  async function signup(username: string, email: string, password: string, role: string) {
    const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password, role }) });
    if (!res.ok) throw new Error('Signup failed');
    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('pdos_auth', JSON.stringify({ token: data.token, user: data.user }));
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('pdos_auth');
  }

  return <AuthContext.Provider value={{ user, token, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export default AuthContext;
