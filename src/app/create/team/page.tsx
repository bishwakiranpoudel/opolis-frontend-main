import type { Metadata } from "next";
import { CreatePeopleSectionClient } from "@/components/create/CreatePeopleSectionClient";
import { C } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Team | Opolis",
};

export default function CreateTeamPage() {
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
            Team
          </h1>
          <p className="page-hero-lead">
            Staff cards on the public About page — same layout as Board.
          </p>
        </div>
      </section>
      <section className="sec-alt">
        <div className="wrap create-layout-inner">
          <CreatePeopleSectionClient
            section="team"
            title="Team"
            description="Order matches the public grid (use arrows). Empty list falls back to built-in copy until you add entries or run the seed script."
          />
        </div>
      </section>
    </>
  );
}
