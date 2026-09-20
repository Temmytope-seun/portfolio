const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { md } = require('./markdown');
const { extractToc } = require('./toc');
const { CONTENT_DIR, WORDS_PER_MINUTE, TOC_MIN_HEADINGS, SITE_URL } = require('./config');

const SLUG_RE = /^[a-z0-9-]+$/;

function validateFrontmatter(data, filename) {
  const errors = [];
  for (const field of ['title', 'slug', 'date', 'excerpt']) {
    if (!data[field] || String(data[field]).trim() === '') {
      errors.push(`missing required field "${field}"`);
    }
  }
  if (!Array.isArray(data.tags)) {
    errors.push('"tags" must be an array');
  }
  if (data.slug && !SLUG_RE.test(data.slug)) {
    errors.push(`"slug" must match ${SLUG_RE} (got "${data.slug}")`);
  }
  if (data.date && isNaN(Date.parse(data.date))) {
    errors.push(`"date" is not a valid date (got "${data.date}")`);
  }
  if (data.readTime !== undefined && (!Number.isInteger(data.readTime) || data.readTime <= 0)) {
    errors.push(`"readTime" must be a positive integer (got "${data.readTime}")`);
  }
  if (errors.length) {
    throw new Error(`Invalid frontmatter in ${filename}:\n  - ${errors.join('\n  - ')}`);
  }
}

function computeReadTime(bodyHtml) {
  const text = bodyHtml.replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

function formatDateDisplay(date) {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function loadPosts() {
  if (!fs.existsSync(CONTENT_DIR)) {
    throw new Error(`Content directory not found: ${CONTENT_DIR}`);
  }

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'));
  const posts = [];
  const seenSlugs = new Set();

  for (const filename of files) {
    const fullPath = path.join(CONTENT_DIR, filename);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(raw);

    validateFrontmatter(data, filename);

    if (data.draft) continue;

    if (seenSlugs.has(data.slug)) {
      throw new Error(`Duplicate slug "${data.slug}" found in ${filename}`);
    }
    seenSlugs.add(data.slug);

    const bodyHtml = md.render(content);
    const toc = extractToc(bodyHtml);
    const date = new Date(data.date);

    posts.push({
      title: data.title,
      slug: data.slug,
      url: `/blog/${data.slug}/`,
      date,
      dateIso: date.toISOString(),
      dateDisplay: formatDateDisplay(date),
      tags: data.tags,
      readTime: data.readTime || computeReadTime(bodyHtml),
      excerpt: data.excerpt,
      coverImage: data.coverImage || null,
      coverImageAbsolute: data.coverImage ? `${SITE_URL}${data.coverImage}` : `${SITE_URL}/profile.jpg`,
      mediumUrl: data.mediumUrl || null,
      bodyHtml,
      toc: toc.length >= TOC_MIN_HEADINGS ? toc : [],
    });
  }

  posts.sort((a, b) => b.date.getTime() - a.date.getTime());

  return posts;
}

function getAllTags(posts) {
  const tagSet = new Set();
  posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
}

function toMetadata(post) {
  return {
    title: post.title,
    slug: post.slug,
    url: post.url,
    excerpt: post.excerpt,
    tags: post.tags,
    readTime: post.readTime,
    dateIso: post.dateIso,
    dateDisplay: post.dateDisplay,
    coverImage: post.coverImage,
  };
}

module.exports = { loadPosts, getAllTags, toMetadata };
