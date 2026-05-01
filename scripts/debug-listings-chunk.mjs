import fs from "fs";

const h = fs.readFileSync("scripts/listings-page.html", "utf8");
const chunks = h.split('role="listitem"').slice(1);
const plain = chunks[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
console.log("has Tamaño", plain.includes("Tamaño"), plain.includes("m2"), plain.includes("m²"));
console.log(plain.match(/730/));
console.log(plain.slice(0, 900));
