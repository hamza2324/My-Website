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
const OVERWRITE_EXISTING_POST_PAGES = true;

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

function pexels(id, width = 1600) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

const IMAGE_POOLS = {
  ai: [
    {
      hero: { url: pexels(8386434), alt: "Neon AI circuitry and digital system map" },
      inline: [
        { url: pexels(3861969), alt: "Code and analytics view on monitor", caption: "Modern AI execution depends on clean data flow and observability." },
        { url: pexels(6801648), alt: "Futuristic dashboard with visual signals", caption: "Operational visibility turns AI experiments into repeatable systems." }
      ]
    },
    {
      hero: { url: pexels(8728380), alt: "Abstract machine intelligence network pattern" },
      inline: [
        { url: pexels(8386422), alt: "Digital control center with live metrics", caption: "AI outcomes improve when teams track quality and cycle time continuously." },
        { url: pexels(17489157), alt: "High-tech abstract blue network background", caption: "Workflow speed compounds when every process handoff is streamlined." }
      ]
    },
    {
      hero: { url: pexels(7567538), alt: "Autonomous technology concept in dark workspace" },
      inline: [
        { url: pexels(3861458), alt: "Developer workspace with multi-screen setup", caption: "Execution quality comes from strong prompts, context, and guardrails." },
        { url: pexels(17483868), alt: "AI system visualization with layered data", caption: "The best teams treat AI as part of operations, not as isolated tooling." }
      ]
    }
  ],
  automation: [
    {
      hero: { url: pexels(5380664), alt: "Automation pipeline running across connected apps" },
      inline: [
        { url: pexels(546819), alt: "Hands on keyboard in software workflow", caption: "Reliable automation starts with clear process design." },
        { url: pexels(577585), alt: "Team tracking KPIs on laptop dashboard", caption: "Weekly reporting systems should be measurable and easy to maintain." }
      ]
    },
    {
      hero: { url: pexels(4145190), alt: "Operations dashboard and automated alerts" },
      inline: [
        { url: pexels(325229), alt: "Developer reviewing workflow steps", caption: "Simple pipelines outperform complex flows when reliability matters." },
        { url: pexels(1181675), alt: "Spreadsheet metrics and planning notes", caption: "Structured reporting helps teams make faster decisions." }
      ]
    },
    {
      hero: { url: pexels(2582937), alt: "Digital operations workspace with layered metrics" },
      inline: [
        { url: pexels(577210), alt: "Laptop view with analytics and process tools", caption: "Good automations reduce repetitive work without losing control." },
        { url: pexels(935949), alt: "Task management and reporting workflow on desk", caption: "A lightweight review loop keeps automations aligned with outcomes." }
      ]
    },
    {
      hero: { url: pexels(3861969), alt: "Automation code pipeline and deployment dashboard" },
      inline: [
        { url: pexels(373543), alt: "Analytics report and planning sheet", caption: "Tracking changes weekly helps automation systems stay reliable." },
        { url: pexels(6801648), alt: "Data network graph for operations monitoring", caption: "Operational telemetry is key for improving workflow performance." }
      ]
    },
    {
      hero: { url: pexels(8728380), alt: "Futuristic operations layer with AI-assisted controls" },
      inline: [
        { url: pexels(1181675), alt: "KPI spreadsheet and forecasting workspace", caption: "Reporting automation should surface decisions, not just summaries." },
        { url: pexels(325229), alt: "Developer reviewing integration logic", caption: "Strong process boundaries reduce failure risk in automated flows." }
      ]
    }
  ],
  llm: [
    {
      hero: { url: pexels(7988079), alt: "Language model concept in dark abstract interface" },
      inline: [
        { url: pexels(8386435), alt: "Developer testing prompts in terminal environment", caption: "Prompt quality improves when tasks are constrained and explicit." },
        { url: pexels(8297478), alt: "Digital assistant interface and context panels", caption: "LLM reliability depends on feedback loops and evaluation rules." }
      ]
    },
    {
      hero: { url: pexels(270404), alt: "AI-generated text workflow and interface blocks" },
      inline: [
        { url: pexels(373543), alt: "Data and text analysis view on laptop", caption: "Clear context windows reduce hallucinations and output drift." },
        { url: pexels(5380650), alt: "Abstract neural network and data points", caption: "Model performance is strongest when measured against business KPIs." }
      ]
    },
    {
      hero: { url: pexels(3862132), alt: "Large model operations dashboard in dark mode" },
      inline: [
        { url: pexels(7988079), alt: "AI interface with layered prompt interactions", caption: "Reusable prompt patterns make LLM workflows easier to scale." },
        { url: pexels(6801648), alt: "Technical analytics board with network graph", caption: "Instrumentation is essential for long-term LLM quality." }
      ]
    }
  ]
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

function parseNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
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
  out = out.replace(/\*\*([^*]+)\*\*/g, (_, strong) => `<strong>${strong}</strong>`);
  out = out.replace(/\*([^*]+)\*/g, (_, em) => `<em>${em}</em>`);
  out = out.replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`);
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
    const src = sanitizeHref(url);
    if (!/^(https?:\/\/|\/|\.\.\/|\.\/)/i.test(src)) return "";
    return `<img class="inline-promo" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy">`;
  });
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    const href = sanitizeHref(url);
    const external = /^https?:\/\//i.test(href);
    return `<a href="${escapeHtml(href)}"${external ? " target=\"_blank\" rel=\"noopener noreferrer\"" : ""}>${label}</a>`;
  });
  return out;
}

function headingParts(rawText) {
  const text = String(rawText || "").trim();
  const match = text.match(/^(.*?)\s*\{#([a-zA-Z0-9_-]+)\}\s*$/);
  if (!match) return { text, id: "" };
  return { text: match[1].trim(), id: match[2].trim() };
}

function isTableSeparatorLine(line) {
  if (!line) return false;
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return false;
  return /^(\|\s*:?-{3,}:?\s*)+\|$/.test(trimmed);
}

function parseTableCells(line) {
  return line
    .trim()
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
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

  for (let i = 0; i < lines.length; i += 1) {
    const rawLine = lines[i];
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
      const heading = headingParts(line.replace(/^###\s+/, ""));
      out.push(`<h3${heading.id ? ` id="${escapeHtml(heading.id)}"` : ""}>${renderInline(heading.text)}</h3>`);
      continue;
    }

    if (/^##\s+/.test(line)) {
      closeLists();
      const heading = headingParts(line.replace(/^##\s+/, ""));
      out.push(`<h2${heading.id ? ` id="${escapeHtml(heading.id)}"` : ""}>${renderInline(heading.text)}</h2>`);
      continue;
    }

    if (/^#\s+/.test(line)) {
      closeLists();
      if (!skippedTitle) {
        skippedTitle = true;
      } else {
        const heading = headingParts(line.replace(/^#\s+/, ""));
        out.push(`<h2${heading.id ? ` id="${escapeHtml(heading.id)}"` : ""}>${renderInline(heading.text)}</h2>`);
      }
      continue;
    }

    if (/^\|.*\|$/.test(line.trim())) {
      const next = lines[i + 1] ? lines[i + 1].trim() : "";
      if (isTableSeparatorLine(next)) {
        closeLists();
        const headerCells = parseTableCells(line);
        const rows = [];
        let rowIndex = i + 2;
        while (rowIndex < lines.length) {
          const rowLine = (lines[rowIndex] || "").trim();
          if (!/^\|.*\|$/.test(rowLine)) break;
          rows.push(parseTableCells(rowLine));
          rowIndex += 1;
        }

        const thead = `<thead><tr>${headerCells.map((cell) => `<th>${renderInline(cell)}</th>`).join("")}</tr></thead>`;
        const tbody = `<tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join("")}</tr>`).join("")}</tbody>`;
        out.push(`<table>${thead}${tbody}</table>`);
        i = rowIndex - 1;
        continue;
      }
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

function hashString(value) {
  let hash = 0;
  const input = String(value || "");
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function imagePoolKeyForPost(post) {
  const text = `${post.title} ${post.category} ${(post.tags || []).join(" ")}`.toLowerCase();
  if (text.includes("automation") || text.includes("workflow") || text.includes("report")) return "automation";
  if (text.includes("llm") || text.includes("prompt") || text.includes("model")) return "llm";
  return "ai";
}

function imagePoolForPost(post) {
  return IMAGE_POOLS[imagePoolKeyForPost(post)];
}

function getPostImages(post) {
  const pool = imagePoolForPost(post);
  const variantIndex = Number.isInteger(post.imageVariantIndex)
    ? post.imageVariantIndex
    : (hashString(post.slug || post.title) % pool.length);
  const variant = pool[variantIndex % pool.length];
  const hasCustomImage = /^(https?:\/\/|\/|\.\.\/|\.\/)/i.test((post.image || "").trim());
  return {
    hero: hasCustomImage ? post.image : variant.hero.url,
    heroAlt: post.imageAlt || variant.hero.alt,
    inline: variant.inline
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
  const imageAlt = meta.imageAlt || meta.image_alt || "";
  const affiliateLink = meta.affiliateLink || meta.affiliate_link || "";
  const priority = parseNumber(meta.priority, 0);
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
    imageAlt,
    affiliateLink,
    priority,
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

  const sorted = files
    .map((file) => {
      const fullPath = path.join(SOURCE_MD_DIR, file);
      const raw = fs.readFileSync(fullPath, "utf8");
      const post = postMetaFromMarkdown(file, raw);
      const mtimeMs = fs.statSync(fullPath).mtimeMs;
      return { ...post, mtimeMs };
    })
    .sort((a, b) => {
      const dateDelta = new Date(b.date) - new Date(a.date);
      if (dateDelta !== 0) return dateDelta;
      const priorityDelta = (b.priority || 0) - (a.priority || 0);
      if (priorityDelta !== 0) return priorityDelta;
      return b.mtimeMs - a.mtimeMs;
    });

  const groupCounts = { ai: 0, automation: 0, llm: 0 };
  return sorted.map((post, index) => {
    const imagePoolKey = imagePoolKeyForPost(post);
    const imageVariantIndex = groupCounts[imagePoolKey] % IMAGE_POOLS[imagePoolKey].length;
    groupCounts[imagePoolKey] += 1;
    return { ...post, id: index + 1, imagePoolKey, imageVariantIndex };
  });
}

function buildFaq(post) {
  const topic = post.category.toLowerCase().includes("automation") ? "automation" : "AI workflow";
  return `<section class="faq" id="faq">\n  <h2>FAQ</h2>\n  <div class="faq-item">\n    <button class="faq-question" type="button">How should I start implementing this ${escapeHtml(topic)} approach?</button>\n    <div class="faq-answer"><p>Start with one measurable workflow, define guardrails, and track outcomes weekly before scaling.</p></div>\n  </div>\n  <div class="faq-item">\n    <button class="faq-question" type="button">What metric should I track first?</button>\n    <div class="faq-answer"><p>Track cycle time or error rate first. Both usually reveal value faster than vanity metrics.</p></div>\n  </div>\n  <div class="faq-item">\n    <button class="faq-question" type="button">How long until results are visible?</button>\n    <div class="faq-answer"><p>Most teams see meaningful direction in 2 to 6 weeks if the workflow is scoped tightly and reviewed each week.</p></div>\n  </div>\n</section>`;
}

function buildHookSection(post) {
  const primaryTag = post.tags[0] || post.category;
  const secondaryTag = post.tags[1] || "Workflow Automation";
  return `<section class="hook-panel reveal-on-scroll">\n  <p class="hook-kicker">Quick Start Blueprint</p>\n  <h2>Use this guide to ship practical wins</h2>\n  <ul>\n    <li>Identify one high-impact ${escapeHtml(primaryTag.toLowerCase())} bottleneck this week.</li>\n    <li>Deploy one testable improvement with clear KPI tracking in your ${escapeHtml(secondaryTag.toLowerCase())} workflow.</li>\n    <li>Use the FAQ and CTA below to turn insights into an execution plan.</li>\n  </ul>\n  <div class=\"hook-links\">\n    <a href=\"#faq\">Jump to FAQ</a>\n    <a href=\"#work-with-me\">Go to CTA</a>\n  </div>\n</section>`;
}

function renderPostHtml(post) {
  const images = getPostImages(post);
  const articleHtml = injectImageCards(post.contentHtml, images.inline);
  const hasInlineFaq = /<h2>\s*FAQ\b/i.test(articleHtml);
  const articleHtmlWithFaqAnchor = hasInlineFaq
    ? articleHtml.replace(/<h2>(\s*FAQ[^<]*)<\/h2>/i, "<h2 id=\"faq\">$1</h2>")
    : articleHtml;
  const faqSection = hasInlineFaq ? "" : buildFaq(post);
  const description = post.excerpt.slice(0, 160);
  const pageTitle = `${post.title} | ${DEFAULT_SITE_NAME}`;
  const canonical = `${DOMAIN}/posts/${post.slug}.html`;
  const keywords = buildKeywords(post);
  const displayDate = formatDisplayDate(post.date);
  const ctaHref = post.affiliateLink ? sanitizeHref(post.affiliateLink) : "mailto:hamzajadoon71@gmail.com?subject=Workflow%20Consultation";
  const ctaLabel = post.affiliateLink ? "Try ElevenLabs Free" : "Work With Me";
  const ctaRel = post.affiliateLink ? "noopener noreferrer sponsored" : "";
  const ctaTarget = post.affiliateLink ? "_blank" : "";
  const ctaHeading = post.affiliateLink ? "Ready to launch with ElevenLabs?" : "Ready to build smarter AI workflows?";
  const ctaBody = post.affiliateLink
    ? "Start with the free plan and test real AI voice workflows in minutes."
    : "Book a workflow consultation and get a practical execution roadmap.";
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
  --bg: #fcfcfc;
  --bg-soft: #f5f7fa;
  --surface: #f5f7fa;
  --surface-2: #ffffff;
  --text: #111827;
  --text-body: #374151;
  --text-soft: #64748b;
  --text-muted: #94a3b8;
  --accent: #6366f1;
  --accent-2: #8b5cf6;
  --accent-hover: #8b5cf6;
  --border: #e2e8f0;
  --code: #f5f7fa;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(99, 102, 241, 0.1);
  --max: 720px;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "Inter", sans-serif;
  color: var(--text-body);
  background: var(--bg);
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
  background: rgba(255, 255, 255, .8);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 3px rgba(0, 0, 0, .06);
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
  background: var(--surface);
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
  background: linear-gradient(180deg, rgba(17, 24, 39, .16), rgba(17, 24, 39, .62) 60%, rgba(17, 24, 39, .76));
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
  border: 1px solid var(--accent);
  color: var(--accent);
  background: #ffffff;
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
  color: #ffffff;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: #e2e8f0;
  font-size: .9rem;
}
.meta .dot::before { content: "\\2022"; margin-right: 10px; color: var(--accent); }
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
  background: #ffffff;
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
.reveal-on-scroll {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity .45s ease, transform .45s ease;
}
.reveal-on-scroll.in-view {
  opacity: 1;
  transform: translateY(0);
}
.hook-panel {
  margin: 0 0 26px;
  padding: 16px;
  border: 1px solid rgba(99, 102, 241, .3);
  border-radius: 14px;
  background: linear-gradient(140deg, rgba(99, 102, 241, .08), #ffffff);
}
.hook-kicker {
  margin: 0 0 6px;
  font-size: .78rem;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--accent-hover);
  font-weight: 700;
}
.hook-panel h2 {
  margin: 0 0 8px;
  font-size: 1.1rem;
  color: var(--text);
}
.hook-panel ul {
  margin: 0;
  padding-left: 18px;
}
.hook-panel li {
  color: var(--text-soft);
  margin-bottom: 4px;
}
.hook-links {
  margin-top: 12px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.hook-links a {
  color: var(--accent-hover);
  font-size: .85rem;
  text-decoration: underline;
}
.article p,
.article li {
  color: var(--text-body);
  line-height: 1.88;
  font-size: 1.04rem;
}
.article a { color: var(--accent); text-decoration: underline; text-decoration-color: rgba(99, 102, 241, .4); }
.article a.affiliate-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 8px 0 10px;
  padding: 11px 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: #ffffff;
  text-decoration: none;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(239, 68, 68, .25);
}
.article a.affiliate-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 11px 24px rgba(239, 68, 68, .35);
}
.article .inline-promo {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--border);
  margin: 8px 0 6px;
}
.article h2,
.article h3 {
  font-family: "Plus Jakarta Sans", sans-serif;
  color: var(--text);
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
  background: var(--surface);
  padding: 12px 14px;
  border-radius: 10px;
  color: var(--text-body);
}
.article code {
  background: var(--code);
  border: 1px solid var(--border);
  border-radius: 7px;
  padding: 2px 7px;
  color: var(--text);
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
.article table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: var(--shadow-sm);
}
.article th,
.article td {
  border: 1px solid var(--border);
  padding: 10px 12px;
  text-align: left;
  vertical-align: top;
  font-size: .96rem;
  line-height: 1.65;
}
.article th {
  background: var(--surface);
  color: var(--text);
  font-weight: 700;
}
.image-card {
  margin: 24px 0;
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  background: #ffffff;
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
  background: #ffffff;
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
.faq-question::after {
  content: "+";
  float: right;
  color: var(--accent);
}
.faq-item.open .faq-question::after { content: "-"; }
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
.cta-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(99, 102, 241, .24);
}
.author {
  margin-top: 28px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #ffffff;
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
.lead-magnet {
  margin-top: 28px;
  border-radius: 16px;
  border: 1px solid rgba(239, 68, 68, .45);
  background: linear-gradient(145deg, rgba(239, 68, 68, .14), #ffffff 45%);
  padding: 16px;
}
.lead-magnet .kicker {
  margin: 0 0 6px;
  display: inline-block;
  color: #b91c1c;
  font-size: .78rem;
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
}
.lead-magnet h2 {
  margin: 0 0 10px;
  font-size: 1.25rem;
  color: var(--text);
}
.lead-subtle {
  margin: 0 0 8px;
  color: var(--text-soft);
  font-size: .92rem;
}
.lead-subtle a {
  color: #b91c1c;
  font-weight: 600;
}
.lead-brevo {
  margin-top: 8px;
  max-width: 760px;
  margin-left: auto;
  margin-right: auto;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: #ffffff;
}
.lead-brevo iframe {
  width: 100%;
  max-width: 100%;
  min-height: 420px;
  display: block;
}
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
  .lead-brevo iframe { min-height: 440px; }
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
${buildHookSection(post)}

${articleHtmlWithFaqAnchor}

${faqSection}

      <section class="cta reveal-on-scroll" id="work-with-me">
        <h2>${escapeHtml(ctaHeading)}</h2>
        <p>${escapeHtml(ctaBody)}</p>
        <ul>
          <li>Identify the highest ROI automation path</li>
          <li>Define guardrails and rollout milestones</li>
          <li>Deploy with measurable outcomes</li>
        </ul>
        <a class="cta-btn" href="${escapeHtml(ctaHref)}"${ctaTarget ? ` target="${ctaTarget}"` : ""}${ctaRel ? ` rel="${ctaRel}"` : ""}>${escapeHtml(ctaLabel)}</a>
      </section>

      <section class="author reveal-on-scroll">
        <div class="author-avatar" aria-hidden="true">HJ</div>
        <div>
          <strong>${DEFAULT_AUTHOR}</strong>
          <p>Student creator and operator writing practical playbooks on AI, LLMs, and automation systems.</p>
        </div>
      </section>

      <section class="lead-magnet reveal-on-scroll" aria-label="Free download">
        <p class="kicker">FREE DOWNLOAD</p>
        <h2>"The AI Starter Kit: 7 Tools to Start Earning With AI This Week"</h2>
        <p class="lead-subtle">Sign up and get the PDF link instantly in your email inbox.</p>
        <p class="lead-subtle">Already subscribed? <a href="/downloads/ai-starter-kit.pdf" target="_blank" rel="noopener noreferrer">Download the PDF here</a>.</p>
        <div class="lead-brevo">
          <iframe
            width="540"
            height="380"
            data-brevo-embed
            src="https://26663e63.sibforms.com/serve/MUIFAIAq3_TNpH815gpegtVFQL-YNK5Pw1LKjHSh0XiUaKQ9iO8TEictAqoSpKgN7E3M8Qm5f1WiV8Uw9IzgRBMGNWBQaSn4Y-5z9jAoRSZSOLebEsGqUMgL9SeBJYKOfjWz9lNXnNwuilOAm4yu7X4U4gwRM3NnBAmZKV2EaeFPU0qv-iUy2jikgbcfKJqQ-GhJVHzlNkHCws7GJA=="
            frameborder="0"
            scrolling="no"
            allowfullscreen
            style="display:block;margin-left:auto;margin-right:auto;max-width:100%;"
          ></iframe>
          <button class="cta-btn" type="button" data-brevo-reset style="margin-top:0.9rem;">Reset form</button>
        </div>
        <p style="margin-top:8px; color: var(--text-soft); font-size:.88rem;">No spam. Unsubscribe anytime.</p>
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

const revealItems = [...document.querySelectorAll('.reveal-on-scroll')];
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in-view');
    revealObserver.unobserve(entry.target);
  });
}, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
revealItems.forEach((item) => revealObserver.observe(item));

function updateProgress() {
  const doc = document.documentElement;
  const scrolled = doc.scrollTop;
  const max = doc.scrollHeight - doc.clientHeight;
  progress.style.width = max > 0 ? (((scrolled / max) * 100) + '%') : '0';
}
document.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const words = article.innerText.trim().split(/\\s+/).filter(Boolean).length;
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

document.querySelectorAll('.article a[href*="try.elevenlabs.io"]').forEach((link) => {
  link.classList.add('affiliate-btn');
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener noreferrer sponsored');
});

document.querySelectorAll('[data-brevo-reset]').forEach((button) => {
  button.addEventListener('click', () => {
    const scope = button.closest('.lead-brevo, .brevo-embed, .starter-kit-content') || document;
    const iframe = scope.querySelector('iframe[data-brevo-embed]');
    if (!iframe) return;

    const originalSrc = iframe.getAttribute('src') || '';
    if (!originalSrc) return;
    iframe.setAttribute('src', 'about:blank');
    window.setTimeout(() => {
      iframe.setAttribute('src', originalSrc);
    }, 60);
  });
});
</script>
</body>
</html>`;
}

function writePostPages(posts) {
  fs.mkdirSync(OUTPUT_POSTS_DIR, { recursive: true });
  for (const post of posts) {
    const outputPath = path.join(OUTPUT_POSTS_DIR, `${post.slug}.html`);
    if (!OVERWRITE_EXISTING_POST_PAGES && fs.existsSync(outputPath)) {
      const existing = fs.readFileSync(outputPath, "utf8");
      const hasConflictMarkers = /^(<<<<<<<|=======|>>>>>>>)/m.test(existing);
      const outputMtimeMs = fs.statSync(outputPath).mtimeMs;
      if (!hasConflictMarkers && outputMtimeMs >= (post.mtimeMs || 0)) continue;
    }
    const html = renderPostHtml(post);
    fs.writeFileSync(outputPath, html, "utf8");
  }
}

function writeDataFiles(posts) {
  const metadata = posts.map(({ contentHtml, imagePoolKey, imageVariantIndex, mtimeMs, ...rest }) => {
    const selected = getPostImages({ ...rest, imagePoolKey, imageVariantIndex });
    return { ...rest, image: selected.hero };
  });

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

