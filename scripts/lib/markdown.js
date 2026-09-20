const MarkdownIt = require('markdown-it');
const anchor = require('markdown-it-anchor');
const hljs = require('highlight.js');

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(code, { language: lang }).value;
        return `<pre class="code-block"><code class="hljs language-${lang}">${highlighted}</code></pre>`;
      } catch (err) {
        // fall through to escaped output below
      }
    }
    return `<pre class="code-block"><code class="hljs">${md.utils.escapeHtml(code)}</code></pre>`;
  },
});

md.use(anchor, {
  slugify,
  level: [2, 3],
});

// Add loading="lazy" / decoding="async" to every rendered <img>
const defaultImageRule = md.renderer.rules.image || function (tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options);
};
md.renderer.rules.image = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  token.attrSet('loading', 'lazy');
  token.attrSet('decoding', 'async');
  return defaultImageRule(tokens, idx, options, env, self);
};

module.exports = { md, slugify };
