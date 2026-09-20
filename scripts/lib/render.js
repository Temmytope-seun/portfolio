const fs = require('fs');
const path = require('path');
const { PARTIALS_DIR, SITE_URL, POSTS_PER_PAGE } = require('./config');
const { getRelatedPosts } = require('./related');

const partials = {
  headMeta: fs.readFileSync(path.join(PARTIALS_DIR, 'head-meta.html'), 'utf8'),
  nav: fs.readFileSync(path.join(PARTIALS_DIR, 'nav.html'), 'utf8'),
  footer: fs.readFileSync(path.join(PARTIALS_DIR, 'footer.html'), 'utf8'),
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function embedJson(id, data) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return `<script type="application/json" id="${id}">${json}</script>`;
}

function renderTagPills(tags) {
  return tags.map((t) => `<span class="article-tag">${escapeHtml(t)}</span>`).join('\n    ');
}

function renderArticleCard(post) {
  return `<a href="${post.url}" class="article-card reveal">
  <div class="article-meta">
    ${renderTagPills(post.tags)}
    <span class="article-date"><i class="fas fa-calendar"></i> ${post.dateDisplay}</span>
    <span class="article-read-time"><i class="fas fa-clock"></i> ${post.readTime} min read</span>
  </div>
  <h3 class="article-title">${escapeHtml(post.title)}</h3>
  <p class="article-excerpt">${escapeHtml(post.excerpt)}</p>
  <div class="article-footer">
    <span class="article-platform"><i class="fas fa-blog"></i> Blog</span>
    <span class="article-arrow">Read article <i class="fas fa-arrow-right"></i></span>
  </div>
</a>`;
}

function renderTagChips(tags) {
  return tags
    .map((t) => `<button type="button" class="tag-chip" data-tag="${escapeHtml(t)}" aria-pressed="false">${escapeHtml(t)}</button>`)
    .join('\n    ');
}

function renderPagination(totalPosts, currentPage) {
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  if (totalPages <= 1) {
    return '<nav class="pagination" id="blog-pagination" aria-label="Blog pagination" hidden></nav>';
  }
  const buttons = [];
  buttons.push(
    `<button type="button" class="page-btn page-btn-prev" data-page="${currentPage - 1}" ${currentPage <= 1 ? 'disabled' : ''} aria-label="Previous page"><i class="fas fa-chevron-left"></i></button>`
  );
  for (let i = 1; i <= totalPages; i++) {
    buttons.push(
      `<button type="button" class="page-btn" data-page="${i}" ${i === currentPage ? 'aria-current="page"' : ''}>${i}</button>`
    );
  }
  buttons.push(
    `<button type="button" class="page-btn page-btn-next" data-page="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''} aria-label="Next page"><i class="fas fa-chevron-right"></i></button>`
  );
  return `<nav class="pagination" id="blog-pagination" aria-label="Blog pagination">
    <div class="pagination-list">${buttons.join('\n      ')}</div>
  </nav>`;
}

function renderListingPage(posts, allTags) {
  const title = 'Blog | Temitope Oluwaseun';
  const description = 'Technical writing on MLOps, machine learning pipelines, and production AI systems by Temitope Oluwaseun Adegbeyeni.';
  const canonical = `${SITE_URL}/blog/`;

  const firstPagePosts = posts.slice(0, POSTS_PER_PAGE);
  const postsMetadata = posts.map((p) => ({
    title: p.title,
    slug: p.slug,
    url: p.url,
    excerpt: p.excerpt,
    tags: p.tags,
    readTime: p.readTime,
    dateIso: p.dateIso,
    dateDisplay: p.dateDisplay,
    coverImage: p.coverImage,
  }));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${canonical}" />

  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${SITE_URL}/profile.jpg" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${SITE_URL}/profile.jpg" />

${partials.headMeta}
</head>
<body>

  <canvas id="particle-canvas"></canvas>

${partials.nav}

  <section id="blog-listing">
    <div class="section-container">
      <div class="section-header reveal">
        <span class="section-number">Blog</span>
        <h2 class="section-title">All Posts</h2>
        <div class="section-line"></div>
      </div>

      <div class="blog-toolbar reveal">
        <div class="blog-search">
          <i class="fas fa-search blog-search-icon" aria-hidden="true"></i>
          <input type="search" id="blog-search-input" class="blog-search-input" placeholder="Search posts..." aria-label="Search blog posts" />
        </div>
        <div class="tag-filter-list" id="blog-tag-filters" role="group" aria-label="Filter by tag">
    ${renderTagChips(allTags)}
        </div>
      </div>

      <p class="blog-results-count" id="blog-results-count" aria-live="polite">Showing ${firstPagePosts.length} of ${posts.length} posts</p>

      <div class="articles-grid" id="blog-results-grid">
        ${firstPagePosts.map(renderArticleCard).join('\n        ')}
      </div>

      <div class="blog-empty-state" id="blog-empty-state" role="status" hidden>
        <i class="fas fa-magnifying-glass"></i>
        <p>No posts found. Try a different search term or tag.</p>
      </div>

      ${renderPagination(posts.length, 1)}
    </div>
  </section>

${partials.footer}

  ${embedJson('blog-posts-data', postsMetadata)}
  <script src="/script.js"></script>
  <script src="/blog.js"></script>
</body>
</html>
`;
}

function renderTocHtml(toc) {
  if (!toc.length) return '';
  const items = toc
    .map((h) => `<li class="post-toc-item post-toc-level-${h.level}"><a href="#${h.id}">${escapeHtml(h.text)}</a></li>`)
    .join('\n        ');
  return `<aside class="post-toc">
      <p class="post-toc-title">On this page</p>
      <ul class="post-toc-list">
        ${items}
      </ul>
    </aside>`;
}

function renderRelatedSection(related) {
  if (!related.length) return '';
  return `<section class="related-posts">
        <h3 class="other-projects-title">Related Posts</h3>
        <div class="articles-grid">
          ${related.map(renderArticleCard).join('\n          ')}
        </div>
      </section>`;
}

function renderDetailPage(post, allPosts) {
  const title = `${post.title} | Temitope Oluwaseun`;
  const canonical = `${SITE_URL}${post.url}`;
  const related = getRelatedPosts(post, allPosts);
  const toc = renderTocHtml(post.toc);

  const coverHtml = post.coverImage
    ? `<img src="${post.coverImage}" alt="${escapeHtml(post.title)} cover image" class="post-cover" loading="lazy" decoding="async" />`
    : '';

  const mediumBannerHtml = post.mediumUrl
    ? `<a href="${post.mediumUrl}" target="_blank" rel="noopener noreferrer" class="post-medium-banner"><i class="fab fa-medium"></i> Originally published on Medium</a>`
    : '';

  const articleTagMeta = post.tags.map((t) => `  <meta property="article:tag" content="${escapeHtml(t)}" />`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(post.excerpt)}" />
  <link rel="canonical" href="${canonical}" />

  <meta property="og:type" content="article" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:title" content="${escapeHtml(post.title)}" />
  <meta property="og:description" content="${escapeHtml(post.excerpt)}" />
  <meta property="og:image" content="${post.coverImageAbsolute}" />
  <meta property="article:published_time" content="${post.dateIso}" />
${articleTagMeta}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(post.title)}" />
  <meta name="twitter:description" content="${escapeHtml(post.excerpt)}" />
  <meta name="twitter:image" content="${post.coverImageAbsolute}" />

${partials.headMeta}
</head>
<body>

  <canvas id="particle-canvas"></canvas>

${partials.nav}

  <section id="blog-post">
    <div class="section-container">
      <a href="/blog/" class="post-back-link"><i class="fas fa-arrow-left"></i> Back to Blog</a>

      <header class="post-header reveal">
        ${mediumBannerHtml}
        <h1 class="post-title">${escapeHtml(post.title)}</h1>
        <div class="post-meta">
          ${renderTagPills(post.tags)}
          <span class="article-date"><i class="fas fa-calendar"></i> ${post.dateDisplay}</span>
          <span class="article-read-time"><i class="fas fa-clock"></i> ${post.readTime} min read</span>
        </div>
        ${coverHtml}
      </header>

      <div class="post-layout">
        <article class="post-body reveal">
          ${post.bodyHtml}
        </article>
        ${toc}
      </div>

      ${renderRelatedSection(related)}
    </div>
  </section>

${partials.footer}

  <script src="/script.js"></script>
</body>
</html>
`;
}

module.exports = { renderListingPage, renderDetailPage };
