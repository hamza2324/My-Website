import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DOMAIN = "https://hamzajadoon.cloud";
const SOURCE_MD_DIR = path.join(ROOT, "content/posts");
const OUTPUT_POSTS_JSON = path.join(ROOT, "posts/posts.json");
const OUTPUT_ASSETS_JSON = path.join(ROOT, "assets/data/posts.json");
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

const DEFAULT_AUTHOR = "Hamza Jadoon";
const DEFAULT_SITE_NAME = "HJ Automations";

const IMAGE_PACKS = {
  ai: {
    hero: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
    alt: "Futuristic AI circuitry and automation network",
    inline: [
      {
        url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&q=80",
        alt: "Digital dashboard with AI analytics",
        caption: "AI workflows move faster when reporting and execution are connected."
      },
      {
        url: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1200&q=80",
        alt: "Human and robot collaboration concept",
        caption: "The strongest systems combine AI execution with human oversight."
      }
    ]
  },
  automation: {
    hero: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
    alt: "Automation control panels and digital workflows",
    inline: [
      {
        url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80",
        alt: "Code editor and workflow scripting interface",
        caption: "Reliable automation comes from repeatable process design, not one-off hacks."
      },
      {
        url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",
        alt: "Team reviewing analytics dashboard",
        caption: "Weekly review loops are where automation ROI becomes visible."
      }
    ]
  },
  llm: {
    hero: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
    alt: "Abstract AI neural network visualization",
    inline: [
      {
        url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80",
        alt: "Modern workspace with AI data on screen",
        caption: "LLM output quality improves when context and constraints are explicit."
      },
      {
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
        alt: "Business intelligence graph screens",
        caption: "Track outcomes, not just generation volume, when evaluating LLM systems."
      }
    ]
  }
};

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

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    value = value.replace(/^['\"]|['\"]$/g, "");
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
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function sanitizeHref(rawUrl) {
  const value = String(rawUrl || "").trim();
  if (!value) return "#";
  if (/^(https?:\/\/|mailto:|tel:|\/|\.\.\/|\.\/)/i.test(value)) return value;
  if (/^\+?[0-9][0-9\s-]{6,}$/.test(value)) return `tel:${value.replace(/\s+/g, "")}`;
  return "#";
}

function renderInline(text) {
  let out = escapeHtml(text);
  out = out.replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`);
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    const href = sanitizeHref(url);
    const external = /^https?:\/\//i.test(href);
    return `<a href="${escapeHtml(href)}"${external ? " target=\"_blank\" rel=\"noopener noreferrer\"" : ""}>${label}</a>`;
  });
  return out;
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const out = [];
  let inCode = false;
  let codeLang = "";
  let inUl = false;
  let inOl = false;
  let skippedTitle = false;

  const closeLists = () => {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      out.push("</ol>");
      inOl = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith("```")) {
      closeLists();
      if (!inCode) {
        inCode = true;
        codeLang = line.slice(3).trim();
        out.push(`<pre><code class="language-${escapeHtml(codeLang || "text")}">`);
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

    if (!line.trim()) {
      closeLists();
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      closeLists();
      out.push("<hr>");
      continue;
    }

    if (/^###\s+/.test(line)) {
      closeLists();
      out.push(`<h3>${renderInline(line.replace(/^###\s+/, ""))}</h3>`);
      continue;
    }

    if (/^##\s+/.test(line)) {
      closeLists();
      out.push(`<h2>${renderInline(line.replace(/^##\s+/, ""))}</h2>`);
      continue;
    }

    if (/^#\s+/.test(line)) {
      closeLists();
      if (!skippedTitle) {
        skippedTitle = true;
      } else {
        out.push(`<h2>${renderInline(line.replace(/^#\s+/, ""))}</h2>`);
      }
      continue;
    }

    if (/^>\s+/.test(line)) {
      closeLists();
      out.push(`<blockquote><p>${renderInline(line.replace(/^>\s+/, ""))}</p></blockquote>`);
      continue;
    }

    if (/^-\s+/.test(line)) {
      if (!inUl) {
        closeLists();
        inUl = true;
        out.push("<ul>");
      }
      out.push(`<li>${renderInline(line.replace(/^-\s+/, ""))}</li>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      if (!inOl) {
        closeLists();
        inOl = true;
        out.push("<ol>");
      }
      out.push(`<li>${renderInline(line.replace(/^\d+\.\s+/, ""))}</li>`);
      continue;
    }

    closeLists();
    out.push(`<p>${renderInline(line)}</p>`);
  }

  closeLists();
  return out.join("\n");
}

function stripHtml(text) {
  return String(text || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferExcerpt(body) {
  const withoutHeaders = body
    .replace(/^#\s+.*$/gm, "")
    .replace(/^##\s+.*$/gm, "")
    .replace(/^###\s+.*$/gm, "")
    .replace(/`{3}[\s\S]*?`{3}/g, "")
    .trim();
  return withoutHeaders.slice(0, 170).replace(/\s+\S*$/, "").trim();
}

function normalizeDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function formatDisplayDate(dateInput) {
  const date = new Date(`${dateInput}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return dateInput;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function buildKeywords(post) {
  const base = [
    ...post.tags,
    post.category,
    "AI automation",
    "n8n workflows",
    "LLM guides",
    "Hamza Jadoon",
    "HJ Automations"
  ];
  return [...new Set(base.filter(Boolean))].join(", ");
}

function imagePackForPost(post) {
  const text = `${post.title} ${post.category} ${(post.tags || []).join(" ")}`.toLowerCase();
  if (text.includes("automation") || text.includes("workflow") || text.includes("report")) return IMAGE_PACKS.automation;
  if (text.includes("llm") || text.includes("prompt") || text.includes("model")) return IMAGE_PACKS.llm;
  return IMAGE_PACKS.ai;
}

function getPostImages(post) {
  const pack = imagePackForPost(post);
  const isUnsplash = /images\.unsplash\.com\/photo-/i.test(post.image || "");
  return {
    hero: isUnsplash ? post.image : pack.hero,
    heroAlt: post.imageAlt || pack.alt,
    inline: pack.inline
  };
}

function figureBlock(image) {
  return `<figure class="image-card">\n  <img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt)}" loading="lazy">\n  <figcaption>${escapeHtml(image.caption)}</figcaption>\n</figure>`;
}

function injectImageCards(contentHtml, images) {
  let headingCount = 0;
  return contentHtml.replace(/(<h2>[\s\S]*?<\/h2>)/g, (full) => {
    headingCount += 1;
    if (headingCount === 2 && images[0]) return `${full}\n${figureBlock(images[0])}`;
    if (headingCount === 5 && images[1]) return `${full}\n${figureBlock(images[1])}`;
    return full;
  });
}

function postMetaFromMarkdown(fileName, raw) {
  const { meta, body } = parseFrontmatter(raw);
  const firstTitleMatch = body.match(/^#\s+(.+)$/m);
  const title = meta.title || (firstTitleMatch ? firstTitleMatch[1].trim() : fileName.replace(/\.md$/, ""));
  const slug = meta.slug || slugify(title) || slugify(fileName.replace(/\.md$/, ""));
  const date = normalizeDate(meta.date || new Date().toISOString().slice(0, 10));
  const category = meta.category || "AI Tools";
  const tags = parseTags(meta.tags || "");
  const excerpt = meta.excerpt || inferExcerpt(body) || "Practical notes and implementation strategies from HJ Automations.";
  const readTime = meta.readTime || "8 min read";
  const image = meta.image || "";
  const contentHtml = markdownToHtml(body);

  return {
    title,
    slug,
    date,
    category,
    tags,
    excerpt,
    readTime,
    image,
    url: `posts/${slug}.html`,
    contentHtml
  };
}

function readMarkdownPosts() {
  if (!fs.existsSync(SOURCE_MD_DIR)) return [];
  const files = fs
    .readdirSync(SOURCE_MD_DIR)
    .filter((file) => file.endsWith(".md"))
    .sort();

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(SOURCE_MD_DIR, file), "utf8");
      return postMetaFromMarkdown(file, raw);
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((post, index) => ({ ...post, id: index + 1 }));
}

function buildFaq(post) {
  const topic = post.category.toLowerCase().includes("automation") ? "automation" : "AI workflow";
  return `<section class="faq" id="faq">\n  <h2>FAQ</h2>\n  <div class="faq-item">\n    <button class="faq-question" type="button">How should I start implementing this ${escapeHtml(topic)} approach?</button>\n    <div class="faq-answer"><p>Start with one measurable workflow, define guardrails, and track outcomes weekly before scaling.</p></div>\n  </div>\n  <div class="faq-item">\n    <button class="faq-question" type="button">What metric should I track first?</button>\n    <div class="faq-answer"><p>Track cycle time or error rate first. Both usually reveal value faster than vanity metrics.</p></div>\n  </div>\n  <div class="faq-item">\n    <button class="faq-question" type="button">How long until results are visible?</button>\n    <div class="faq-answer"><p>Most teams see meaningful direction in 2 to 6 weeks if the workflow is scoped tightly and reviewed each week.</p></div>\n  </div>\n</section>`;
}

function renderPostHtml(post) {
  const images = getPostImages(post);
  const articleHtml = injectImageCards(post.contentHtml, images.inline);
  const description = post.excerpt.slice(0, 160);
  const pageTitle = `${post.title} | ${DEFAULT_SITE_NAME}`;
  const canonical = `${DOMAIN}/posts/${post.slug}.html`;
  const keywords = buildKeywords(post);
  const displayDate = formatDisplayDate(post.date);
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    image: [images.hero],
    author: {
      "@type": "Person",
      name: DEFAULT_AUTHOR,
      url: `${DOMAIN}/about.html`
    },
    publisher: {
      "@type": "Organization",
      name: DEFAULT_SITE_NAME,
      url: DOMAIN
    },
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: canonical
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${DOMAIN}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${DOMAIN}/blog.html` },
      { "@type": "ListItem", position: 3, name: post.title }
    ]
  };

  const tagMeta = post.tags.slice(0, 3).map((tag) => `<span class="dot">${escapeHtml(tag)}</span>`).join("\n        ");

  return `<!doctype html>
<html lang="en">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-K7RZ77Q0G7"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);} 
  gtag('js', new Date());
  gtag('config', 'G-K7RZ77Q0G7');
</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(pageTitle)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="keywords" content="${escapeHtml(keywords)}">
<meta name="author" content="${DEFAULT_AUTHOR}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="${DEFAULT_SITE_NAME}">
<meta property="og:title" content="${escapeHtml(post.title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${escapeHtml(images.hero)}">
<meta property="og:image:alt" content="${escapeHtml(images.heroAlt)}">
<meta property="article:published_time" content="${post.date}T00:00:00+00:00">
<meta property="article:modified_time" content="${post.date}T00:00:00+00:00">
<meta property="article:section" content="${escapeHtml(post.category)}">
${post.tags.map((tag) => `<meta property="article:tag" content="${escapeHtml(tag)}">`).join("\n")}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(post.title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(images.hero)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
<script type="application/ld+json" id="blogposting-schema">${JSON.stringify(schema)}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
<style>
:root {
  --bg: #0a0f1e;
  --bg-soft: #0e1529;
  --surface: #111b33;
  --surface-2: #162340;
  --text: #f7faff;
  --text-soft: #b8c3d9;
  --accent: #00c2ff;
  --accent-2: #4f8ef7;
  --border: #223154;
  --code: #0a1429;
  --max: 720px;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "Inter", sans-serif;
  color: var(--text);
  background: linear-gradient(180deg, var(--bg) 0%, var(--bg-soft) 100%);
}
a { color: inherit; text-decoration: none; transition: all .2s ease; }
img { max-width: 100%; display: block; }
#progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  width: 0;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  z-index: 120;
}
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
  background: rgba(10, 15, 30, .82);
  border-bottom: 1px solid var(--border);
}
.nav-wrap {
  width: min(1180px, 92%);
  margin: 0 auto;
  min-height: 66px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.brand {
  font-family: "Plus Jakarta Sans", sans-serif;
  font-weight: 700;
  letter-spacing: .02em;
}
.site-nav {
  display: flex;
  gap: 18px;
  color: var(--text-soft);
  font-size: .95rem;
}
.site-nav a.active,
.site-nav a:hover { color: var(--text); }
.wrap {
  width: min(1180px, 92%);
  margin: 24px auto 72px;
}
.hero {
  position: relative;
  min-height: min(52vh, 560px);
  border: 1px solid var(--border);
  border-radius: 20px;
  overflow: hidden;
  background: #0c1730;
}
.hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10,15,30,.2), rgba(10,15,30,.86) 60%, rgba(10,15,30,.96));
}
.hero-content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  padding: 28px;
}
.badge {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(0,194,255,.45);
  color: var(--accent);
  background: rgba(0,194,255,.08);
  border-radius: 999px;
  padding: 5px 11px;
  font-size: .75rem;
  font-weight: 600;
  letter-spacing: .02em;
}
.hero h1 {
  margin: 12px 0 12px;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: clamp(1.65rem, 3.5vw, 2.8rem);
  line-height: 1.15;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: var(--text-soft);
  font-size: .9rem;
}
.meta .dot::before { content: "•"; margin-right: 10px; color: var(--accent); }
.content-layout {
  margin-top: 30px;
  display: grid;
  gap: 28px;
  grid-template-columns: 260px minmax(0, 1fr);
  align-items: start;
}
.toc {
  position: sticky;
  top: 84px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: rgba(17, 27, 51, .88);
  padding: 14px;
}
.toc h2 {
  margin: 0 0 10px;
  font-size: .9rem;
  font-family: "Plus Jakarta Sans", sans-serif;
}
.toc ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 8px; }
.toc a {
  color: var(--text-soft);
  font-size: .86rem;
  line-height: 1.35;
  border-left: 2px solid transparent;
  padding-left: 8px;
}
.toc a.active {
  color: var(--accent);
  border-left-color: var(--accent);
}
.article {
  max-width: var(--max);
  margin: 0 auto;
}
.article p,
.article li {
  color: var(--text-soft);
  line-height: 1.88;
  font-size: 1.04rem;
}
.article a { color: #8fd7ff; text-decoration: underline; text-decoration-color: rgba(143,215,255,.5); }
.article h2,
.article h3 {
  font-family: "Plus Jakarta Sans", sans-serif;
  color: var(--accent);
}
.article h2 {
  margin-top: 38px;
  margin-bottom: 10px;
  font-size: 1.45rem;
}
.article h3 {
  margin-top: 24px;
  margin-bottom: 8px;
  font-size: 1.12rem;
}
.article blockquote {
  margin: 20px 0;
  border-left: 4px solid var(--accent);
  background: rgba(0, 194, 255, .07);
  padding: 12px 14px;
  border-radius: 10px;
  color: var(--text);
}
.article code {
  background: var(--code);
  border: 1px solid var(--border);
  border-radius: 7px;
  padding: 2px 7px;
  color: #d6efff;
}
.article pre {
  background: var(--code);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px;
  overflow-x: auto;
}
.article ul,
.article ol { padding-left: 22px; }
.article li { margin-bottom: 6px; }
.article hr {
  border: 0;
  border-top: 1px solid var(--border);
  margin: 30px 0;
}
.image-card {
  margin: 24px 0;
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  background: var(--surface);
}
.image-card img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
.image-card figcaption {
  padding: 10px 12px;
  color: var(--text-soft);
  font-size: .88rem;
}
.faq {
  margin-top: 34px;
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  background: var(--surface);
}
.faq h2 {
  margin: 0;
  padding: 14px 14px 8px;
  font-size: 1.2rem;
  color: var(--text);
}
.faq-item { border-top: 1px solid var(--border); }
.faq-question {
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  color: var(--text);
  padding: 14px;
  font-size: .95rem;
  font-weight: 600;
  cursor: pointer;
}
.faq-answer {
  display: none;
  padding: 0 14px 14px;
  color: var(--text-soft);
}
.faq-item.open .faq-answer { display: block; }
.cta {
  margin-top: 36px;
  background: linear-gradient(var(--surface), var(--surface)) padding-box,
              linear-gradient(120deg, var(--accent), var(--accent-2)) border-box;
  border: 1px solid transparent;
  border-radius: 16px;
  padding: 18px;
}
.cta h2 {
  margin: 0 0 6px;
  color: var(--text);
}
.cta ul { margin: 10px 0 14px; padding-left: 18px; }
.cta li { color: var(--text-soft); }
.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #fff;
  border: 0;
  border-radius: 10px;
  padding: 11px 14px;
  font-weight: 700;
}
.author {
  margin-top: 28px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--surface);
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: center;
}
.author-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #fff;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-weight: 800;
}
.author p { margin: 3px 0 0; font-size: .93rem; }
.footer {
  width: min(1180px, 92%);
  margin: 44px auto 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  color: var(--text-soft);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  font-size: .9rem;
}
@media (max-width: 1024px) {
  .content-layout { grid-template-columns: 1fr; }
  .toc { position: static; order: 2; max-width: var(--max); margin: 0 auto; }
  .article { order: 1; }
}
@media (max-width: 760px) {
  .site-nav { display: none; }
  .hero-content { padding: 18px; }
  .meta { font-size: .83rem; }
  .article p,
  .article li { font-size: .98rem; }
}
</style>
</head>
<body>
<div id="progress" aria-hidden="true"></div>
<header class="site-header">
  <div class="nav-wrap">
    <a class="brand" href="../index.html">HJ Automations</a>
    <nav class="site-nav">
      <a href="../index.html">Home</a>
      <a class="active" href="../blog.html">Blog</a>
      <a href="../about.html">About</a>
      <a href="../services.html">Services</a>
      <a href="../contact.html">Contact</a>
    </nav>
  </div>
</header>

<main class="wrap">
  <section class="hero" aria-label="Article hero">
    <img src="${escapeHtml(images.hero)}" alt="${escapeHtml(images.heroAlt)}" loading="eager">
    <div class="hero-content">
      <span class="badge">${escapeHtml(post.category)}</span>
      <h1>${escapeHtml(post.title)}</h1>
      <div class="meta">
        <span>${escapeHtml(displayDate)}</span>
        <span class="dot" id="read-time">${escapeHtml(post.readTime)}</span>
        ${tagMeta}
      </div>
    </div>
  </section>

  <div class="content-layout">
    <aside class="toc" aria-label="Table of contents">
      <h2>Table of Contents</h2>
      <ul id="toc-list"></ul>
    </aside>

    <article class="article" id="article-content">
${articleHtml}

${buildFaq(post)}

      <section class="cta">
        <h2>Ready to build smarter AI workflows?</h2>
        <p>Book a workflow consultation and get a practical execution roadmap.</p>
        <ul>
          <li>Identify the highest ROI automation path</li>
          <li>Define guardrails and rollout milestones</li>
          <li>Deploy with measurable outcomes</li>
        </ul>
        <a class="cta-btn" href="mailto:hamzajadoon71@gmail.com?subject=Workflow%20Consultation">Work With Me</a>
      </section>

      <section class="author">
        <div class="author-avatar" aria-hidden="true">HJ</div>
        <div>
          <strong>${DEFAULT_AUTHOR}</strong>
          <p>Student creator and operator writing practical playbooks on AI, LLMs, and automation systems.</p>
        </div>
      </section>
    </article>
  </div>
</main>

<footer class="footer">
  <span>&copy; <span id="year"></span> ${DEFAULT_SITE_NAME}</span>
  <span><a href="../blog.html">Back to blog</a></span>
</footer>

<script>
const article = document.getElementById('article-content');
const progress = document.getElementById('progress');
const tocList = document.getElementById('toc-list');
const year = document.getElementById('year');
year.textContent = new Date().getFullYear();

const headings = [...article.querySelectorAll('h2')];
const tocLinks = headings.map((heading, index) => {
  if (!heading.id) heading.id = 'section-' + (index + 1);
  const li = document.createElement('li');
  const link = document.createElement('a');
  link.href = '#' + heading.id;
  link.textContent = heading.textContent;
  li.appendChild(link);
  tocList.appendChild(li);
  return link;
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    tocLinks.forEach((link) => link.classList.remove('active'));
    const current = tocLinks.find((link) => link.getAttribute('href') === ('#' + entry.target.id));
    if (current) current.classList.add('active');
  });
}, { rootMargin: '-30% 0px -60% 0px', threshold: 0.1 });
headings.forEach((heading) => observer.observe(heading));

function updateProgress() {
  const doc = document.documentElement;
  const scrolled = doc.scrollTop;
  const max = doc.scrollHeight - doc.clientHeight;
  progress.style.width = max > 0 ? (((scrolled / max) * 100) + '%') : '0';
}
document.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const words = article.innerText.trim().split(/\s+/).filter(Boolean).length;
const readMins = Math.max(1, Math.ceil(words / 220));
document.getElementById('read-time').textContent = readMins + ' min read';

const schemaNode = document.getElementById('blogposting-schema');
try {
  const schema = JSON.parse(schemaNode.textContent);
  schema.wordCount = words;
  schema.timeRequired = 'PT' + readMins + 'M';
  schemaNode.textContent = JSON.stringify(schema);
} catch (_) {}

document.querySelectorAll('.faq-question').forEach((btn) => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    item.classList.toggle('open');
  });
});
</script>
</body>
</html>`;
}

function writePostPages(posts) {
  fs.mkdirSync(OUTPUT_POSTS_DIR, { recursive: true });
  for (const post of posts) {
    const html = renderPostHtml(post);
    fs.writeFileSync(path.join(OUTPUT_POSTS_DIR, `${post.slug}.html`), html, "utf8");
  }
}

function writeDataFiles(posts) {
  const metadata = posts.map(({ contentHtml, ...rest }) => rest);

  fs.mkdirSync(path.dirname(OUTPUT_POSTS_JSON), { recursive: true });
  fs.mkdirSync(path.dirname(OUTPUT_ASSETS_JSON), { recursive: true });
  fs.mkdirSync(path.dirname(OUTPUT_JS), { recursive: true });

  fs.writeFileSync(OUTPUT_POSTS_JSON, JSON.stringify(metadata, null, 2), "utf8");
  fs.writeFileSync(OUTPUT_ASSETS_JSON, JSON.stringify(metadata, null, 2), "utf8");
  fs.writeFileSync(OUTPUT_JS, `const POSTS = ${JSON.stringify(metadata, null, 2)};\n`, "utf8");
}

function writeSitemap(posts) {
  const staticEntries = STATIC_PAGES.map((page) => {
    const loc = page ? `${DOMAIN}/${page}` : `${DOMAIN}/`;
    const changefreq = page.includes("policy") || page.includes("terms") || page.includes("disclaimer") ? "yearly" : "weekly";
    const priority = page === "" ? "1.0" : page === "blog.html" ? "0.9" : "0.6";
    return `  <url><loc>${loc}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
  });

  const postEntries = posts.map((post) =>
    `  <url><loc>${DOMAIN}/posts/${post.slug}.html</loc><lastmod>${post.date}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticEntries, ...postEntries].join("\n")}\n</urlset>\n`;
  fs.writeFileSync(OUTPUT_SITEMAP, xml, "utf8");
}

function main() {
  const posts = readMarkdownPosts();
  writeDataFiles(posts);
  writePostPages(posts);
  writeSitemap(posts);
  console.log(`Generated ${posts.length} posts with shared premium template, metadata, and sitemap.`);
}

main();

