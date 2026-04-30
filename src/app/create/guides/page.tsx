import type { Metadata } from "next";
import { CreateGuidesFormClient } from "@/components/create/CreateGuidesFormClient";
import { C } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Create guides | Opolis",
};

export default function CreateGuidesPage() {
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
          <p className="kicker">Guides</p>
          <h1 className="cond h2-section--page h2-section--after-lg">
            Resource guides
          </h1>
          <p className="page-hero-lead">
            Sections use <code className="create-gate__code">cat</code>,{" "}
            <code className="create-gate__code">cc</code> (hex), and{" "}
            <code className="create-gate__code">items</code> with{" "}
            <code className="create-gate__code">type</code>,{" "}
            <code className="create-gate__code">label</code>,{" "}
            <code className="create-gate__code">url</code> — identical to the Resources
            guides tab.
          </p>
        </div>
      </section>
      <section className="sec-alt">
        <div className="wrap create-layout-inner">
          <CreateGuidesFormClient />
        </div>
      </section>
    </>
  );
}
