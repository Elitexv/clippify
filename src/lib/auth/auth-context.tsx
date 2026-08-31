"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  loginWithFirebase,
  logoutFromFirebase,
  registerWithFirebase,
  signInWithOAuth,
  subscribeToAuth,
  type AppUser,
} from "@/lib/firebase-helpers";
import type { AppRole } from "@/lib/firebase-helpers";

type LoginResult = { ok: true; user: AppUser } | { ok: false; error: string };

export function getDashboardRouteForRole(role?: AppRole | null) {
  if (role === "admin") return "/admin";
  if (role === "brand" || role === "both") return "/dashboard?view=brand";
  if (role === "creator") return "/dashboard?view=creator";
  return "/dashboard";
}

type AuthState = {
  user: AppUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  loginAs: (id: string) => Promise<AppUser | null>;
  register: (input: {
    name: string;
    username?: string;
    email: string;
    password: string;
    role: Exclude<AppRole, "admin">;
  }) => Promise<AppUser>;
  signInWithGoogle: () => Promise<LoginResult>;
  signInWithApple: () => Promise<LoginResult>;
  logout: () => Promise<void>;
  getDashboardRoute: (role?: AppRole | null) => string;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const nextUser = await loginWithFirebase(email.trim(), password);
      if (!nextUser) {
        return { ok: false, error: "No account found for this email." };
      }
      setUser(nextUser);
      return { ok: true, user: nextUser };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Invalid email or password.";
      return { ok: false, error: message };
    }
  };

  const loginAs = async (_id: string) => {
    return null;
  };

  const register: AuthState["register"] = async ({ name, username, email, password, role }) => {
    const resolvedUsername = (username ?? name).trim() || name.trim() || "creator";
    try {
      const nextUser = await registerWithFirebase({
        name,
        username: resolvedUsername,
        email: email.trim(),
        password,
        role,
      });
      setUser(nextUser);
      return nextUser;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to create account.";
      throw new Error(message);
    }
  };

  const signInWithGoogle = async (): Promise<LoginResult> => {
    try {
      const nextUser = await signInWithOAuth("google");
      setUser(nextUser);
      return { ok: true, user: nextUser };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Google sign-in failed.";
      return { ok: false, error: message };
    }
  };

  const signInWithApple = async (): Promise<LoginResult> => {
    try {
      const nextUser = await signInWithOAuth("apple");
      setUser(nextUser);
      return { ok: true, user: nextUser };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Apple sign-in failed.";
      return { ok: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await logoutFromFirebase();
    } catch {
      // Firebase may not be configured in mock/demo flows.
    }
    setUser(null);
  };

  const getDashboardRoute = (role?: AppRole | null) => getDashboardRouteForRole(role ?? user?.role ?? null);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, loginAs, register, signInWithGoogle, signInWithApple, logout, getDashboardRoute }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
