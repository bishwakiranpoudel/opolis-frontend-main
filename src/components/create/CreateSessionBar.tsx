"use client";

import { useCreateToken } from "@/components/create/CreateTokenContext";

export function CreateSessionBar() {
  const { setToken } = useCreateToken();
  return (
    <div className="create-session-bar">
      <span>CMS session active</span>
      <button
        type="button"
        className="btn-text"
        onClick={() => {
          setToken(null);
        }}
      >
        Lock
      </button>
    </div>
  );
}
