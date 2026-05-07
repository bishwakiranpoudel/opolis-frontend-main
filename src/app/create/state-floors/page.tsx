import type { Metadata } from "next";
import { CreateStateFloorsClient } from "@/components/create/CreateStateFloorsClient";
import { C } from "@/lib/constants";

export const metadata: Metadata = {
  title: "State salary floors | Opolis",
};

export default function CreateStateFloorsPage() {
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
          <p className="kicker">Eligibility</p>
          <h1 className="cond h2-section--page h2-section--after-lg">
            State thresholds
          </h1>
          <p className="page-hero-lead">
            Exempt salary minimums used on Eligibility and Join (annual updates).
          </p>
        </div>
      </section>
      <section className="sec-alt">
        <div className="wrap create-layout-inner">
          <CreateStateFloorsClient />
        </div>
      </section>
    </>
  );
}
