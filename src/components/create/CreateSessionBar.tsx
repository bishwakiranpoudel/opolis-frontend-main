"use client";

import { useCreateToken } from "@/components/create/CreateTokenContext";

export function CreateSessionBar() {
  const { user, token, signOutCms, refreshIdToken } = useCreateToken();
  const isFirebase = Boolean(user);

  return (
    <div className="create-session-bar">
      <span style={{ flex: 1 }}>
        {isFirebase ? (
          <>
            Signed in as <strong>{user?.email ?? "—"}</strong>
          </>
        ) : token ? (
          <>Signed in with access code</>
        ) : null}
      </span>
      <button
        type="button"
        className="btn-text"
        onClick={() => void refreshIdToken()}
        title="Refresh session"
      >
        Refresh token
      </button>
      <button
        type="button"
        className="btn-text"
        onClick={() => void signOutCms()}
      >
        Sign out
      </button>
    </div>
  );
}
