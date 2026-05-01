"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createAuthHeaders,
  useCreateToken,
} from "@/components/create/CreateTokenContext";
import { C } from "@/lib/constants";
import type { FaqItem, FaqSection } from "@/lib/resourcesData";

export function CreateFaqFormClient() {
  return <CreateFaqFormInner />;
}

function CreateFaqFormInner() {
  const { token, ready } = useCreateToken();
  const [faq, setFaq] = useState<FaqSection[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [mode, setMode] = useState<"append_section" | "append_items">(
    "append_section"
  );

  const [sectionId, setSectionId] = useState("");
  const [sectionLabel, setSectionLabel] = useState("");
  const [items, setItems] = useState<FaqItem[]>([{ q: "", a: "" }]);

  const [targetSectionId, setTargetSectionId] = useState("");
  const [appendItems, setAppendItems] = useState<FaqItem[]>([
    { q: "", a: "" },
  ]);

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoadErr(null);
    const res = await fetch("/api/create/resources", {
      headers: createAuthHeaders(token),
    });
    const data = (await res.json().catch(() => ({}))) as {
      faq?: FaqSection[];
      error?: string;
    };
    if (!res.ok) {
      setLoadErr(data.error || "Could not load FAQ");
      return;
    }
    const list = data.faq ?? [];
    setFaq(list);
    setTargetSectionId((prev) => prev || list[0]?.id || "");
  }, [token]);

  useEffect(() => {
    if (!ready || !token) return;
    void load();
  }, [ready, token, load]);

  useEffect(() => {
    if (faq.length === 0 && mode === "append_items") {
      setMode("append_section");
    }
  }, [faq.length, mode]);

  function slugifyId(label: string) {
    return label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setMsg(null);
    setBusy(true);
    try {
      if (mode === "append_section") {
        const id = sectionId.trim() || slugifyId(sectionLabel);
        const cleaned = items
          .map((x) => ({ q: x.q.trim(), a: x.a.trim() }))
          .filter((x) => x.q && x.a);
        const res = await fetch("/api/create/faq", {
          method: "POST",
          headers: {
            ...createAuthHeaders(token),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode: "append_section",
            section: {
              id,
              label: sectionLabel.trim(),
              items: cleaned,
            },
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
        };
        if (!res.ok) {
          setMsg({ ok: false, text: data.error || "Save failed" });
          return;
        }
        setMsg({ ok: true, text: "Section saved." });
        setSectionId("");
        setSectionLabel("");
        setItems([{ q: "", a: "" }]);
      } else {
        const cleaned = appendItems
          .map((x) => ({ q: x.q.trim(), a: x.a.trim() }))
          .filter((x) => x.q && x.a);
        const res = await fetch("/api/create/faq", {
          method: "POST",
          headers: {
            ...createAuthHeaders(token),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode: "append_items",
            sectionId: targetSectionId,
            items: cleaned,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
        };
        if (!res.ok) {
          setMsg({ ok: false, text: data.error || "Save failed" });
          return;
        }
        setMsg({ ok: true, text: "Questions appended to section." });
        setAppendItems([{ q: "", a: "" }]);
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function removeSection(sectionId: string) {
    if (!token) return;
    if (!window.confirm(`Delete entire FAQ section "${sectionId}"?`)) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/create/faq", {
        method: "POST",
        headers: {
          ...createAuthHeaders(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mode: "delete_section", sectionId }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMsg({ ok: false, text: data.error || "Delete failed" });
        return;
      }
      setMsg({ ok: true, text: "Section removed." });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function removeItem(sectionId: string, itemIndex: number) {
    if (!token) return;
    if (!window.confirm("Remove this Q&A pair?")) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/create/faq", {
        method: "POST",
        headers: {
          ...createAuthHeaders(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mode: "delete_item", sectionId, itemIndex }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMsg({ ok: false, text: data.error || "Delete failed" });
        return;
      }
      setMsg({ ok: true, text: "Question removed." });
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {loadErr && (
        <p className="create-form-error" role="alert">
          {loadErr}
        </p>
      )}
      <div className="create-workspace">
        <div className="create-editor-panel" id="cms-editor-panel">
          <h2 className="cond" style={{ fontSize: 22, margin: "0 0 8px", color: "#fff" }}>
            Add FAQ content
          </h2>
          <p className="create-muted" style={{ margin: "0 0 18px" }}>
            Add a section or append questions to an existing one. Current content appears on the right.
          </p>

      <div className="create-form-row" style={{ marginBottom: 20 }}>
        <span className="slabel">Mode</span>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: C.lgray,
              cursor: "pointer",
            }}
          >
            <input
              type="radio"
              name="faq-mode"
              checked={mode === "append_section"}
              onChange={() => setMode("append_section")}
            />
            New section
          </label>
          {faq.length > 0 ? (
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: C.lgray,
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="faq-mode"
                checked={mode === "append_items"}
                onChange={() => setMode("append_items")}
              />
              Add Q&amp;A to existing section
            </label>
          ) : null}
        </div>
      </div>

      <form className="create-form" onSubmit={onSubmit}>
        {mode === "append_section" ? (
          <>
            <div className="create-form-row--split">
              <div className="create-form-row">
                <label className="slabel" htmlFor="faq-label">
                  Section label
                </label>
                <input
                  id="faq-label"
                  className="create-input"
                  value={sectionLabel}
                  onChange={(e) => setSectionLabel(e.target.value)}
                  required
                  placeholder="e.g. Payroll"
                />
              </div>
              <div className="create-form-row">
                <label className="slabel" htmlFor="faq-id">
                  Section id (URL key)
                </label>
                <input
                  id="faq-id"
                  className="create-input"
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  placeholder={slugifyId(sectionLabel || "my-section")}
                />
                <p className="create-form-hint">
                  Lowercase, hyphens. Leave blank to derive from label.
                </p>
              </div>
            </div>
            <span className="slabel">Questions</span>
            <div className="create-faq-items">
              {items.map((row, i) => (
                <div key={i} className="create-repeat-block">
                  <div className="create-repeat-block__head">
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.gray }}>
                      #{i + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        className="btn-text"
                        onClick={() =>
                          setItems((prev) => prev.filter((_, j) => j !== i))
                        }
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="create-form-row">
                    <label className="slabel">Question</label>
                    <input
                      className="create-input"
                      value={row.q}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((r, j) =>
                            j === i ? { ...r, q: e.target.value } : r
                          )
                        )
                      }
                      placeholder="Question text"
                    />
                  </div>
                  <div className="create-form-row">
                    <label className="slabel">Answer</label>
                    <textarea
                      className="create-textarea"
                      value={row.a}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((r, j) =>
                            j === i ? { ...r, a: e.target.value } : r
                          )
                        )
                      }
                      placeholder="Answer (plain text or short HTML)"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn-outline"
              onClick={() => setItems((prev) => [...prev, { q: "", a: "" }])}
            >
              + Add question
            </button>
          </>
        ) : (
          <>
            <div className="create-form-row">
              <label className="slabel" htmlFor="faq-target">
                Target section
              </label>
              <select
                id="faq-target"
                className="create-select"
                value={targetSectionId}
                onChange={(e) => setTargetSectionId(e.target.value)}
                required
              >
                {faq.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} ({s.id})
                  </option>
                ))}
              </select>
            </div>
            <span className="slabel">New Q&amp;A rows</span>
            <div className="create-faq-items">
              {appendItems.map((row, i) => (
                <div key={i} className="create-repeat-block">
                  <div className="create-repeat-block__head">
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.gray }}>
                      #{i + 1}
                    </span>
                    {appendItems.length > 1 && (
                      <button
                        type="button"
                        className="btn-text"
                        onClick={() =>
                          setAppendItems((prev) =>
                            prev.filter((_, j) => j !== i)
                          )
                        }
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="create-form-row">
                    <label className="slabel">Question</label>
                    <input
                      className="create-input"
                      value={row.q}
                      onChange={(e) =>
                        setAppendItems((prev) =>
                          prev.map((r, j) =>
                            j === i ? { ...r, q: e.target.value } : r
                          )
                        )
                      }
                    />
                  </div>
                  <div className="create-form-row">
                    <label className="slabel">Answer</label>
                    <textarea
                      className="create-textarea"
                      value={row.a}
                      onChange={(e) =>
                        setAppendItems((prev) =>
                          prev.map((r, j) =>
                            j === i ? { ...r, a: e.target.value } : r
                          )
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn-outline"
              onClick={() =>
                setAppendItems((prev) => [...prev, { q: "", a: "" }])
              }
            >
              + Add question
            </button>
          </>
        )}

        {msg && (
          <p
            className={msg.ok ? "create-form-success" : "create-form-error"}
            role="status"
          >
            {msg.text}
          </p>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button type="submit" className="btn btn-red" disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={() => void load()}
          >
            Refresh list
          </button>
        </div>
      </form>
        </div>

        <section className="create-library-panel" aria-labelledby="faq-live-heading">
          <h2
            id="faq-live-heading"
            className="cond"
            style={{ fontSize: 20, margin: "0 0 8px", color: "#fff" }}
          >
            Sections
          </h2>
          <p className="create-muted" style={{ margin: "0 0 16px" }}>
            Each section must keep at least one question.
          </p>
          <div className="create-library-scroll" style={{ maxHeight: "min(560px, 55vh)" }}>
            {faq.length === 0 ? (
              <p style={{ color: C.gray, margin: 0 }}>No sections yet—use the form above.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {faq.map((section) => (
                  <div
                    key={section.id}
                    style={{
                      border: "1px solid #252525",
                      borderRadius: 10,
                      padding: 14,
                      background: "#141414",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 10,
                      }}
                    >
                      <strong style={{ color: C.lgray }}>
                        {section.label}{" "}
                        <code style={{ fontSize: 12 }}>({section.id})</code>
                      </strong>
                      <button
                        type="button"
                        className="btn-text"
                        style={{ color: "#f87171" }}
                        disabled={busy}
                        onClick={() => void removeSection(section.id)}
                      >
                        Delete section
                      </button>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18, color: C.gray }}>
                      {section.items.map((it, idx) => (
                        <li key={idx} style={{ marginBottom: 8 }}>
                          <span style={{ fontSize: 13 }}>{it.q.slice(0, 120)}…</span>{" "}
                          <button
                            type="button"
                            className="btn-text"
                            disabled={busy || section.items.length <= 1}
                            title={
                              section.items.length <= 1
                                ? "Keep at least one Q&A per section"
                                : undefined
                            }
                            onClick={() => void removeItem(section.id, idx)}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
