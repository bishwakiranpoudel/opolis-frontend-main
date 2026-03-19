import { BylawsPreamble } from "./BylawsPreamble";
import { BylawsArticleI } from "./BylawsArticleI";
import { BylawsArticleII } from "./BylawsArticleII";
import { BylawsArticleIII } from "./BylawsArticleIII";
import { BylawsArticleIV } from "./BylawsArticleIV";
import { BylawsArticleV } from "./BylawsArticleV";
import { BylawsArticleVIThroughIX } from "./BylawsArticleVIThroughIX";
import { BylawsArticleXThroughXIV } from "./BylawsArticleXThroughXIV";
import { BylawsSchedule1 } from "./BylawsSchedule1";

/** Static Employment Commons LCA Bylaws — exact copy as provided; semantic hierarchy for a11y/SEO. */
export function BylawsContent() {
  return (
    <article className="legal-html legal-bylaws wrap" style={{ maxWidth: 900 }}>
      <header className="legal-bylaws-header">
        <h1 className="legal-bylaws-title">
          Employment Commons LCA (Hereinafter the &quot;Cooperative&quot;) Bylaws
        </h1>
      </header>
      <BylawsPreamble />
      <BylawsArticleI />
      <BylawsArticleII />
      <BylawsArticleIII />
      <BylawsArticleIV />
      <BylawsArticleV />
      <BylawsArticleVIThroughIX />
      <BylawsArticleXThroughXIV />
      <BylawsSchedule1 />
    </article>
  );
}
