"use client";

import type { User } from "firebase/auth";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getFirebaseAuth } from "@/lib/firebase/client";

type Ctx = {
  user: User | null;
  token: string | null;
  ready: boolean;
  firebaseConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOutCms: () => Promise<void>;
  refreshIdToken: () => Promise<string | null>;
  setLegacyToken: (t: string | null) => void;
};

const CreateTokenContext = createContext<Ctx | null>(null);

const LEGACY_KEY = "opolis-create-content-token";

export function CreateTokenProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [legacyToken, setLegacyTokenState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [firebaseConfigured, setFirebaseConfigured] = useState(false);

  useEffect(() => {
    try {
      setLegacyTokenState(sessionStorage.getItem(LEGACY_KEY));
    } catch {
      /* ignore */
    }
  }, []);

  const [clientAuth, setClientAuth] =
    useState<ReturnType<typeof getFirebaseAuth>>(null);

  useEffect(() => {
    setClientAuth(getFirebaseAuth());
  }, []);

  useEffect(() => {
    setFirebaseConfigured(clientAuth != null);
    if (!clientAuth) {
      setReady(true);
      return;
    }

    const unsub = onAuthStateChanged(clientAuth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const t = await u.getIdToken();
          setToken(t);
        } catch {
          setToken(null);
        }
      } else {
        setToken(null);
      }
      setReady(true);
    });

    return () => unsub();
  }, [clientAuth]);

  const refreshIdToken = useCallback(async (): Promise<string | null> => {
    const a = getFirebaseAuth();
    const u = a?.currentUser ?? user;
    if (!u) return legacyToken;
    try {
      const t = await u.getIdToken(true);
      setToken(t);
      return t;
    } catch {
      return null;
    }
  }, [user, legacyToken]);

  useEffect(() => {
    if (!user) return;
    const id = window.setInterval(() => {
      void refreshIdToken();
    }, 45 * 60 * 1000);
    return () => window.clearInterval(id);
  }, [user, refreshIdToken]);

  const signIn = useCallback(async (email: string, password: string) => {
    const a = getFirebaseAuth();
    if (!a) throw new Error("Firebase Auth is not configured in this build.");
    await signInWithEmailAndPassword(a, email.trim(), password);
  }, []);

  const signOutCms = useCallback(async () => {
    const a = getFirebaseAuth();
    if (a) await firebaseSignOut(a);
    setLegacyTokenState(null);
    try {
      sessionStorage.removeItem(LEGACY_KEY);
    } catch {
      /* ignore */
    }
    setToken(null);
  }, []);

  const setLegacyToken = useCallback((t: string | null) => {
    setLegacyTokenState(t);
    try {
      if (t) sessionStorage.setItem(LEGACY_KEY, t);
      else sessionStorage.removeItem(LEGACY_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const effectiveToken = token ?? legacyToken;

  const value = useMemo(
    () => ({
      user,
      token: effectiveToken,
      ready,
      firebaseConfigured,
      signIn,
      signOutCms,
      refreshIdToken,
      setLegacyToken,
    }),
    [
      user,
      effectiveToken,
      ready,
      firebaseConfigured,
      signIn,
      signOutCms,
      refreshIdToken,
      setLegacyToken,
    ]
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
