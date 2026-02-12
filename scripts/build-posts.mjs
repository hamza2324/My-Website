import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = process.cwd();
const DOMAIN = "https://hamzajadoon.cloud";
const SOURCE_JS = path.join(ROOT, "assets/js/posts.js");
const SOURCE_MD_DIR = path.join(ROOT, "content/posts");
const OUTPUT_JSON = path.join(ROOT, "assets/data/posts.json");
const OUTPUT_JS = path.join(ROOT, "assets/js/posts.js");
const OUTPUT_POSTS_DIR = path.join(ROOT, "posts");
const OUTPUT_SITEMAP = path.join(ROOT, "sitemap.xml");

const STATIC_PAGES = [
  "",
  "blog.html",
  "about.html",
  "contact.html",
  "services.html",
  "privacy-policy.html",
  "terms-of-service.html",
  "disclaimer.html",
  "cookie-policy.html"
];

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readJsPosts() {
  if (!fs.existsSync(SOURCE_JS)) return [];
  const code = fs.readFileSync(SOURCE_JS, "utf8");
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(`${code}\n;globalThis.__posts = POSTS;`, sandbox);
  return Array.isArray(sandbox.__posts) ? sandbox.__posts : [];
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    meta[key] = value;
  }
  return { meta, body: match[2] };
}

function parseTags(value) {
  if (!value) return [];
  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((s) => s.trim().replace(/^['\"]|['\"]$/g, ""))
      .filter(Boolean);
  }
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const out = [];
  let inCode = false;
  let codeLang = "";
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) { out.push("</ul>"); inUl = false; }
    if (inOl) { out.push("</ol>"); inOl = false; }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith("```")) {
      closeLists();
      if (!inCode) {
        inCode = true;
        codeLang = line.replace("```", "").trim();
        out.push(`<pre><code class=\"language-${escapeHtml(codeLang)}\">`);
      } else {
        inCode = false;
        out.push("</code></pre>");
      }
      continue;
    }

    if (inCode) {
      out.push(`${escapeHtml(rawLine)}\n`);
      continue;
    }

    if (!line) {
      closeLists();
      continue;
    }

    if (/^###\s+/.test(line)) {
      closeLists();
      out.push(`<h3>${escapeHtml(line.replace(/^###\s+/, ""))}</h3>`);
      continue;
    }
    if (/^##\s+/.test(line)) {
      closeLists();
      out.push(`<h2>${escapeHtml(line.replace(/^##\s+/, ""))}</h2>`);
      continue;
    }
    if (/^#\s+/.test(line)) {
      closeLists();
      out.push(`<h1>${escapeHtml(line.replace(/^#\s+/, ""))}</h1>`);
      continue;
    }

    if (/^-\s+/.test(line)) {
      if (!inUl) {
        closeLists();
        inUl = true;
        out.push("<ul>");
      }
      out.push(`<li>${escapeHtml(line.replace(/^-\s+/, ""))}</li>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      if (!inOl) {
        closeLists();
        inOl = true;
        out.push("<ol>");
      }
      out.push(`<li>${escapeHtml(line.replace(/^\d+\.\s+/, ""))}</li>`);
      continue;
    }

    closeLists();
    out.push(`<p>${escapeHtml(line)}</p>`);
  }

  closeLists();
  return out.join("\n");
}

function readMarkdownPosts() {
  if (!fs.existsSync(SOURCE_MD_DIR)) return [];
  const files = fs.readdirSync(SOURCE_MD_DIR).filter((file) => file.endsWith(".md"));
  return files.map((file) => {
    const raw = fs.readFileSync(path.join(SOURCE_MD_DIR, file), "utf8");
    const { meta, body } = parseFrontmatter(raw);
    const title = meta.title || "Untitled Post";
    const slug = meta.slug || slugify(title) || slugify(file.replace(/\.md$/, ""));
    const tags = parseTags(meta.tags || "");
    return {
      id: Number(meta.id) || null,
      title,
      slug,
      category: meta.category || "AI Tools",
      excerpt: meta.excerpt || "",
      date: meta.date || new Date().toISOString().slice(0, 10),
      readTime: meta.readTime || "8 min read",
      tags,
      image: meta.image || `https://picsum.photos/seed/${slug}/1200/630`,
      url: `posts/${slug}.html`,
      contentHtml: markdownToHtml(body)
    };
  });
}

function ensurePostContent(post) {
  if (post.contentHtml && post.contentHtml.trim()) return post.contentHtml;
  return [
    `<p>${escapeHtml(post.excerpt || "Detailed article content will be added soon.")}</p>`,
    "<h2>Key Takeaways</h2>",
    "<ul><li>Practical AI automation approach</li><li>Step-by-step execution guidance</li><li>Use this workflow in your own projects</li></ul>",
    "<h2>Conclusion</h2>",
    "<p>Apply this strategy, track outcomes, and iterate weekly for best results.</p>"
  ].join("\n");
}

function mergePosts(basePosts, mdPosts) {
  const bySlug = new Map();

  for (const post of basePosts) {
    const slug = post.slug || slugify(post.title);
    bySlug.set(slug, {
      ...post,
      slug,
      url: `posts/${slug}.html`,
      tags: Array.isArray(post.tags) ? post.tags : [],
      readTime: post.readTime || "8 min read",
      excerpt: post.excerpt || ""
    });
  }

  for (const post of mdPosts) {
    const existing = bySlug.get(post.slug) || {};
    bySlug.set(post.slug, {
      ...existing,
      ...post,
      tags: post.tags?.length ? post.tags : existing.tags || []
    });
  }

  return [...bySlug.values()]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((post, index) => ({ ...post, id: index + 1, contentHtml: ensurePostContent(post) }));
}

function writePostPages(posts) {
  fs.mkdirSync(OUTPUT_POSTS_DIR, { recursive: true });
  for (const post of posts) {
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(post.title)} - HJ Automations</title>
  <meta name="description" content="${escapeHtml(post.excerpt)}">
  <meta property="og:title" content="${escapeHtml(post.title)}">
  <meta property="og:description" content="${escapeHtml(post.excerpt)}">
  <meta property="og:image" content="${escapeHtml(post.image)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${DOMAIN}/posts/${escapeHtml(post.slug)}.html">
  <link rel="stylesheet" href="../assets/css/styles.css">
</head>
<body>
  <header class="site-header">
    <div class="container nav-wrap">
      <a class="brand" href="../index.html">HJ Automations</a>
      <button class="menu-toggle" aria-label="Toggle menu">Menu</button>
      <nav class="site-nav">
        <a href="../index.html">Home</a>
        <a class="active" href="../blog.html">Blog</a>
        <a href="../about.html">About</a>
        <a href="../services.html">Services</a>
        <a href="../contact.html">Contact</a>
      </nav>
    </div>
  </header>

  <main class="section">
    <div class="container content-page">
      <p class="eyebrow">${escapeHtml(post.category)}</p>
      <h1>${escapeHtml(post.title)}</h1>
      <p class="meta">${escapeHtml(post.date)} - ${escapeHtml(post.readTime)}</p>
      <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" class="article-hero" loading="lazy">
      <article class="article-content">
${post.contentHtml}
      </article>
      <p><a href="../blog.html">Back to Blog</a></p>
    </div>
  </main>

  <footer class="site-footer">
    <div class="container footer-bottom">
      <p>&copy; <span data-year></span> HJ Automations - AI & Automation Insights</p>
      <nav>
        <a href="../privacy-policy.html">Privacy</a>
        <a href="../terms-of-service.html">Terms</a>
        <a href="../disclaimer.html">Disclaimer</a>
        <a href="../cookie-policy.html">Cookies</a>
        <a href="https://www.facebook.com/profile.php?id=61588027225877" target="_blank" rel="noopener noreferrer">Facebook</a>
        <a href="https://www.linkedin.com/company/111718821" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </nav>
    </div>
  </footer>

  <script src="../assets/js/posts.js" defer></script>
  <script src="../assets/js/script.js" defer></script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": ${JSON.stringify(post.title)},
    "description": ${JSON.stringify(post.excerpt)},
    "datePublished": ${JSON.stringify(post.date)},
    "author": {"@type": "Person", "name": "HJ Automations"},
    "image": ${JSON.stringify(post.image)},
    "mainEntityOfPage": ${JSON.stringify(`${DOMAIN}/posts/${post.slug}.html`)}
  }
  </script>
</body>
</html>`;
    fs.writeFileSync(path.join(OUTPUT_POSTS_DIR, `${post.slug}.html`), html, "utf8");
  }
}

function writeDataFiles(posts) {
  const metadata = posts.map(({ contentHtml, ...rest }) => rest);
  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(metadata, null, 2), "utf8");
  fs.writeFileSync(OUTPUT_JS, `const POSTS = ${JSON.stringify(metadata, null, 2)};\n`, "utf8");
}

function writeSitemap(posts) {
  const staticEntries = STATIC_PAGES.map((page) => {
    const loc = page ? `${DOMAIN}/${page}` : `${DOMAIN}/`;
    return `  <url><loc>${loc}</loc><changefreq>${page.includes("policy") || page.includes("terms") || page.includes("disclaimer") ? "yearly" : "weekly"}</changefreq><priority>${page === "" ? "1.0" : page === "blog.html" ? "0.9" : "0.6"}</priority></url>`;
  });

  const postEntries = posts.map((post) =>
    `  <url><loc>${DOMAIN}/posts/${post.slug}.html</loc><lastmod>${post.date}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...postEntries].join("\n")}
</urlset>\n`;

  fs.writeFileSync(OUTPUT_SITEMAP, xml, "utf8");
}

function main() {
  const basePosts = readJsPosts();
  const markdownPosts = readMarkdownPosts();
  const posts = mergePosts(basePosts, markdownPosts);
  writeDataFiles(posts);
  writePostPages(posts);
  writeSitemap(posts);
  console.log(`Generated ${posts.length} posts, detail pages, and sitemap.`);
}

main();

