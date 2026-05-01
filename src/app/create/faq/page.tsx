import type { Metadata } from "next";
import { CreateFaqFormClient } from "@/components/create/CreateFaqFormClient";
import { C } from "@/lib/constants";

export const metadata: Metadata = {
  title: "FAQ | Opolis",
};

export default function CreateFaqPage() {
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
          <p className="kicker">FAQ</p>
          <h1 className="cond h2-section--page h2-section--after-lg">
            Resources FAQ
          </h1>
          <p className="page-hero-lead">
            Add sections and questions for the resources FAQ page.
          </p>
        </div>
      </section>
      <section className="sec-alt">
        <div className="wrap create-layout-inner">
          <CreateFaqFormClient />
        </div>
      </section>
    </>
  );
}
