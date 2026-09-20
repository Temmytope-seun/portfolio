const HEADING_RE = /<h([23]) id="([^"]+)">(.*?)<\/h[23]>/g;

function stripTags(html) {
  return html.replace(/<[^>]+>/g, '');
}

function extractToc(bodyHtml) {
  const toc = [];
  let match;
  HEADING_RE.lastIndex = 0;
  while ((match = HEADING_RE.exec(bodyHtml)) !== null) {
    toc.push({
      level: Number(match[1]),
      id: match[2],
      text: stripTags(match[3]),
    });
  }
  return toc;
}

module.exports = { extractToc };
