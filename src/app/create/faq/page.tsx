import type { Metadata } from "next";
import { CreateFaqFormClient } from "@/components/create/CreateFaqFormClient";
import { C } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Create FAQ | Opolis",
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
            Each section has an <code className="create-gate__code">id</code>, a{" "}
            <code className="create-gate__code">label</code>, and{" "}
            <code className="create-gate__code">items</code> with{" "}
            <code className="create-gate__code">q</code> /{" "}
            <code className="create-gate__code">a</code> pairs — same structure as{" "}
            <code className="create-gate__code">resourcesData.ts</code>.
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
