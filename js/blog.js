// Blog page interactions: search, filters, view toggle, load more
// Relies on global `blogPosts` array defined in blog.html

document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('.blog-main')) return;

    const postsContainer = document.getElementById('postsContainer');
    const searchInput = document.getElementById('blogSearch');
    const loadMoreBtn = document.getElementById('loadMore');
    const viewButtons = document.querySelectorAll('.view-btn');

    let visibleCount = 6;
    let currentView = 'grid';
    let currentQuery = '';

    function normalize(str) {
        return (str || '').toString().toLowerCase();
    }

    function matchesQuery(post, query) {
        if (!query) return true;
        const q = normalize(query);
        return [
            post.title,
            post.excerpt,
            post.category,
            ...(post.tags || [])
        ].some(field => normalize(field).includes(q));
    }

    function getFilteredPosts() {
        if (!Array.isArray(window.blogPosts)) return [];
        return window.blogPosts.filter(post => matchesQuery(post, currentQuery));
    }

    function renderPosts() {
        const posts = getFilteredPosts();
        postsContainer.innerHTML = '';

        const toRender = posts.slice(0, visibleCount);

        toRender.forEach(post => {
            const card = document.createElement('article');
            card.className = `blog-post-card ${currentView === 'list' ? 'list-view' : ''} animate-on-scroll`;
            card.dataset.category = post.category;

            const imageStyle = post.image
                ? `style="background-image:url('${post.image}');background-size:cover;background-position:center;"`
                : '';

            card.innerHTML = `
                <div class="post-image" ${imageStyle}>
                    <div class="blog-category">${post.category}</div>
                    <div class="read-time">${post.readTime}</div>
                </div>
                <div class="post-content">
                    <div class="post-meta">
                        <span class="post-date">${post.date}</span>
                        <span class="post-author">By AI Automation Team</span>
                    </div>
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <div class="post-tags">
                        ${(post.tags || [])
                            .map(tag => `<span class="tag">${tag}</span>`)
                            .join('')}
                    </div>
                    <a href="${post.url}" class="read-more">
                        Read Article
                        <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            `;

            postsContainer.appendChild(card);
        });

        // Show/hide Load More
        if (posts.length > visibleCount) {
            loadMoreBtn.style.display = 'inline-flex';
        } else {
            loadMoreBtn.style.display = 'none';
        }

        // Re‑init scroll animations for new cards
        if (typeof initScrollAnimations === 'function') {
            initScrollAnimations();
        }
    }

    // Search
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            currentQuery = e.target.value;
            visibleCount = 6;
            renderPosts();
        });
    }

    // View toggle (grid / list)
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            if (!view || view === currentView) return;

            currentView = view;
            viewButtons.forEach(b => b.classList.toggle('active', b === btn));

            if (currentView === 'list') {
                postsContainer.classList.add('list-view');
            } else {
                postsContainer.classList.remove('list-view');
            }

            renderPosts();
        });
    });

    // Load More
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            visibleCount += 6;
            renderPosts();
        });
    }

    // Initial render
    renderPosts();
});

