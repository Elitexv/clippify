"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import AppLoader from "@/components/AppLoader";
import {
  loginWithFirebase,
  logoutFromFirebase,
  registerWithFirebase,
  requestPasswordReset,
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
  register: (input: {
    name: string;
    username?: string;
    email: string;
    password: string;
    role: Exclude<AppRole, "admin">;
  }) => Promise<AppUser>;
  signInWithGoogle: (role?: Exclude<AppRole, "admin">) => Promise<LoginResult>;
  signInWithApple: (role?: Exclude<AppRole, "admin">) => Promise<LoginResult>;
  logout: () => Promise<void>;
  getDashboardRoute: (role?: AppRole | null) => string;
  sendPasswordReset: (email: string) => Promise<{ ok: true } | { ok: false; error: string }>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Tracks the uid of the most recent profile we know for certain is real (read or
  // written directly against Firestore), so a late-arriving "no profile doc yet"
  // event from the background listener — expected right after signup, before its
  // write has landed — can't clobber it back to a default role. See subscribeToAuth().
  const realProfileUidRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((nextUser, firebaseUser, isSynthetic) => {
      if (isSynthetic && firebaseUser && realProfileUidRef.current === firebaseUser.uid) {
        setIsLoading(false);
        return;
      }
      realProfileUidRef.current = !isSynthetic && firebaseUser ? firebaseUser.uid : null;
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
      realProfileUidRef.current = nextUser.id;
      setUser(nextUser);
      return { ok: true, user: nextUser };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Invalid email or password.";
      return { ok: false, error: message };
    }
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
      realProfileUidRef.current = nextUser.id;
      setUser(nextUser);
      return nextUser;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to create account.";
      throw new Error(message);
    }
  };

  const signInWithGoogle = async (role: Exclude<AppRole, "admin"> = "creator"): Promise<LoginResult> => {
    try {
      const nextUser = await signInWithOAuth("google", role);
      realProfileUidRef.current = nextUser.id;
      setUser(nextUser);
      return { ok: true, user: nextUser };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Google sign-in failed.";
      return { ok: false, error: message };
    }
  };

  const signInWithApple = async (role: Exclude<AppRole, "admin"> = "creator"): Promise<LoginResult> => {
    try {
      const nextUser = await signInWithOAuth("apple", role);
      realProfileUidRef.current = nextUser.id;
      setUser(nextUser);
      return { ok: true, user: nextUser };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Apple sign-in failed.";
      return { ok: false, error: message };
    }
  };

  const logout = async () => {
    await logoutFromFirebase();
    realProfileUidRef.current = null;
    setUser(null);
  };

  const getDashboardRoute = (role?: AppRole | null) => getDashboardRouteForRole(role ?? user?.role ?? null);

  const sendPasswordReset = async (email: string): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      await requestPasswordReset(email.trim());
      return { ok: true };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Couldn't send reset email.";
      return { ok: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        signInWithGoogle,
        signInWithApple,
        logout,
        getDashboardRoute,
        sendPasswordReset,
      }}
    >
      {isLoading ? <AppLoader /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
