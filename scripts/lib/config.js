const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

module.exports = {
  ROOT,
  CONTENT_DIR: path.join(ROOT, 'content', 'blog'),
  OUTPUT_DIR: path.join(ROOT, 'blog'),
  PARTIALS_DIR: path.join(ROOT, 'templates', 'partials'),
  SITE_URL: 'https://temitope-o.netlify.app',
  POSTS_PER_PAGE: 6,
  WORDS_PER_MINUTE: 200,
  TOC_MIN_HEADINGS: 3,
  RELATED_COUNT: 3,
};
