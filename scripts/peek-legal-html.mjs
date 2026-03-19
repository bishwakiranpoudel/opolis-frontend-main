const url = process.argv[2] || "https://opolis.co/bylaws/";
const res = await fetch(url);
const html = await res.text();
for (const needle of ["entry-content", "wp-block-post-content", "post-content", "site-main", "<article"]) {
  const i = html.indexOf(needle);
  console.log(needle, i);
}
const m = html.match(/class="([^"]*wp-block-post-content[^"]*)"/);
console.log("match wp-block", m?.[1]?.slice(0, 120));
const m2 = html.match(/class="([^"]*entry-content[^"]*)"/);
console.log("match entry", m2?.[1]?.slice(0, 120));
const i = html.indexOf("tcb-post-content");
console.log("tcb index", i);
const j = html.indexOf('class="tcb-post-content');
console.log(html.slice(j, j + 800));
