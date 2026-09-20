const { RELATED_COUNT } = require('./config');

function getRelatedPosts(post, allPosts) {
  const others = allPosts.filter((p) => p.slug !== post.slug);
  const tagSet = new Set(post.tags);

  const scored = others
    .map((p) => ({
      post: p,
      overlap: p.tags.filter((t) => tagSet.has(t)).length,
    }))
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      return b.post.date.getTime() - a.post.date.getTime();
    });

  const related = scored.slice(0, RELATED_COUNT).map((s) => s.post);
  return related;
}

module.exports = { getRelatedPosts };
