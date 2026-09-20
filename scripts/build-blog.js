/**
 * Generates the /blog static pages from the markdown source of truth in content/blog/.
 *
 * content/blog/  = source content (tracked in git)
 * blog/          = generated output (gitignored, recreated on every run)
 */
const fs = require('fs');
const path = require('path');
const { OUTPUT_DIR } = require('./lib/config');
const { loadPosts, getAllTags } = require('./lib/posts');
const { renderListingPage, renderDetailPage } = require('./lib/render');

function main() {
  console.log('Building blog...');

  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const posts = loadPosts();
  const allTags = getAllTags(posts);

  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), renderListingPage(posts, allTags));

  for (const post of posts) {
    const postDir = path.join(OUTPUT_DIR, post.slug);
    fs.mkdirSync(postDir, { recursive: true });
    fs.writeFileSync(path.join(postDir, 'index.html'), renderDetailPage(post, posts));
  }

  console.log(`Built ${posts.length} post(s):`);
  posts.forEach((p) => console.log(`  - ${p.url}  (${p.title})`));
  console.log(`Output: ${OUTPUT_DIR}`);
}

try {
  main();
} catch (err) {
  console.error('Blog build failed:');
  console.error(err.message);
  process.exit(1);
}
