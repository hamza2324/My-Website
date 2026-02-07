// Blog page: render 3 articles with click-to-read pointer hint
document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('.blog-main')) return;
    const postsContainer = document.getElementById('postsContainer');
    if (!postsContainer) return;

    const blogPosts = window.blogPosts || [];
    if (!blogPosts.length) return;

    postsContainer.innerHTML = '';
    blogPosts.forEach((post, i) => {
        const article = document.createElement('article');
        article.className = 'blog-post-card blog-card-clickable animate-on-scroll';
        article.dataset.category = post.category;
        const tagsHtml = (post.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('');
        article.innerHTML = `
            <a href="${post.url}" class="blog-card-link">
                <span class="pointer-hint"><i class="fas fa-hand-pointer"></i> Click to read</span>
                <div class="blog-card-header">
                    <span class="blog-category">${post.category}</span>
                    <span class="blog-date">${post.date}</span>
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="blog-meta">
                    <span class="read-time"><i class="far fa-clock"></i> ${post.readTime}</span>
                    <span class="post-tags">${tagsHtml}</span>
                </div>
                <span class="blog-link">Read Article <i class="fas fa-arrow-right"></i></span>
            </a>
        `;
        postsContainer.appendChild(article);
    });

    if (typeof initScrollAnimations === 'function') initScrollAnimations();
});
