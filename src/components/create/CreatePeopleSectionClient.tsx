"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import {
  createAuthHeaders,
  useCreateToken,
} from "@/components/create/CreateTokenContext";
import { CmsStorageUploadField } from "@/components/create/CmsStorageUploadField";
import { C } from "@/lib/constants";
import type { PeopleEntryDoc, PeopleSection } from "@/lib/firebase/types";

type EntryRow = PeopleEntryDoc & { id: string };

export function CreatePeopleSectionClient({
  section,
  title,
  description,
}: {
  section: PeopleSection;
  title: string;
  description: string;
}) {
  const { token, ready, refreshIdToken } = useCreateToken();
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [addName, setAddName] = useState("");
  const [addTitle, setAddTitle] = useState("");
  const [addAvatar, setAddAvatar] = useState("");

  const getUploadHeaders = useCallback(async () => {
    const t = await refreshIdToken();
    return createAuthHeaders(t);
  }, [refreshIdToken]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoadErr(null);
    const res = await fetch(
      `/api/create/people?section=${encodeURIComponent(section)}`,
      { headers: createAuthHeaders(token) }
    );
    const data = (await res.json().catch(() => ({}))) as {
      entries?: EntryRow[];
      error?: string;
    };
    if (!res.ok) {
      setLoadErr(data.error || "Could not load entries");
      return;
    }
    setEntries(data.entries ?? []);
  }, [token, section]);

  useEffect(() => {
    if (!ready || !token) return;
    void load();
  }, [ready, token, load]);

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const name = addName.trim();
    const job = addTitle.trim();
    if (!name || !job) {
      setMsg({ ok: false, text: "Name and title are required." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/create/people", {
        method: "POST",
        headers: {
          ...createAuthHeaders(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section,
          name,
          title: job,
          avatarUrl: addAvatar.trim() || undefined,
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
      setMsg({ ok: true, text: "Person added." });
      setAddName("");
      setAddTitle("");
      setAddAvatar("");
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function patchEntry(
    id: string,
    body: Partial<Pick<PeopleEntryDoc, "name" | "title" | "avatarUrl" | "sortOrder">>
  ) {
    if (!token) return;
    if (body.name !== undefined && !String(body.name).trim()) {
      setMsg({ ok: false, text: "Name cannot be empty." });
      return;
    }
    if (body.title !== undefined && !String(body.title).trim()) {
      setMsg({ ok: false, text: "Title cannot be empty." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/create/people/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          ...createAuthHeaders(token),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setMsg({ ok: false, text: data.error || "Update failed" });
        return;
      }
      setMsg({ ok: true, text: "Saved." });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function removeEntry(id: string) {
    if (!token) return;
    if (!window.confirm("Remove this person from the public site?")) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/create/people/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: createAuthHeaders(token),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setMsg({ ok: false, text: data.error || "Delete failed" });
        return;
      }
      setMsg({ ok: true, text: "Removed." });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function moveEntry(index: number, dir: -1 | 1) {
    if (!token) return;
    const j = index + dir;
    if (j < 0 || j >= entries.length) return;
    const a = entries[index];
    const b = entries[j];
    setBusy(true);
    setMsg(null);
    try {
      const h = { ...createAuthHeaders(token), "Content-Type": "application/json" };
      const r1 = await fetch(`/api/create/people/${encodeURIComponent(a.id)}`, {
        method: "PATCH",
        headers: h,
        body: JSON.stringify({ sortOrder: b.sortOrder }),
      });
      if (!r1.ok) {
        const data = (await r1.json().catch(() => ({}))) as { error?: string };
        setMsg({ ok: false, text: data.error || "Reorder failed" });
        return;
      }
      const r2 = await fetch(`/api/create/people/${encodeURIComponent(b.id)}`, {
        method: "PATCH",
        headers: h,
        body: JSON.stringify({ sortOrder: a.sortOrder }),
      });
      if (!r2.ok) {
        const data = (await r2.json().catch(() => ({}))) as { error?: string };
        setMsg({ ok: false, text: data.error || "Reorder failed" });
        return;
      }
      setMsg({ ok: true, text: "Order updated." });
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="create-form">
      <div style={{ marginBottom: 28 }}>
        <h2
          className="cond"
          style={{ fontSize: 22, margin: "0 0 8px", color: "#fff" }}
        >
          {title}
        </h2>
        <p className="create-muted" style={{ margin: 0 }}>
          {description}
        </p>
      </div>

      <form
        onSubmit={addEntry}
        className="create-repeat-block"
        style={{ marginBottom: 28 }}
      >
        <span className="slabel">Add person</span>
        <div className="create-person-edit-grid" style={{ marginTop: 12 }}>
          <div className="create-form-row">
            <label className="slabel" htmlFor="p-name">
              Name
            </label>
            <input
              id="p-name"
              className="create-input"
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="create-form-row">
            <label className="slabel" htmlFor="p-title">
              Title / role
            </label>
            <input
              id="p-title"
              className="create-input"
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="create-person-edit-grid__portrait">
            <CmsStorageUploadField
              label="Portrait (optional)"
              value={addAvatar}
              onChange={setAddAvatar}
              getUploadHeaders={getUploadHeaders}
              onError={(text) => setMsg({ ok: false, text })}
              accept="image/*"
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-red"
          disabled={busy || !addName.trim() || !addTitle.trim()}
          style={{ marginTop: 8 }}
        >
          {busy ? "Saving…" : "Add to list"}
        </button>
      </form>

      {loadErr ? (
        <p className="create-form-error" role="alert">
          {loadErr}
        </p>
      ) : null}

      <section aria-labelledby="people-list-heading">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <h2
            id="people-list-heading"
            className="cond"
            style={{ fontSize: 18, margin: 0, color: "#fff" }}
          >
            Current ({entries.length})
          </h2>
          <button
            type="button"
            className="btn-outline"
            onClick={() => void load()}
            disabled={busy}
          >
            Refresh
          </button>
        </div>

        {entries.length === 0 ? (
          <p className="create-muted">
            No Firestore rows yet — the public About page uses built-in fallbacks
            until you add people here or run the seed script.
          </p>
        ) : (
          <div className="create-faq-items">
            {entries.map((row, index) => (
              <PersonEditCard
                key={`${row.id}__${row.updatedAt}`}
                row={row}
                busy={busy}
                onPatch={(body) => patchEntry(row.id, body)}
                onDelete={() => removeEntry(row.id)}
                onMoveUp={() => moveEntry(index, -1)}
                onMoveDown={() => moveEntry(index, 1)}
                disableUp={index === 0}
                disableDown={index === entries.length - 1}
                getUploadHeaders={getUploadHeaders}
                onUploadErr={(text) => setMsg({ ok: false, text })}
              />
            ))}
          </div>
        )}
      </section>

      {msg ? (
        <p
          className={msg.ok ? "create-form-success" : "create-form-error"}
          role="status"
          style={{ marginTop: 20 }}
        >
          {msg.text}
        </p>
      ) : null}
    </div>
  );
}

function PersonEditCard({
  row,
  busy,
  onPatch,
  onDelete,
  onMoveUp,
  onMoveDown,
  disableUp,
  disableDown,
  getUploadHeaders,
  onUploadErr,
}: {
  row: EntryRow;
  busy: boolean;
  onPatch: (
    body: Partial<
      Pick<PeopleEntryDoc, "name" | "title" | "avatarUrl" | "sortOrder">
    >
  ) => void | Promise<void>;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  disableUp: boolean;
  disableDown: boolean;
  getUploadHeaders: () => Promise<HeadersInit>;
  onUploadErr: (message: string) => void;
}) {
  const safeText = (v: unknown) => (typeof v === "string" ? v : "");

  const [name, setName] = useState(() => safeText(row.name));
  const [jobTitle, setJobTitle] = useState(() => safeText(row.title));
  const [avatarUrl, setAvatarUrl] = useState(() => safeText(row.avatarUrl));

  return (
    <div className="create-repeat-block">
      <div className="create-repeat-block__head">
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            type="button"
            className="btn-text"
            aria-label="Move up"
            disabled={busy || disableUp}
            onClick={() => onMoveUp()}
          >
            <ChevronUp size={18} />
          </button>
          <button
            type="button"
            className="btn-text"
            aria-label="Move down"
            disabled={busy || disableDown}
            onClick={() => onMoveDown()}
          >
            <ChevronDown size={18} />
          </button>
        </div>
        <button
          type="button"
          className="btn-text"
          aria-label="Delete"
          disabled={busy}
          onClick={() => onDelete()}
        >
          <Trash2 size={18} color={C.red} />
        </button>
      </div>
      <div className="create-person-edit-grid">
        <div className="create-form-row">
          <label className="slabel">Name</label>
          <input
            className="create-input"
            value={name}
            autoComplete="off"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="create-form-row">
          <label className="slabel">Title</label>
          <input
            className="create-input"
            value={jobTitle}
            autoComplete="off"
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </div>
        <div className="create-person-edit-grid__portrait">
          <CmsStorageUploadField
            label="Portrait"
            value={avatarUrl}
            onChange={setAvatarUrl}
            getUploadHeaders={getUploadHeaders}
            onError={onUploadErr}
            accept="image/*"
          />
        </div>
      </div>
      <button
        type="button"
        className="btn btn-red"
        disabled={busy || !name.trim() || !jobTitle.trim()}
        onClick={() => {
          const nextName = name.trim();
          const nextTitle = jobTitle.trim();
          const nextAvatar = avatarUrl.trim();
          void onPatch({
            name: nextName,
            title: nextTitle,
            avatarUrl: nextAvatar,
          });
        }}
      >
        Save changes
      </button>
    </div>
  );
}
