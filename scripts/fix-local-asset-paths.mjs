import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join, relative, sep } from "path";

const root = process.cwd();

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.toLowerCase() === "index.html") out.push(full);
  }
  return out;
}

function toWebPath(p) {
  return p.split(sep).join("/");
}

function depthPrefix(file) {
  const rel = toWebPath(relative(root, file));
  const depth = rel.split("/").length - 1;
  return depth === 0 ? "./" : "../".repeat(depth);
}

const files = walk(root);
for (const file of files) {
  const prefix = depthPrefix(file);
  let html = readFileSync(file, "utf8");
  html = html
    .replace(/href="\/assets\//g, `href="${prefix}assets/`)
    .replace(/src="\/assets\//g, `src="${prefix}assets/`)
    .replace(/href="\/manifest\.json"/g, `href="${prefix}manifest.json"`)
    .replace(/href="\/sw\.js"/g, `href="${prefix}sw.js"`);
  writeFileSync(file, html, "utf8");
}

console.log(`Updated asset paths in ${files.length} index.html files.`);
