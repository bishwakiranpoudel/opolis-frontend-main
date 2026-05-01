import type { Metadata } from "next";
import { CreatePodcastsCrudClient } from "@/components/create/CreatePodcastsCrudClient";
import { C } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Podcasts | Opolis",
};

export default function CreatePodcastsPage() {
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
          <p className="kicker">Podcasts</p>
          <h1 className="cond h2-section--page h2-section--after-lg">
            Episodes
          </h1>
          <p className="page-hero-lead">
            Episodes and show notes for the podcasts section.
          </p>
        </div>
      </section>
      <section className="sec-alt">
        <div className="wrap create-layout-inner">
          <CreatePodcastsCrudClient />
        </div>
      </section>
    </>
  );
}
