import type { Metadata } from "next";
import "./create.css";
import { CreateCmsLayout } from "@/components/create/CreateCmsLayout";
import { CreateTokenProvider } from "@/components/create/CreateTokenContext";

export const metadata: Metadata = {
  title: "Content | Opolis",
  description: "Manage website content.",
  robots: { index: false, follow: false },
};

export default function CreateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <CreateTokenProvider>
      <CreateCmsLayout>{children}</CreateCmsLayout>
    </CreateTokenProvider>
  );
}
