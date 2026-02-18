# Blog Publishing Guide

## Add a new blog
1. Create a new file in `content/posts/` with `.md` extension.
2. Use this frontmatter format:

```md
---
title: Your Post Title
date: 2026-02-11
slug: your-post-slug
category: AI Tools
excerpt: One-line summary shown on cards.
readTime: 8 min read
tags: [AI, Automation]
image: https://picsum.photos/seed/your-slug/1200/630
---

# Your detailed article starts here

Write in markdown.
```

## What happens automatically
- A detailed page is generated at `posts/your-post-slug.html`
- Blog list data updates in `assets/data/posts.json`
- Fallback list data updates in `assets/js/posts.js`
- `sitemap.xml` updates with the new post URL
- If slug matches an existing post, it is only overwritten when `OVERWRITE_EXISTING_POST_PAGES = true`.
- Existing generated `posts/*.html` files are preserved by default.
- New posts use the premium template with a quick-start hook panel, FAQ accordion, CTA section, and scroll-reveal motion.
- To regenerate existing posts too, set `OVERWRITE_EXISTING_POST_PAGES = true` in `scripts/build-posts.mjs`.

## Edit an existing post
1. Create or edit `content/posts/the-same-slug.md`.
2. Keep `slug:` exactly the same as the existing article slug.
3. Push to GitHub; the generated page and listing update automatically.

## Important
- Do not manually edit files in `posts/`, `assets/data/posts.json`, or `assets/js/posts.js`.
- Those are generated files and will be overwritten by the build script.

## GitHub auto-build
If your repo default branch is `main`, the workflow `.github/workflows/auto-build-blogs.yml` auto-runs on push and commits generated files.

## Local build (optional)
Run:

```bash
node scripts/build-posts.mjs
```
