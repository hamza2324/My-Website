function formatDate(value) {
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

async function loadPosts() {
  try {
    const response = await fetch("assets/data/posts.json", { cache: "no-store" });
    if (!response.ok) throw new Error("No generated posts.json");
    const data = await response.json();
    if (Array.isArray(data) && data.length) return data;
  } catch (err) {
    // Fallback to local JS array for local/dev compatibility.
  }
  if (typeof POSTS !== "undefined" && Array.isArray(POSTS)) return POSTS;
  return [];
}

function postUrl(post) {
  if (post.url) return post.url;
  if (post.slug) return `posts/${post.slug}.html`;
  return "blog.html";
}

function postCard(post) {
  return `
    <article class="post-card">
      <img src="${post.image}" alt="${post.title}" loading="lazy">
      <div class="post-body">
        <p class="meta"><span class="chip chip-static">${post.category}</span> ${formatDate(post.date)} &middot; ${post.readTime || "8 min read"}</p>
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
        <a href="${postUrl(post)}" class="inline-link">Read article</a>
      </div>
    </article>
  `;
}

function setupNav() {
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.querySelector(".site-nav");
  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      siteNav.classList.toggle("open");
    });
  }
}

function setupFooterYear() {
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
}

function setupCookieBanner() {
  const key = "hj_cookie_consent";
  const banner = document.getElementById("cookie-banner");
  const btn = document.getElementById("accept-cookies");
  if (!banner || !btn) return;
  if (!localStorage.getItem(key)) banner.hidden = false;
  btn.addEventListener("click", () => {
    localStorage.setItem(key, "accepted");
    banner.hidden = true;
  });
}

function setupForms() {
  const newsletterEndpoint = "https://formspree.io/f/mvzbzloa";
  document.querySelectorAll('form[data-form="newsletter"]').forEach((form) => {
    form.action = newsletterEndpoint;
    form.method = "POST";
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = form.querySelector('input[name="email"]');
      if (!email || !email.value.trim()) return;
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      try {
        const formData = new FormData(form);
        formData.append("_subject", "New Newsletter Subscription - HJ Automations");
        formData.append("source_page", window.location.pathname || "/");
        const response = await fetch(newsletterEndpoint, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" }
        });
        if (!response.ok) throw new Error("Newsletter submission failed");
        alert("Subscription received. Thank you.");
        form.reset();
      } catch (err) {
        alert("Subscription failed. Please try again or email hamzajadoon71@gmail.com.");
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });
  const contactForm = document.querySelector('form[data-form="contact"]');
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const hp = contactForm.querySelector('input[name="company_website"]');
      if (hp && hp.value.trim()) return;
      const status = document.getElementById("contact-status");
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (status) status.textContent = "Sending...";
      if (submitBtn) submitBtn.disabled = true;

      try {
        const formData = new FormData(contactForm);
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" }
        });

        if (!response.ok) throw new Error("Form submission failed");
        if (status) status.textContent = "Message sent successfully. We will reply in 24-48 hours.";
        contactForm.reset();
      } catch (err) {
        if (status) status.textContent = "Submission failed. Please try again or email hamzajadoon71@gmail.com.";
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
}

function setupRoiCalculator() {
  const form = document.getElementById("roi-form");
  const output = document.getElementById("roi-output");
  if (!form || !output) return;

  function calculate() {
    const hours = Number(form.elements.hours?.value || 0);
    const cost = Number(form.elements.cost?.value || 0);
    const weeks = Number(form.elements.weeks?.value || 0);
    const monthly = Math.max(0, Math.round(hours * cost * weeks));
    output.textContent = `$${monthly.toLocaleString("en-US")}`;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    calculate();
  });

  ["hours", "cost", "weeks"].forEach((key) => {
    form.elements[key]?.addEventListener("input", calculate);
  });

  calculate();
}

function initHomePage(posts) {
  const homeGrid = document.getElementById("home-post-grid");
  if (!homeGrid || !posts.length) return;
  homeGrid.innerHTML = posts.slice(0, 12).map(postCard).join("");
}

function initBlogPage(posts) {
  const blogGrid = document.getElementById("blog-post-grid");
  if (!blogGrid || !posts.length) return;

  const searchInput = document.getElementById("blog-search");
  const filterRoot = document.getElementById("category-filters");
  const pagination = document.getElementById("pagination");
  const popular = document.getElementById("popular-posts");
  const tagList = document.getElementById("tag-list");
  const pageSize = 10;

  let activeCategory = "All";
  let query = "";
  let currentPage = 1;

  const urlParams = new URLSearchParams(window.location.search);
  const categoryFromQuery = urlParams.get("category");
  if (categoryFromQuery) activeCategory = categoryFromQuery;

  function filteredPosts() {
    return posts.filter((p) => {
      const categoryOk = activeCategory === "All" || p.category === activeCategory;
      const q = query.toLowerCase();
      const tags = Array.isArray(p.tags) ? p.tags : [];
      const searchOk = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || tags.join(" ").toLowerCase().includes(q);
      return categoryOk && searchOk;
    });
  }

  function renderPagination(totalItems) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;
    pagination.innerHTML = "";
    for (let i = 1; i <= totalPages; i += 1) {
      const btn = document.createElement("button");
      btn.className = i === currentPage ? "page-btn active" : "page-btn";
      btn.textContent = String(i);
      btn.addEventListener("click", () => {
        currentPage = i;
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      pagination.appendChild(btn);
    }
  }

  function render() {
    const data = filteredPosts();
    const start = (currentPage - 1) * pageSize;
    const chunk = data.slice(start, start + pageSize);
    blogGrid.innerHTML = chunk.length ? chunk.map(postCard).join("") : '<p class="empty">No posts match your search.</p>';
    renderPagination(data.length);
  }

  if (filterRoot) {
    filterRoot.querySelectorAll("button[data-category]").forEach((btn) => {
      if (btn.dataset.category === activeCategory) btn.classList.add("active");
      btn.addEventListener("click", () => {
        activeCategory = btn.dataset.category || "All";
        currentPage = 1;
        filterRoot.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        render();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      query = e.target.value || "";
      currentPage = 1;
      render();
    });
  }

  if (popular) {
    popular.innerHTML = posts.slice(0, 5).map((p) => `<li><a href="${postUrl(p)}">${p.title}</a></li>`).join("");
  }
  if (tagList) {
    const tags = [...new Set(posts.flatMap((p) => (Array.isArray(p.tags) ? p.tags : [])))].slice(0, 20);
    tagList.innerHTML = tags.map((t) => `<span class="chip chip-static">${t}</span>`).join("");
  }

  render();
}

document.addEventListener("DOMContentLoaded", async () => {
  setupNav();
  setupFooterYear();
  setupCookieBanner();
  setupForms();
  setupRoiCalculator();
  const posts = (await loadPosts()).sort((a, b) => new Date(b.date) - new Date(a.date));
  initHomePage(posts);
  initBlogPage(posts);
});
