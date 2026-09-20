(function () {
  const POSTS_PER_PAGE = 6;

  const dataEl = document.getElementById('blog-posts-data');
  if (!dataEl) return;

  const allPosts = JSON.parse(dataEl.textContent);

  const searchInput  = document.getElementById('blog-search-input');
  const tagFilterList = document.getElementById('blog-tag-filters');
  const resultsGrid   = document.getElementById('blog-results-grid');
  const resultsCount  = document.getElementById('blog-results-count');
  const emptyState    = document.getElementById('blog-empty-state');
  const paginationNav = document.getElementById('blog-pagination');

  const state = {
    query: '',
    activeTags: new Set(),
    page: parseInt(new URLSearchParams(window.location.search).get('page'), 10) || 1,
  };

  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderArticleCard(post) {
    const tagPills = post.tags.map((t) => `<span class="article-tag">${escapeHtml(t)}</span>`).join('');
    return `<a href="${post.url}" class="article-card reveal visible">
      <div class="article-meta">
        ${tagPills}
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

  function getFilteredPosts() {
    const query = state.query.trim().toLowerCase();
    return allPosts.filter((post) => {
      const matchesQuery =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some((t) => t.toLowerCase().includes(query));

      const matchesTags =
        state.activeTags.size === 0 || post.tags.some((t) => state.activeTags.has(t));

      return matchesQuery && matchesTags;
    });
  }

  function renderPagination(totalPosts) {
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

    if (totalPages <= 1) {
      paginationNav.hidden = true;
      paginationNav.innerHTML = '';
      return;
    }

    if (state.page > totalPages) state.page = totalPages;
    if (state.page < 1) state.page = 1;

    const buttons = [];
    buttons.push(
      `<button type="button" class="page-btn page-btn-prev" data-page="${state.page - 1}" ${state.page <= 1 ? 'disabled' : ''} aria-label="Previous page"><i class="fas fa-chevron-left"></i></button>`
    );
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        `<button type="button" class="page-btn" data-page="${i}" ${i === state.page ? 'aria-current="page"' : ''}>${i}</button>`
      );
    }
    buttons.push(
      `<button type="button" class="page-btn page-btn-next" data-page="${state.page + 1}" ${state.page >= totalPages ? 'disabled' : ''} aria-label="Next page"><i class="fas fa-chevron-right"></i></button>`
    );

    paginationNav.hidden = false;
    paginationNav.innerHTML = `<div class="pagination-list">${buttons.join('')}</div>`;

    paginationNav.querySelectorAll('.page-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page, 10);
        if (!page || page === state.page) return;
        state.page = page;
        syncUrl(true);
        render();
        resultsGrid.closest('section').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function syncUrl(pushHistory) {
    const params = new URLSearchParams(window.location.search);
    if (state.page > 1) {
      params.set('page', state.page);
    } else {
      params.delete('page');
    }
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
    if (pushHistory) {
      window.history.pushState({ page: state.page }, '', newUrl);
    } else {
      window.history.replaceState({ page: state.page }, '', newUrl);
    }
  }

  function render() {
    const filtered = getFilteredPosts();
    const start = (state.page - 1) * POSTS_PER_PAGE;
    const pagePosts = filtered.slice(start, start + POSTS_PER_PAGE);

    if (filtered.length === 0) {
      resultsGrid.innerHTML = '';
      emptyState.hidden = false;
    } else {
      emptyState.hidden = true;
      resultsGrid.innerHTML = pagePosts.map(renderArticleCard).join('');
    }

    resultsCount.textContent = `Showing ${pagePosts.length} of ${filtered.length} post${filtered.length === 1 ? '' : 's'}`;

    renderPagination(filtered.length);
  }

  const handleSearchInput = debounce((value) => {
    state.query = value;
    state.page = 1;
    syncUrl(false);
    render();
  }, 250);

  if (searchInput) {
    searchInput.addEventListener('input', (e) => handleSearchInput(e.target.value));
  }

  if (tagFilterList) {
    tagFilterList.querySelectorAll('.tag-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const tag = chip.dataset.tag;
        if (state.activeTags.has(tag)) {
          state.activeTags.delete(tag);
          chip.classList.remove('active');
          chip.setAttribute('aria-pressed', 'false');
        } else {
          state.activeTags.add(tag);
          chip.classList.add('active');
          chip.setAttribute('aria-pressed', 'true');
        }
        state.page = 1;
        syncUrl(false);
        render();
      });
    });
  }

  window.addEventListener('popstate', () => {
    state.page = parseInt(new URLSearchParams(window.location.search).get('page'), 10) || 1;
    render();
  });

  render();
})();
