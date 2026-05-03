import { mkdirSync, writeFileSync, readFileSync } from "fs";
import { dirname } from "path";

const site = "https://hamzajadoon.cloud";

const existing = [
  ["word-counter","Word Counter","Text Tools","📝"],
  ["character-counter","Character Counter","Text Tools","🔢"],
  ["case-converter","Case Converter","Text Tools","🔠"],
  ["lorem-ipsum-generator","Lorem Ipsum Generator","Text Tools","📄"],
  ["text-reverser","Text Reverser","Text Tools","↩️"],
  ["remove-duplicate-lines","Remove Duplicate Lines","Text Tools","🧹"],
  ["text-diff-checker","Text Diff Checker","Text Tools","🆚"],
  ["text-to-slug","Text to Slug","Text Tools","🔗"],
  ["markdown-to-html","Markdown to HTML","Text Tools","#️⃣"],
  ["json-formatter","JSON Formatter & Validator","Developer Tools","🧩"],
  ["json-to-csv","JSON to CSV Converter","Developer Tools","📊"],
  ["csv-to-json","CSV to JSON Converter","Developer Tools","📈"],
  ["base64-encoder","Base64 Encoder/Decoder","Developer Tools","🔐"],
  ["url-encoder","URL Encoder/Decoder","Developer Tools","🌐"],
  ["html-to-text","HTML to Plain Text","Developer Tools","🧾"],
  ["uuid-generator","UUID Generator","Developer Tools","🆔"],
  ["code-minifier","Code Minifier","Developer Tools","⚙️"],
  ["color-picker","Color Picker & Converter","Design Tools","🎨"],
  ["hex-to-rgb","HEX to RGB Converter","Design Tools","🟦"],
  ["gradient-generator","CSS Gradient Generator","Design Tools","🌈"],
  ["image-compressor","Image Compressor","Image Tools","🗜️"],
  ["image-to-base64","Image to Base64","Image Tools","🖼️"],
  ["age-calculator","Age Calculator","Calculators","🎂"],
  ["bmi-calculator","BMI Calculator","Calculators","⚖️"],
  ["percentage-calculator","Percentage Calculator","Calculators","💯"],
  ["tip-calculator","Tip Calculator","Calculators","🧾"],
  ["unit-converter","Unit Converter","Calculators","📐"],
  ["timestamp-converter","Timestamp Converter","Date & Time Tools","⏱️"],
  ["password-generator","Password Generator","Security Tools","🔑"],
  ["random-number-generator","Random Number Generator","Utilities","🎲"],
  ["qr-code-generator","QR Code Generator","Utilities","🔳"],
  ["timezone-converter","Timezone Converter","Date & Time Tools","🌍"],
  ["ai-grammar-checker","AI Grammar Checker","AI Tools","🤖"],
  ["fyp-project-suggester","FYP Project Suggester","AI Tools","🎓"],
  ["resume-ats-checker","Resume ATS Checker","AI Tools","📄"],
  ["ai-text-summarizer","AI Text Summarizer","AI Tools","✂️"],
  ["ai-email-subject-generator","AI Email Subject Generator","AI Tools","📬"],
  ["ai-cover-letter-generator","AI Cover Letter Writer","AI Tools","🧑‍💼"],
  ["ai-blog-title-generator","AI Blog Title Generator","AI Tools","📰"],
  ["ai-code-explainer","AI Code Explainer","AI Tools","💡"],
  ["ai-sql-generator","AI SQL Generator","AI Tools","🗃️"]
];

const added = [
  ["reading-time-estimator","Reading Time Estimator","Text Tools","⏳","reading time estimator"],
  ["sentence-counter","Sentence Counter","Text Tools","📏","sentence counter online"],
  ["word-frequency-counter","Word Frequency Counter","Text Tools","📉","word frequency counter"],
  ["reading-level-analyzer","Reading Level Analyzer","Text Tools","📚","reading level analyzer online"],
  ["palindrome-checker","Palindrome Checker","Text Tools","🔁","palindrome checker online"],
  ["html-entity-encoder","HTML Entity Encoder","Developer Tools","&lt;&gt;","html entity encoder online"],
  ["regex-tester","Regex Tester","Developer Tools","🧪","regex tester online"],
  ["jwt-decoder","JWT Decoder","Developer Tools","🪪","jwt decoder online"],
  ["hash-generator","Hash Generator","Developer Tools","#","hash generator online"],
  ["yaml-to-json","YAML to JSON","Developer Tools","📑","yaml to json converter online"],
  ["xml-to-json","XML to JSON","Developer Tools","🗂️","xml to json converter online"],
  ["cron-expression-builder","Cron Expression Builder","Developer Tools","⏰","cron expression generator online"],
  ["sql-formatter","SQL Formatter","Developer Tools","🧬","sql formatter online"],
  ["http-status-codes","HTTP Status Code Lookup","Developer Tools","🌐","http status codes"],
  ["color-palette-generator","Color Palette Generator","Design Tools","🎨","color palette generator online"],
  ["favicon-generator","Favicon Generator","Design Tools","⭐","favicon generator online free"],
  ["box-shadow-generator","Box Shadow Generator","Design Tools","📦","box shadow generator css"],
  ["border-radius-generator","Border Radius Generator","Design Tools","◻️","border radius generator online"],
  ["svg-to-css","SVG to CSS Converter","Design Tools","🖌️","svg to css converter"],
  ["image-resizer","Image Resizer","Image Tools","🖼️","image resizer online free"],
  ["png-to-jpg","PNG to JPG Converter","Image Tools","🧾","png to jpg converter online free"],
  ["exif-remover","EXIF Data Remover","Image Tools","🕵️","remove exif data online"],
  ["watermark-adder","Watermark Adder","Image Tools","💧","add watermark to image online free"],
  ["screenshot-to-text","Screenshot to Text (OCR)","Image Tools","📸","image to text online free"],
  ["loan-emi-calculator","Loan / EMI Calculator","Calculators","🏦","emi calculator online"],
  ["compound-interest-calculator","Compound Interest Calculator","Calculators","📈","compound interest calculator online"],
  ["salary-to-hourly","Salary to Hourly Converter","Calculators","💵","salary to hourly calculator"],
  ["profit-margin-calculator","Profit Margin Calculator","Calculators","📊","profit margin calculator online"],
  ["gst-vat-calculator","GST / VAT Calculator","Calculators","🧾","gst calculator online"],
  ["roman-numeral-converter","Roman Numeral Converter","Calculators","🏛️","roman numeral converter"],
  ["binary-hex-converter","Binary / Hex Converter","Calculators","💻","binary to decimal converter"],
  ["fraction-to-decimal","Fraction to Decimal Converter","Calculators","➗","fraction to decimal converter online"],
  ["prime-number-checker","Prime Number Checker","Calculators","🔢","prime number checker online"],
  ["scientific-calculator","Scientific Calculator","Calculators","🧮","scientific calculator online"],
  ["days-between-dates","Days Between Dates","Date & Time Tools","📅","days between dates calculator"],
  ["countdown-timer","Countdown Timer","Date & Time Tools","⏲️","countdown timer online"],
  ["working-days-calculator","Working Days Calculator","Date & Time Tools","🗓️","working days calculator"],
  ["unix-timestamp-converter","Unix Timestamp Converter","Date & Time Tools","⌚","unix timestamp converter"],
  ["password-strength-checker","Strong Password Checker","Security Tools","🔐","password strength checker"],
  ["meta-tag-generator","Meta Tag Generator","SEO Tools","🏷️","meta tag generator online"],
  ["open-graph-preview","Open Graph Preview","SEO Tools","🔍","open graph preview tool"],
  ["robots-txt-generator","Robots.txt Generator","SEO Tools","🤖","robots.txt generator online"],
  ["utm-link-builder","UTM Link Builder","SEO Tools","🔗","utm link builder"],
  ["keyword-density-checker","Keyword Density Checker","SEO Tools","📌","keyword density checker online"],
  ["json-to-table","JSON to Table Viewer","Data Tools","📋","json to table viewer online"]
];

const all = [...existing.map(([slug,name,cat,emoji]) => ({slug,name,cat,emoji,kw:name.toLowerCase()})),
  ...added.map(([slug,name,cat,emoji,kw]) => ({slug,name,cat,emoji,kw}))];

const uniqueMap = new Map(all.map(t => [t.slug, t]));
const tools = [...uniqueMap.values()];

const ensure = (p) => mkdirSync(dirname(p), { recursive: true });
const write = (p, c) => { ensure(p); writeFileSync(p, c, "utf8"); };

function aboutText(t) {
  return `The ${t.name} on HamzaKit is a practical browser-based utility designed for students, developers, marketers, and business users who need instant results without signups. This free ${t.kw} tool helps you complete everyday tasks quickly while keeping your workflow simple and efficient. It works on desktop and mobile browsers, supports copy-ready output, and is optimized for fast performance. Whether you are handling professional work, academic tasks, or side projects, this tool saves time and improves accuracy. HamzaKit focuses on privacy-first utilities, clean interfaces, and no-login access so you can open a tool and get value immediately. If you are searching for a reliable ${t.kw}, this page gives you a straightforward experience, useful output formatting, and related tools to keep your productivity moving.`;
}

function toolPage(t) {
  const related = tools.filter(x => x.slug !== t.slug && x.cat === t.cat).slice(0, 4);
  const fallback = tools.filter(x => x.slug !== t.slug).slice(0, 4);
  const rel = (related.length ? related : fallback).map(r => `<a class="mini-card" href="/tools/${r.slug}/">${r.emoji} ${r.name}</a>`).join("");
  const faqExtra = t.slug === "reading-time-estimator"
    ? `<details><summary>What is the average reading speed?</summary><p>The average adult reads 200-250 words per minute silently. Our tool defaults to 200 wpm and lets you adjust speed.</p></details><details><summary>How do I estimate speaking time from text?</summary><p>Speaking is slower than silent reading, usually around 130-150 wpm. This tool provides speaking-time estimates automatically.</p></details>`
    : "";
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${t.name} — Free Online Tool | HamzaKit</title><meta name="description" content="Free ${t.kw}. No signup required. Works instantly in your browser on mobile and desktop."><meta name="keywords" content="${t.kw}, free ${t.name.toLowerCase()} online, no login ${t.cat.toLowerCase()}"><link rel="canonical" href="${site}/tools/${t.slug}/"><meta name="robots" content="index, follow"><meta property="og:title" content="${t.name} — Free Online Tool | HamzaKit"><meta property="og:description" content="Use ${t.name} free online. No login needed."><meta property="og:url" content="${site}/tools/${t.slug}/"><meta property="og:type" content="website"><meta property="og:image" content="${site}/assets/images/og-image.png"><link rel="stylesheet" href="../../assets/css/main.css"><link rel="stylesheet" href="../../assets/css/tools.css"><script type="application/ld+json">{"@context":"https://schema.org","@type":"SoftwareApplication","name":"${t.name}","description":"Free ${t.name} by HamzaKit","url":"${site}/tools/${t.slug}/","applicationCategory":"UtilityApplication","operatingSystem":"Any","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"author":{"@type":"Person","name":"Hamza Jadoon"}}</script><script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"${site}/"},{"@type":"ListItem","position":2,"name":"Tools","item":"${site}/tools/"},{"@type":"ListItem","position":3,"name":"${t.name}","item":"${site}/tools/${t.slug}/"}]}</script><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Is ${t.name} free to use?","acceptedAnswer":{"@type":"Answer","text":"Yes, ${t.name} is completely free on HamzaKit."}},{"@type":"Question","name":"Does ${t.name} work on mobile?","acceptedAnswer":{"@type":"Answer","text":"Yes, this tool is responsive and works on phones, tablets, and desktop browsers."}},{"@type":"Question","name":"Do I need to sign up?","acceptedAnswer":{"@type":"Answer","text":"No signup is required. Open and use instantly."}},{"@type":"Question","name":"Is my data private?","acceptedAnswer":{"@type":"Answer","text":"Most processing is handled in-browser for privacy and speed."}}]}</script></head><body><header class="site-nav"><nav><a class="logo" href="/">HamzaKit <span>⚡</span></a><div class="nav-links"><a href="/tools/">Tools</a><a href="/about/">About</a><a href="/contact/">Contact</a></div><a class="btn primary" href="/tools/">Browse All Tools →</a></nav></header><main class="tool-page"><nav class="breadcrumb"><a href="/">Home</a> > <a href="/tools/">Tools</a> > <span>${t.name}</span></nav><div class="ad-slot ad-slot--top" aria-label="Advertisement"></div><section class="tool-hero"><p class="icon">${t.emoji}</p><h1>${t.name} — Free Online ${t.cat.replace("Tools","Tool")}</h1><p>Fast, free and browser-based. No login required.</p><div class="tags"><span>Free</span><span>No Login</span><span>Browser-Based</span></div></section><section class="tool-shell reveal" data-tool="${t.slug}"><div class="tool-box"><div class="tool-ui" id="toolUI"></div><div class="tool-result" id="toolResult"></div></div><aside><div class="ad-slot ad-slot--sidebar" aria-label="Advertisement"></div></aside></section><section class="reveal"><h2>How to Use the ${t.name}</h2><ol><li>Enter or paste your input in the tool area.</li><li>Adjust tool options based on your needs.</li><li>Generate or analyze output instantly.</li><li>Use the copy button to copy results.</li></ol></section><section class="reveal"><h2>About the Free ${t.name}</h2><p>${aboutText(t)}</p></section><div class="ad-slot ad-slot--mid" aria-label="Advertisement"></div><section class="reveal"><h2>Frequently Asked Questions</h2><details><summary>Is the ${t.name} free to use?</summary><p>Yes, this tool is 100% free on HamzaKit.</p></details><details><summary>Does ${t.name} work on mobile?</summary><p>Yes. It is fully responsive for mobile, tablet, and desktop.</p></details><details><summary>Do I need an account?</summary><p>No account, no login, and no subscription required.</p></details><details><summary>Can I copy the output?</summary><p>Yes, output includes a one-click copy action.</p></details>${faqExtra}</section><section class="reveal"><h2>You Might Also Like</h2><div class="related-grid">${rel}</div></section><div class="ad-slot ad-slot--bottom" aria-label="Advertisement"></div></main><footer class="site-footer"><div class="cols"><div><h3>HamzaKit</h3><p>Free online tools for everyone.</p></div><div><h4>Tools</h4><a href="/tools/">Browse All Tools</a></div><div><h4>Company</h4><a href="/about/">About</a><a href="/contact/">Contact</a></div><div><h4>Legal</h4><a href="/privacy-policy/">Privacy</a><a href="/terms-of-service/">Terms</a><a href="/cookie-policy/">Cookies</a></div></div><p>© 2025 HamzaKit by Hamza Jadoon.</p></footer><script defer src="../../assets/js/tool-runtime.js"></script><script defer src="../../assets/js/animations.js"></script></body></html>`;
}

tools.forEach(t => write(`tools/${t.slug}/index.html`, toolPage(t)));

const cats = ["AI Tools","Text Tools","Developer Tools","Design Tools","Image Tools","Calculators","Date & Time Tools","Security Tools","SEO Tools","Data Tools","Utilities"];
const categoryBlocks = cats.map(cat => {
  const list = tools.filter(t => t.cat === cat);
  if (!list.length) return "";
  return `<section class="tool-category"><h2>${cat} <span class="count">${list.length}</span></h2><div class="grid">${list.map(t => `<article class="tool-card reveal" data-name="${(t.name+" "+t.kw).toLowerCase()}" data-category="${t.cat}"><span class="accent"></span><p class="icon">${t.emoji}</p><h3>${t.name}</h3><p>Free online ${t.kw}.</p><div class="tags"><span>${t.cat}</span><span>Free</span></div><a class="btn ghost" href="/tools/${t.slug}/">Open Tool →</a></article>`).join("")}</div></section>`;
}).join("");

const toolsIndex = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>All Free Tools | HamzaKit</title><meta name="description" content="Browse 90+ free online tools by category on HamzaKit."><link rel="canonical" href="${site}/tools/"><link rel="stylesheet" href="../assets/css/main.css"><link rel="stylesheet" href="../assets/css/tools.css"></head><body><header class="site-nav"><nav><a class="logo" href="/">HamzaKit <span>⚡</span></a><div class="nav-links"><a href="/tools/">Tools <b id="countBadge">90+ Tools</b></a><a href="/about/">About</a><a href="/contact/">Contact</a></div><a class="btn primary" href="/tools/">Browse All Tools →</a></nav></header><main class="tool-grid"><h1>Browse All Tools</h1><p>Use filters and search to find the right tool fast.</p><input id="toolSearch" type="search" placeholder="Search tools by name or keyword"><div class="chips">${cats.map(c=>`<button class="chip" data-filter="${c}">${c}</button>`).join("")}<button class="chip" data-filter="all">All</button></div>${categoryBlocks}</main><footer class="site-footer"><p>© 2025 HamzaKit by Hamza Jadoon.</p></footer><script>window.__TOOL_SEARCH_INDEX=${JSON.stringify(tools.map(t=>({slug:t.slug,name:t.name,category:t.cat,keywords:t.kw})))};</script><script defer src="../assets/js/main.js"></script><script defer src="../assets/js/animations.js"></script></body></html>`;
write("tools/index.html", toolsIndex);

let home = readFileSync("index.html", "utf8");
home = home.replace(/35\+\s*Free Tools/g, "90+ Free Tools")
  .replace(/35\+\s*Tools/g, "90+ Tools")
  .replace(/data-count="40"/g, 'data-count="90"')
  .replace("Most Popular Tools", "Most Popular Tools");
writeFileSync("index.html", home, "utf8");

const urls = tools.map(t => `  <url><loc>${site}/tools/${t.slug}/</loc><lastmod>2025-01-01</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`).join("\n");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n  <url><loc>${site}/</loc><lastmod>2025-01-01</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>\n  <url><loc>${site}/tools/</loc><lastmod>2025-01-01</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>\n${urls}\n  <url><loc>${site}/about/</loc><lastmod>2025-01-01</lastmod><changefreq>yearly</changefreq><priority>0.5</priority></url>\n  <url><loc>${site}/contact/</loc><lastmod>2025-01-01</lastmod><changefreq>yearly</changefreq><priority>0.4</priority></url>\n  <url><loc>${site}/privacy-policy/</loc><lastmod>2025-01-01</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>\n  <url><loc>${site}/terms-of-service/</loc><lastmod>2025-01-01</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>\n  <url><loc>${site}/cookie-policy/</loc><lastmod>2025-01-01</lastmod><changefreq>yearly</changefreq><priority>0.3</priority></url>\n</urlset>`;
write("sitemap.xml", sitemap);

const mainJs = `const q=s=>document.querySelector(s);const qa=s=>[...document.querySelectorAll(s)];const search=q('#toolSearch');const cards=qa('.tool-card');const chips=qa('.chip');let active='all';function apply(){const v=(search?.value||'').toLowerCase();cards.forEach(c=>{const bySearch=(c.dataset.name||'').includes(v);const byCat=active==='all'||c.dataset.category===active;c.style.display=(bySearch&&byCat)?'block':'none';});}if(search){search.addEventListener('input',apply);}chips.forEach(ch=>ch.addEventListener('click',()=>{active=ch.dataset.filter||'all';apply();}));apply();window.addEventListener('scroll',()=>{const h=document.documentElement;const p=(h.scrollTop/(h.scrollHeight-h.clientHeight))*100;const bar=q('.progress');if(bar)bar.style.width=p+'%';});`;
write("assets/js/main.js", mainJs);

console.log(`Generated/updated ${tools.length} tool pages and global indexes.`);
