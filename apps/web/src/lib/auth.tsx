import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { MeResponse } from "@struct-flow/shared";
import { api, ApiError } from "./api";

export type Me = MeResponse;

interface AuthCtx {
  me: Me | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<Me>;
  login: (email: string, password: string) => Promise<Me>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const next = await api<Me>("/api/auth/me");
      setMe(next);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setMe(null);
      } else {
        throw err;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signup = useCallback<AuthCtx["signup"]>(async (email, password, displayName) => {
    const next = await api<Me>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, displayName }),
    });
    setMe(next);
    return next;
  }, []);

  const login = useCallback<AuthCtx["login"]>(async (email, password) => {
    const next = await api<Me>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setMe(next);
    return next;
  }, []);

  const logout = useCallback<AuthCtx["logout"]>(async () => {
    await api<{ ok: true }>("/api/auth/logout", { method: "POST" });
    setMe(null);
  }, []);

  return (
    <Ctx.Provider value={{ me, loading, refresh, signup, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
