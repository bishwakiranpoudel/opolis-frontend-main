"use client";

import { useState } from "react";
import { C } from "@/lib/constants";
import { useCreateToken } from "@/components/create/CreateTokenContext";

export function CreateTokenGate() {
  const { firebaseConfigured, signIn, setLegacyToken } = useCreateToken();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [legacyInput, setLegacyInput] = useState("");
  const [showLegacy, setShowLegacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Sign-in failed. Check your email and password."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="create-login-screen">
      <div className="create-gate" style={{ maxWidth: 420, margin: "0 auto" }}>
        <h1
          className="cond"
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#fff",
            margin: "0 0 8px",
            textAlign: "center",
          }}
        >
          Sign in
        </h1>
        <p className="create-gate__lead" style={{ textAlign: "center" }}>
          {firebaseConfigured
            ? "Use your team email and password."
            : "Email sign-in isn’t available here. Use an access code below, or contact your administrator."}
        </p>

        {firebaseConfigured ? (
          <form className="create-gate__form" onSubmit={onEmailLogin}>
            <label className="slabel" htmlFor="cms-email">
              Email
            </label>
            <input
              id="cms-email"
              className="create-input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className="slabel" htmlFor="cms-password">
              Password
            </label>
            <input
              id="cms-password"
              className="create-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <p className="create-form-error" role="alert">
                {error}
              </p>
            )}
            <button type="submit" className="btn btn-red" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        ) : null}

        <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid #252525" }}>
          <button
            type="button"
            className="btn-text"
            style={{ width: "100%", marginBottom: 12 }}
            onClick={() => setShowLegacy((v) => !v)}
          >
            {showLegacy ? "Hide" : "Use"} access code
          </button>
          {showLegacy || !firebaseConfigured ? (
            <form
              className="create-gate__form"
              onSubmit={(e) => {
                e.preventDefault();
                const t = legacyInput.trim();
                if (t.length < 8) {
                  setError("Code must be at least 8 characters.");
                  return;
                }
                setError(null);
                setLegacyToken(t);
                setLegacyInput("");
              }}
            >
              <p className="create-gate__lead" style={{ marginBottom: 12 }}>
                Paste your access code. It’s stored only for this browser session.
              </p>
              <input
                className="create-input"
                type="password"
                autoComplete="off"
                value={legacyInput}
                onChange={(e) => setLegacyInput(e.target.value)}
                placeholder="Access code"
              />
              <button type="submit" className="btn-outline">
                Continue
              </button>
            </form>
          ) : null}
        </div>
      </div>
      <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: C.gray }}>
        Need access? Ask your administrator.
      </p>
    </div>
  );
}
