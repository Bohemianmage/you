import fs from "fs";

const h = fs.readFileSync("scripts/listings-page.html", "utf8");
const re = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
const titles = [];
let m;
while ((m = re.exec(h)) !== null) {
  const text = m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  if (text.length > 8 && !titles.includes(text)) titles.push(text);
}
console.log("count", titles.length);
titles.forEach((t, i) => console.log(i + 1, t.slice(0, 80)));
