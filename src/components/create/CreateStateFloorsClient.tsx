"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createAuthHeaders,
  useCreateToken,
} from "@/components/create/CreateTokenContext";
import { STATE_FLOORS } from "@/lib/constants";
import {
  mergeStateFloorsFromStored,
  STATE_FLOOR_MAX,
} from "@/lib/state-floors-merge";

const STATE_KEYS = Object.keys(STATE_FLOORS).sort();

export function CreateStateFloorsClient() {
  const { token, ready } = useCreateToken();
  const [floors, setFloors] = useState<Record<string, number>>({});
  const [effectiveYear, setEffectiveYear] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoadErr(null);
    const res = await fetch("/api/create/state-floors", {
      headers: createAuthHeaders(token),
    });
    const data = (await res.json().catch(() => ({}))) as {
      floors?: Record<string, number>;
      effectiveYear?: string;
      updatedAt?: string | null;
      error?: string;
    };
    if (!res.ok) {
      setLoadErr(data.error || "Could not load thresholds");
      return;
    }
    setFloors(mergeStateFloorsFromStored(data.floors));
    setEffectiveYear(data.effectiveYear ?? "");
    setUpdatedAt(
      typeof data.updatedAt === "string" || data.updatedAt === null
        ? data.updatedAt
        : null
    );
  }, [token]);

  useEffect(() => {
    if (!ready || !token) return;
    void load();
  }, [ready, token, load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setBusy(true);
    setMsg(null);
    try {
      const payload: Record<string, number> = {};
      for (const k of STATE_KEYS) {
        const v = floors[k];
        if (
          typeof v !== "number" ||
          !Number.isFinite(v) ||
          v < 0 ||
          v > STATE_FLOOR_MAX
        ) {
          setMsg({
            ok: false,
            text: `Invalid amount for ${k} (use 0–${STATE_FLOOR_MAX.toLocaleString()}).`,
          });
          return;
        }
        payload[k] = Math.round(v);
      }
      const res = await fetch("/api/create/state-floors", {
        method: "PUT",
        headers: {
          ...createAuthHeaders(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          floors: payload,
          effectiveYear,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        floors?: Record<string, number>;
      };
      if (!res.ok) {
        setMsg({ ok: false, text: data.error || "Save failed" });
        return;
      }
      if (data.floors) setFloors(mergeStateFloorsFromStored(data.floors));
      setMsg({ ok: true, text: "All state thresholds saved." });
      await load();
    } finally {
      setBusy(false);
    }
  }

  function resetToDefaults() {
    if (
      !window.confirm(
        "Reset all fields to the built-in defaults from code? Unsaved CMS edits in this form will be overwritten in the browser — Firestore is unchanged until you click Save all."
      )
    ) {
      return;
    }
    setFloors({ ...STATE_FLOORS });
    setMsg({
      ok: true,
      text: "Form reset to code defaults. Save to write to Firestore or discard by refreshing.",
    });
  }

  return (
    <form className="create-form" onSubmit={save}>
      <div style={{ marginBottom: 24 }}>
        <h2
          className="cond"
          style={{ fontSize: 22, margin: "0 0 8px", color: "#fff" }}
        >
          Income minimums by state
        </h2>
        <p className="create-muted" style={{ margin: "0 0 8px" }}>
          These values power the Eligibility and Join flows (state salary floors).
          Keys must match the site&apos;s state labels exactly.
        </p>
        {updatedAt ? (
          <p className="create-muted" style={{ margin: 0, fontSize: 12 }}>
            Last updated (Firestore): {updatedAt}
          </p>
        ) : (
          <p className="create-muted" style={{ margin: 0, fontSize: 12 }}>
            No Firestore doc yet — public site uses code defaults until you save.
          </p>
        )}
      </div>

      {loadErr ? (
        <p className="create-form-error" role="alert">
          {loadErr}
        </p>
      ) : null}

      <div className="create-form-row" style={{ maxWidth: 360 }}>
        <label className="slabel" htmlFor="eff-year">
          Effective year (reference label)
        </label>
        <input
          id="eff-year"
          className="create-input"
          value={effectiveYear}
          onChange={(e) => setEffectiveYear(e.target.value)}
          placeholder="e.g. 2026"
          autoComplete="off"
        />
      </div>

      <div
        style={{
          marginTop: 20,
          marginBottom: 16,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button type="button" className="btn-outline" onClick={() => void load()} disabled={busy}>
          Reload from server
        </button>
        <button type="button" className="btn-outline" onClick={resetToDefaults} disabled={busy}>
          Reset form to code defaults
        </button>
      </div>

      <div
        className="create-state-floors-scroll"
        style={{
          maxHeight: "min(70vh, 720px)",
          overflow: "auto",
          border: "1px solid #252525",
          borderRadius: 12,
          padding: "12px 14px",
          background: "#111",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 140px",
            gap: "10px 16px",
            alignItems: "center",
          }}
        >
          {STATE_KEYS.map((state) => (
            <div
              key={state}
              style={{
                display: "contents",
              }}
            >
              <label
                htmlFor={`floor-${state}`}
                style={{
                  fontSize: 14,
                  color: "#c8c8c8",
                  padding: "6px 0",
                }}
              >
                {state}
              </label>
              <input
                id={`floor-${state}`}
                className="create-input"
                inputMode="numeric"
                value={
                  floors[state] !== undefined && floors[state] !== null
                    ? String(floors[state])
                    : ""
                }
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  const n = raw === "" ? 0 : parseInt(raw, 10);
                  if (!Number.isFinite(n)) return;
                  setFloors((prev) => ({ ...prev, [state]: n }));
                }}
                aria-label={`Minimum for ${state}`}
              />
            </div>
          ))}
        </div>
      </div>

      {msg ? (
        <p
          className={msg.ok ? "create-form-success" : "create-form-error"}
          role="status"
          style={{ marginTop: 16 }}
        >
          {msg.text}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn btn-red"
        disabled={busy}
        style={{ marginTop: 20 }}
      >
        {busy ? "Saving…" : "Save all thresholds"}
      </button>
    </form>
  );
}
