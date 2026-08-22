"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { mockUsers, type MockUser, type Role } from "./mock-users";

type LoginResult = { ok: true; user: MockUser } | { ok: false; error: string };

type AuthState = {
  user: MockUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => LoginResult;
  loginAs: (id: string) => MockUser | null;
  register: (input: {
    name: string;
    email: string;
    role: Exclude<Role, "admin">;
  }) => MockUser;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);
const STORAGE_KEY = "clippifi.session";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const chars = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return chars.join("") || "?";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setUser(JSON.parse(stored) as MockUser);
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setIsLoading(false);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const persist = (next: MockUser) => {
    setUser(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const login = (email: string, password: string): LoginResult => {
    const found = mockUsers.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password
    );
    if (!found) return { ok: false, error: "Invalid email or password." };
    persist(found);
    return { ok: true, user: found };
  };

  const loginAs = (id: string) => {
    const found = mockUsers.find((u) => u.id === id);
    if (!found) return null;
    persist(found);
    return found;
  };

  const register: AuthState["register"] = ({ name, email, role }) => {
    const next: MockUser = {
      id: `local-${Date.now()}`,
      name,
      username: name.toLowerCase().replace(/\s+/g, ""),
      email,
      password: "",
      role,
      initials: initials(name),
    };
    persist(next);
    return next;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginAs, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
