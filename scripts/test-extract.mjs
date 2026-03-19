function extractThrivePostContent(html) {
  const re = /<section[^>]*class="[^"]*tcb-post-content[^"]*"[^>]*>/i;
  const m = html.match(re);
  if (!m || m.index === undefined) return null;
  const start = m.index;
  let depth = 1;
  let i = m.index + m[0].length;
  const lower = html.toLowerCase();
  while (i < html.length && depth > 0) {
    const open = lower.indexOf("<section", i);
    const close = lower.indexOf("</section>", i);
    if (close === -1) return null;
    if (open !== -1 && open < close) {
      depth++;
      i = open + 8;
    } else {
      depth--;
      i = close + 10;
    }
  }
  return html.slice(start, i);
}

const url = process.argv[2];
const html = await (await fetch(url)).text();
const out = extractThrivePostContent(html);
console.log("len", out?.length, "starts", out?.slice(0, 200));
