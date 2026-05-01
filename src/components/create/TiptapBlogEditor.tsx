"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import { useCallback, useRef, type ReactNode } from "react";
import { C } from "@/lib/constants";

type Props = {
  initialHtml: string;
  onChange: (html: string) => void;
  getUploadHeaders: () => Promise<HeadersInit>;
  placeholder?: string;
  shellClassName?: string;
};

function ToolbarBtn({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      className={`create-toolbar-btn${active ? " is-on" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function TiptapBlogEditor({
  initialHtml,
  onChange,
  getUploadHeaders,
  placeholder = "Write the article. Use the toolbar for headings, lists, links, and images.",
  shellClassName,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3] },
        }),
        Underline,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            rel: "noopener noreferrer",
            target: "_blank",
          },
        }),
        Image.configure({
          HTMLAttributes: {
            class: "blog-content-img",
          },
        }),
        Placeholder.configure({ placeholder }),
      ],
      content: initialHtml || "",
      editorProps: {
        attributes: {
          class: "create-editor-prose",
        },
      },
      onUpdate: ({ editor: ed }) => {
        onChange(ed.getHTML());
      },
    },
    []
  );

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const next = window.prompt("Link URL", prev ?? "https://");
    if (next === null) return;
    if (next === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: next }).run();
  }, [editor]);

  const uploadImage = useCallback(
    async (file: File) => {
      let headers: HeadersInit;
      try {
        headers = await getUploadHeaders();
      } catch {
        window.alert("Sign in to upload images.");
        return;
      }
      if (!headers || Object.keys(headers).length === 0) {
        window.alert("Sign in to upload images.");
        return;
      }
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/create/upload", {
        method: "POST",
        headers,
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok) {
        window.alert(data.error || "Upload failed");
        return;
      }
      if (data.url && editor) {
        editor.chain().focus().setImage({ src: data.url }).run();
      }
    },
    [editor, getUploadHeaders]
  );

  const shellCls = `create-editor-shell${shellClassName ? ` ${shellClassName}` : ""}`;

  if (!editor) {
    return (
      <div className={shellCls} style={{ color: C.gray, padding: 24 }}>
        Preparing editor…
      </div>
    );
  }

  return (
    <div className={shellCls}>
      <div className="create-toolbar">
        <ToolbarBtn
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={18} strokeWidth={2.25} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={18} strokeWidth={2.25} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <span style={{ fontWeight: 800, fontSize: 15 }}>U</span>
        </ToolbarBtn>
        <ToolbarBtn
          title="Strike"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={18} strokeWidth={2.25} />
        </ToolbarBtn>
        <span className="create-toolbar-sep" />
        <ToolbarBtn
          title="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 size={18} strokeWidth={2.25} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 size={18} strokeWidth={2.25} />
        </ToolbarBtn>
        <span className="create-toolbar-sep" />
        <ToolbarBtn
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={18} strokeWidth={2.25} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Ordered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={18} strokeWidth={2.25} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={18} strokeWidth={2.25} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Horizontal rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus size={18} strokeWidth={2.25} />
        </ToolbarBtn>
        <span className="create-toolbar-sep" />
        <ToolbarBtn title="Link" active={editor.isActive("link")} onClick={setLink}>
          <Link2 size={18} strokeWidth={2.25} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Image from upload"
          onClick={() => fileRef.current?.click()}
        >
          <ImageIcon size={18} strokeWidth={2.25} />
        </ToolbarBtn>
        <span className="create-toolbar-sep" />
        <ToolbarBtn title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 size={18} strokeWidth={2.25} />
        </ToolbarBtn>
        <ToolbarBtn title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 size={18} strokeWidth={2.25} />
        </ToolbarBtn>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="create-file-hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void uploadImage(f);
        }}
      />
      <EditorContent editor={editor} className="create-editor-content" />
    </div>
  );
}
