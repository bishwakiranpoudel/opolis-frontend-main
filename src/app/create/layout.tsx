import type { Metadata } from "next";
import "./create.css";
import { CreateTokenProvider } from "@/components/create/CreateTokenContext";

export const metadata: Metadata = {
  title: "Create content | Opolis",
  description:
    "Publish blog posts, FAQ sections, and resource guides to Firestore.",
  robots: { index: false, follow: false },
};

export default function CreateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <CreateTokenProvider>{children}</CreateTokenProvider>;
}
