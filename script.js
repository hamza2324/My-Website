(function () {
  "use strict";

  const body = document.body;
  const header = document.querySelector(".site-header");
  const nav = document.getElementById("site-nav");
  const menuToggle = document.getElementById("menu-toggle");

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function onScroll() {
    if (!header) return;
    if (window.scrollY > 12) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const revealNodes = Array.from(document.querySelectorAll("[data-reveal]"));
  if (revealNodes.length) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14 }
    );

    revealNodes.forEach((node) => revealObserver.observe(node));
  }

  const countNodes = Array.from(document.querySelectorAll("[data-countup]"));
  if (countNodes.length) {
    const animateValue = (node) => {
      const target = Number(node.getAttribute("data-countup"));
      const prefix = node.getAttribute("data-prefix") || "";
      const suffix = node.getAttribute("data-suffix") || "";
      if (!Number.isFinite(target)) return;

      const duration = 1200;
      const start = performance.now();
      const from = 0;

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(from + (target - from) * eased);
        node.textContent = `${prefix}${value}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    };

    const countObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateValue(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.45 }
    );

    countNodes.forEach((node) => countObserver.observe(node));
  }

  const parallaxNodes = Array.from(document.querySelectorAll("[data-parallax]"));
  if (parallaxNodes.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const updateParallax = () => {
      const viewport = window.innerHeight || 1;
      parallaxNodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewport) return;
        const speed = Number(node.getAttribute("data-speed") || "0.06");
        const center = rect.top + rect.height / 2;
        const delta = (center - viewport / 2) * speed;
        node.style.transform = `translate3d(0, ${delta}px, 0)`;
      });
    };

    updateParallax();
    window.addEventListener("scroll", updateParallax, { passive: true });
    window.addEventListener("resize", updateParallax);
  }

  const formatDate = (date) => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const postHref = (post) => post.url || `posts/${post.slug}.html`;

  const deriveFilterCategory = (postCategory) => {
    const value = String(postCategory || "").toLowerCase();
    if (value.includes("llm")) return "LLM Guides";
    if (value.includes("automation")) return "Automation";
    if (value.includes("case") || value.includes("industry")) return "Case Studies";
    if (value.includes("ai")) return "AI Tools";
    return "AI Tools";
  };

  const cardImage = (post) => {
    const src = post.image || "";
    const alt = post.imageAlt || `${post.title} cover image`;
    if (!src) {
      return `<div class="post-media" aria-hidden="true"></div>`;
    }
    return `<div class="post-media"><img src="${src}" alt="${alt}" loading="lazy"></div>`;
  };

  const blogImage = (post) => {
    const src = post.image || "";
    const alt = post.imageAlt || `${post.title} cover image`;
    if (!src) {
      return `<div class="blog-media" aria-hidden="true"></div>`;
    }
    return `<div class="blog-media"><img src="${src}" alt="${alt}" loading="lazy"></div>`;
  };

  function observeNewReveal(scope) {
    const nodes = Array.from(scope.querySelectorAll("[data-reveal]"));
    if (!nodes.length) return;
    nodes.forEach((node) => node.classList.add("is-visible"));
  }

  async function fetchPosts() {
    const response = await fetch("posts/posts.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to load posts/posts.json");
    const posts = await response.json();
    return Array.isArray(posts) ? posts : [];
  }

  const featuredHost = document.getElementById("featured-posts");
  const relatedHost = document.getElementById("related-posts");
  const postCountNode = document.getElementById("post-count");
  const totalGuidesNode = document.getElementById("total-guides");

  const blogList = document.getElementById("blog-list");
  const filterButtons = Array.from(document.querySelectorAll(".filter-pill"));
  const searchInput = document.getElementById("search-input");
  const loadMore = document.getElementById("load-more");

  let cachedPosts = null;

  async function ensurePosts() {
    if (cachedPosts) return cachedPosts;
    cachedPosts = await fetchPosts();
    cachedPosts.sort((a, b) => {
      const dateDelta = new Date(b.date) - new Date(a.date);
      if (dateDelta !== 0) return dateDelta;
      const priorityDelta = Number(b.priority || 0) - Number(a.priority || 0);
      if (priorityDelta !== 0) return priorityDelta;
      return Number(a.id || 0) - Number(b.id || 0);
    });
    return cachedPosts;
  }

  async function renderFeaturedPosts() {
    if (!featuredHost) return;
    try {
      const posts = await ensurePosts();
      if (totalGuidesNode) totalGuidesNode.textContent = `${posts.length}+`;

      featuredHost.innerHTML = posts.slice(0, 3).map((post) => {
        const filterCategory = deriveFilterCategory(post.category);
        return `
          <article class="post-card glass-card hover-lift" data-reveal data-parallax data-speed="0.04">
            ${cardImage(post)}
            <div class="post-body">
              <span class="badge">${filterCategory}</span>
              <h3 class="post-title" style="margin-top:0.8rem;"><a href="${postHref(post)}">${post.title}</a></h3>
              <p style="margin-top:0.7rem;">${post.excerpt || ""}</p>
              <div class="meta-row">
                <span>${formatDate(post.date)} | ${post.readTime || ""}</span>
                <a href="${postHref(post)}">Read More -></a>
              </div>
            </div>
          </article>`;
      }).join("");

      observeNewReveal(featuredHost);
    } catch (_error) {
      featuredHost.innerHTML = "<p class='muted'>Unable to load guides right now.</p>";
    }
  }

  async function renderRelatedPosts() {
    if (!relatedHost) return;

    try {
      const posts = await ensurePosts();
      const currentPath = window.location.pathname.replace(/^\/+/, "");
      const related = posts.filter((post) => postHref(post) !== currentPath).slice(0, 3);

      relatedHost.innerHTML = related.map((post) => {
        const filterCategory = deriveFilterCategory(post.category);
        return `
          <article class="related-card glass-card hover-lift">
            <div class="related-media">${post.image ? `<img src="${post.image}" alt="${post.imageAlt || post.title}" loading="lazy">` : ""}</div>
            <div class="related-body">
              <span class="badge">${filterCategory}</span>
              <h3 class="related-title" style="margin-top:0.8rem;"><a href="${postHref(post)}">${post.title}</a></h3>
              <p style="margin-top:0.65rem;">${post.excerpt || ""}</p>
              <div class="meta-row">
                <span>${formatDate(post.date)}</span>
                <a href="${postHref(post)}">Read -></a>
              </div>
            </div>
          </article>`;
      }).join("");
    } catch (_error) {
      relatedHost.innerHTML = "<p class='muted'>Unable to load related posts.</p>";
    }
  }

  function attachBlogFiltering(posts) {
    if (!blogList) return;

    let activeFilter = "All";
    let query = "";
    let visible = 6;

    const applyFilters = () => {
      const filtered = posts.filter((post) => {
        const mapped = deriveFilterCategory(post.category);
        const filterMatch = activeFilter === "All" || mapped === activeFilter;
        const haystack = `${post.title || ""} ${post.excerpt || ""} ${post.category || ""}`.toLowerCase();
        const queryMatch = !query || haystack.includes(query);
        return filterMatch && queryMatch;
      });

      if (postCountNode) {
        postCountNode.textContent = `${filtered.length}+ Articles`;
      }

      const visiblePosts = filtered.slice(0, visible);

      blogList.innerHTML = visiblePosts.map((post) => {
        const mapped = deriveFilterCategory(post.category);
        return `
          <article class="blog-card glass-card hover-lift" data-reveal>
            <span class="category-badge">${mapped}</span>
            ${blogImage(post)}
            <div class="blog-body">
              <h2 class="blog-title"><a href="${postHref(post)}">${post.title}</a></h2>
              <p style="margin-top:0.7rem;">${post.excerpt || ""}</p>
              <div class="meta-row">
                <span>${formatDate(post.date)} | ${post.readTime || ""}</span>
                <a href="${postHref(post)}">Read -></a>
              </div>
            </div>
          </article>`;
      }).join("") || "<p class='muted'>No posts matched this filter.</p>";

      if (loadMore) {
        loadMore.style.display = visible < filtered.length ? "inline-flex" : "none";
      }

      observeNewReveal(blogList);
    };

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        activeFilter = button.getAttribute("data-filter") || "All";
        visible = 6;
        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", (event) => {
        query = String(event.target.value || "").trim().toLowerCase();
        visible = 6;
        applyFilters();
      });
    }

    if (loadMore) {
      loadMore.addEventListener("click", () => {
        visible += 4;
        applyFilters();
      });
    }

    applyFilters();
  }

  function initPostTemplate() {
    const articleBody = document.getElementById("article-body");
    if (!articleBody) return;

    const progress = document.getElementById("reading-progress");
    const tocList = document.getElementById("toc-list");
    const headings = Array.from(articleBody.querySelectorAll("h2"));

    if (tocList) {
      const links = headings.map((heading, index) => {
        const id = heading.id || `section-${index + 1}`;
        heading.id = id;
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#${id}`;
        link.textContent = heading.textContent || `Section ${index + 1}`;
        item.appendChild(link);
        tocList.appendChild(item);
        return link;
      });

      if (links.length) {
        const tocObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              links.forEach((link) => link.classList.remove("active"));
              const active = links.find((link) => link.getAttribute("href") === `#${entry.target.id}`);
              if (active) active.classList.add("active");
            });
          },
          { rootMargin: "-25% 0px -62% 0px", threshold: 0.1 }
        );

        headings.forEach((heading) => tocObserver.observe(heading));
      }
    }

    if (progress) {
      const setProgress = () => {
        const doc = document.documentElement;
        const top = doc.scrollTop || document.body.scrollTop;
        const max = doc.scrollHeight - doc.clientHeight;
        const width = max > 0 ? (top / max) * 100 : 0;
        progress.style.width = `${Math.min(100, Math.max(0, width))}%`;
      };

      setProgress();
      document.addEventListener("scroll", setProgress, { passive: true });
      window.addEventListener("resize", setProgress);
    }

    const shareButtons = Array.from(document.querySelectorAll("[data-share]"));
    shareButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const type = button.getAttribute("data-share");
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);

        if (type === "x") {
          window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, "_blank", "noopener,noreferrer");
          return;
        }

        if (type === "linkedin") {
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener,noreferrer");
          return;
        }

        if (type === "copy") {
          try {
            await navigator.clipboard.writeText(window.location.href);
            button.textContent = "Done";
            setTimeout(() => {
              button.textContent = "Link";
            }, 1200);
          } catch (_error) {
            button.textContent = "Copy";
          }
        }
      });
    });
  }

  function initHomeLeadPopup() {
    if (!body.classList.contains("page-home")) return;
    const popup = document.getElementById("starter-kit-popup");
    if (!popup) return;

    const closeButtons = Array.from(popup.querySelectorAll("[data-popup-close]"));
    const form = popup.querySelector("form");
    let shown = false;
    let timerElapsed = false;
    let hasScrolled = false;

    const closePopup = () => {
      popup.classList.remove("open");
      popup.setAttribute("aria-hidden", "true");
      document.body.classList.remove("popup-open");
    };

    const openPopup = () => {
      if (shown) return;
      shown = true;
      popup.classList.add("open");
      popup.setAttribute("aria-hidden", "false");
      document.body.classList.add("popup-open");
    };

    const tryOpen = () => {
      if (timerElapsed && hasScrolled) openPopup();
    };

    const timer = window.setTimeout(() => {
      timerElapsed = true;
      tryOpen();
    }, 10000);

    const onScroll = () => {
      if (hasScrolled) return;
      if (window.scrollY < 80) return;
      hasScrolled = true;
      tryOpen();
      window.removeEventListener("scroll", onScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    closeButtons.forEach((btn) => btn.addEventListener("click", closePopup));
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && popup.classList.contains("open")) closePopup();
    });

    if (form) {
      form.addEventListener("submit", () => {
        window.clearTimeout(timer);
      });
    }

  }

  function initBrevoEmbedResets() {
    const resetButtons = Array.from(document.querySelectorAll("[data-brevo-reset]"));
    if (!resetButtons.length) return;

    resetButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const scope = button.closest(".lead-brevo, .brevo-embed, .starter-kit-content") || document;
        const iframe = scope.querySelector("iframe[data-brevo-embed]");
        if (!iframe) return;

        const originalSrc = iframe.getAttribute("src") || "";
        if (!originalSrc) return;
        iframe.setAttribute("src", "about:blank");
        window.setTimeout(() => {
          iframe.setAttribute("src", originalSrc);
        }, 60);
      });
    });
  }

  const needsPosts = Boolean(featuredHost || blogList || relatedHost || totalGuidesNode);

  if (needsPosts) {
    ensurePosts()
      .then((posts) => {
        if (totalGuidesNode) totalGuidesNode.textContent = `${posts.length}+`;
        if (postCountNode && !blogList) postCountNode.textContent = `${posts.length}+ Articles`;
        renderFeaturedPosts();
        renderRelatedPosts();
        if (blogList) attachBlogFiltering(posts);
      })
      .catch(() => {
        if (featuredHost) featuredHost.innerHTML = "<p class='muted'>Unable to load latest guides.</p>";
        if (blogList) blogList.innerHTML = "<p class='muted'>Unable to load blog posts right now.</p>";
        if (relatedHost) relatedHost.innerHTML = "<p class='muted'>Unable to load related posts.</p>";
      });
  }

  initPostTemplate();
  initHomeLeadPopup();
  initBrevoEmbedResets();

  if (body.classList.contains("page-blog") && postCountNode && !blogList) {
    postCountNode.textContent = "20+ Articles";
  }
})();
