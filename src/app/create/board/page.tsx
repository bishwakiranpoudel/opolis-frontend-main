import type { Metadata } from "next";
import { CreatePeopleSectionClient } from "@/components/create/CreatePeopleSectionClient";
import { C } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Board of Stewards | Opolis",
};

export default function CreateBoardPage() {
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
          <p className="kicker">About</p>
          <h1 className="cond h2-section--page h2-section--after-lg">
            Board of Stewards
          </h1>
          <p className="page-hero-lead">
            Names, titles, and portraits on the public About page.
          </p>
        </div>
      </section>
      <section className="sec-alt">
        <div className="wrap create-layout-inner">
          <CreatePeopleSectionClient
            section="board"
            title="Board of Stewards"
            description="Order matches the public grid (use arrows). Empty list falls back to built-in copy until you add entries or run the seed script."
          />
        </div>
      </section>
    </>
  );
}
