import type { Metadata } from "next";
import { CreateBlogFormClient } from "@/components/create/CreateBlogFormClient";
import { C } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Create blog post | Opolis",
};

export default function CreateBlogPage() {
  return (
    <>
      <section
        className="page-hero"
        style={{
          background: C.black,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="wrap">
          <p className="kicker">Blog</p>
          <h1 className="cond h2-section--page h2-section--after-lg">
            New article
          </h1>
          <p className="page-hero-lead">
            Matches Firestore <code className="create-gate__code">blog_posts</code>{" "}
            documents and renders with the same{" "}
            <code className="create-gate__code">blog-content</code> styles as migrated
            WordPress posts.
          </p>
        </div>
      </section>
      <section className="sec-alt">
        <div className="wrap create-layout-inner">
          <CreateBlogFormClient />
        </div>
      </section>
    </>
  );
}
