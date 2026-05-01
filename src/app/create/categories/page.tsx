import type { Metadata } from "next";
import { CreateCategoriesCrudClient } from "@/components/create/CreateCategoriesCrudClient";
import { C } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Categories | Opolis",
};

export default function CreateCategoriesPage() {
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
            Categories
          </h1>
          <p className="page-hero-lead">
            Names and URL slugs used when publishing blog posts.
          </p>
        </div>
      </section>
      <section className="sec-alt">
        <div className="wrap create-layout-inner">
          <CreateCategoriesCrudClient />
        </div>
      </section>
    </>
  );
}
