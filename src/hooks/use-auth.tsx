import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AuthUser {
  id: string;
  email: string | null;
  username: string | null;
  googleId: string | null;
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (data: { email?: string; username?: string; password: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'dialflo_auth_user';
const USERS_KEY = 'dialflo_users';

function getStoredUsers(): Array<AuthUser & { passwordHash: string }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: Array<AuthUser & { passwordHash: string }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Simple hash for mock purposes (NOT for production)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return String(hash);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const persistUser = (u: AuthUser) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  };

  const signup = useCallback(async (data: { email?: string; username?: string; password: string }) => {
    await new Promise(r => setTimeout(r, 400)); // simulate network
    if (!data.email && !data.username) throw new Error('Email or username is required');
    if (data.password.length < 8) throw new Error('Password must be at least 8 characters');

    const users = getStoredUsers();
    if (data.email && users.find(u => u.email === data.email)) {
      throw new Error('A user with this email already exists');
    }
    if (data.username && users.find(u => u.username === data.username)) {
      throw new Error('A user with this username already exists');
    }

    const newUser: AuthUser & { passwordHash: string } = {
      id: crypto.randomUUID(),
      email: data.email || null,
      username: data.username || null,
      googleId: null,
      createdAt: new Date().toISOString(),
      passwordHash: simpleHash(data.password),
    };
    users.push(newUser);
    saveUsers(users);

    const { passwordHash: _, ...safeUser } = newUser;
    persistUser(safeUser);
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    await new Promise(r => setTimeout(r, 400));
    const users = getStoredUsers();
    const found = users.find(
      u => (u.email === identifier || u.username === identifier) && u.passwordHash === simpleHash(password)
    );
    if (!found) throw new Error('Invalid credentials');
    const { passwordHash: _, ...safeUser } = found;
    persistUser(safeUser);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await new Promise(r => setTimeout(r, 600));
    const googleEmail = `user${Math.floor(Math.random() * 10000)}@gmail.com`;
    const users = getStoredUsers();
    let existing = users.find(u => u.email === googleEmail);
    if (!existing) {
      const newUser: AuthUser & { passwordHash: string } = {
        id: crypto.randomUUID(),
        email: googleEmail,
        username: null,
        googleId: `google_${crypto.randomUUID().slice(0, 8)}`,
        createdAt: new Date().toISOString(),
        passwordHash: '',
      };
      users.push(newUser);
      saveUsers(users);
      existing = newUser;
    }
    const { passwordHash: _, ...safeUser } = existing;
    persistUser(safeUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
