"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "opolis-create-content-token";

type Ctx = {
  token: string | null;
  setToken: (t: string | null) => void;
  ready: boolean;
};

const CreateTokenContext = createContext<Ctx | null>(null);

export function CreateTokenProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setTokenState(sessionStorage.getItem(STORAGE_KEY));
    } finally {
      setReady(true);
    }
  }, []);

  const setToken = useCallback((t: string | null) => {
    setTokenState(t);
    if (t) sessionStorage.setItem(STORAGE_KEY, t);
    else sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ token, setToken, ready }),
    [token, setToken, ready]
  );

  return (
    <CreateTokenContext.Provider value={value}>
      {children}
    </CreateTokenContext.Provider>
  );
}

export function useCreateToken(): Ctx {
  const ctx = useContext(CreateTokenContext);
  if (!ctx) {
    throw new Error("useCreateToken must be used within CreateTokenProvider");
  }
  return ctx;
}

export function createAuthHeaders(token: string | null): HeadersInit {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
