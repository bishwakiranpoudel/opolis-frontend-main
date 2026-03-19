const fs = require("fs");
const path = require("path");
const content = fs.readFileSync(
  path.join(__dirname, "../../opollis_vibe/src/App.js"),
  "utf8"
);
const start = content.indexOf("const ALL_POSTS = [");
const arrayStart = start + "const ALL_POSTS = [".length;
let depth = 1;
let end = arrayStart;
for (let i = arrayStart; i < content.length; i++) {
  if (content[i] === "[") depth++;
  else if (content[i] === "]") {
    depth--;
    if (depth === 0) {
      end = i;
      break;
    }
  }
}
let slice = content.substring(arrayStart, end);
slice = slice.replace(/C\.red/g, '"#E8432D"');
const out = `/** Blog posts for Resources page - from opollis_vibe */\n\nexport const ALL_POSTS = [\n${slice}\n];\n`;
fs.writeFileSync(
  path.join(__dirname, "../src/lib/blogPosts.ts"),
  out,
  "utf8"
);
console.log("Wrote src/lib/blogPosts.ts");
