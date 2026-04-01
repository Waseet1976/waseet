"use client";

import {
  createContext, useContext,
  useState, useEffect, useCallback,
  type ReactNode,
} from "react";
import type { RegisterInput, LoginInput } from "@/lib/validations/auth";

// ── Types ─────────────────────────────────────────────────────

interface AuthUser {
  id:           string;
  email:        string;
  firstName:    string;
  lastName:     string;
  phone:        string | null;
  country:      string | null;
  role:         string;
  referralCode: string;
  agencyId:     string | null;
  agency:       { id: string; name: string; isActive: boolean } | null;
  agentProfile: { id: string; photo: string | null; fonction: string | null } | null;
  _count:       { notifications: number };
}

interface AuthState {
  user:            AuthUser | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
  error:           string | null;
}

interface AuthContextValue extends AuthState {
  login:      (credentials: LoginInput) => Promise<{ success: boolean; error?: string }>;
  register:   (data: RegisterInput)     => Promise<{ success: boolean; error?: string }>;
  logout:     () => void;
  clearError: () => void;
}

const TOKEN_KEY = "waseet_token";

// ── Helpers ───────────────────────────────────────────────────

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Cookie lu par le middleware pour protéger les routes côté serveur
const AUTH_COOKIE = "waseet_auth";

function setAuthCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=604800; SameSite=Lax`;
}

function clearAuthCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res  = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json.error ?? "Erreur serveur" };
    return { data: json as T, error: null };
  } catch {
    return { data: null, error: "Impossible de contacter le serveur" };
  }
}

// ── Context ───────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user:            null,
    isLoading:       true,
    isAuthenticated: false,
    error:           null,
  });

  const fetchMe = useCallback(async (token: string) => {
    const { data, error } = await apiFetch<{ user: AuthUser }>("/api/auth/me", {
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${token}`,
      },
    });

    if (error || !data) {
      removeStoredToken();
      clearAuthCookie();
      setState({ user: null, isLoading: false, isAuthenticated: false, error: null });
      return;
    }

    setAuthCookie();
    setState({
      user:            data.user,
      isLoading:       false,
      isAuthenticated: true,
      error:           null,
    });
  }, []);

  // Charge l'utilisateur une seule fois au montage.
  // Dépendances vides intentionnelles : fetchMe est stable (useCallback []).
  // En React Strict Mode, [fetchMe] provoquerait un double-appel car la référence
  // est recréée à chaque montage, ce qui cause la boucle infinie en développement.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      fetchMe(token);
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []); // [] = une seule exécution au montage

  const login = useCallback(
    async (credentials: LoginInput): Promise<{ success: boolean; error?: string }> => {
      setState((s) => ({ ...s, isLoading: true, error: null }));

      const { data, error } = await apiFetch<{ user: AuthUser; token: string }>(
        "/api/auth/login",
        { method: "POST", body: JSON.stringify(credentials) }
      );

      if (error || !data) {
        setState((s) => ({ ...s, isLoading: false, error: error ?? "Erreur inconnue" }));
        return { success: false, error: error ?? "Erreur inconnue" };
      }

      setStoredToken(data.token);
      setAuthCookie();
      setState({ user: data.user, isLoading: false, isAuthenticated: true, error: null });
      return { success: true };
    },
    []
  );

  const register = useCallback(
    async (data: RegisterInput): Promise<{ success: boolean; error?: string }> => {
      setState((s) => ({ ...s, isLoading: true, error: null }));

      const { data: res, error } = await apiFetch<{ user: AuthUser; token: string }>(
        "/api/auth/register",
        { method: "POST", body: JSON.stringify(data) }
      );

      if (error || !res) {
        setState((s) => ({ ...s, isLoading: false, error: error ?? "Erreur inconnue" }));
        return { success: false, error: error ?? "Erreur inconnue" };
      }

      setStoredToken(res.token);
      setAuthCookie();
      setState({ user: res.user, isLoading: false, isAuthenticated: true, error: null });
      return { success: true };
    },
    []
  );

  const logout = useCallback(() => {
    removeStoredToken();
    clearAuthCookie();
    setState({ user: null, isLoading: false, isAuthenticated: false, error: null });
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook public ──────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>");
  return ctx;
}
