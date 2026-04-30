"use client";

import { useState } from "react";
import { C } from "@/lib/constants";
import { useCreateToken } from "@/components/create/CreateTokenContext";

export function CreateTokenGate({ children }: { children: React.ReactNode }) {
  const { token, setToken, ready } = useCreateToken();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!ready) {
    return (
      <div className="create-gate">
        <p style={{ color: C.gray, margin: 0 }}>Loading…</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="create-gate">
        <p className="create-gate__lead">
          Enter the server secret (<code className="create-gate__code">CREATE_CONTENT_SECRET</code>)
          to enable publishing. It is stored only in this browser session.
        </p>
        <form
          className="create-gate__form"
          onSubmit={(e) => {
            e.preventDefault();
            const t = input.trim();
            if (t.length < 8) {
              setError("Secret must be at least 8 characters.");
              return;
            }
            setError(null);
            setToken(t);
            setInput("");
          }}
        >
          <label className="slabel" htmlFor="create-secret">
            Content secret
          </label>
          <input
            id="create-secret"
            className="create-input"
            type="password"
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste CREATE_CONTENT_SECRET"
          />
          {error && (
            <p className="create-form-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-red">
            Unlock CMS
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}
