export const SEO_KEYWORDS = [
  // Academy & Coaching
  { keyword: "learn chess online", intent: "coaching", category: "academy" },
  { keyword: "online chess coaching", intent: "coaching", category: "academy" },
  { keyword: "best chess academy in india", intent: "coaching", category: "academy" },
  { keyword: "chess classes for kids", intent: "coaching", category: "academy" },
  { keyword: "private chess tutor online", intent: "coaching", category: "academy" },

  // Openings
  { keyword: "best chess openings for beginners", intent: "education", category: "opening" },
  { keyword: "chess openings explained", intent: "education", category: "opening" },
  { keyword: "italian game chess opening", intent: "education", category: "opening" },
  { keyword: "sicilian defense for beginners", intent: "education", category: "opening" },
  { keyword: "queens gambit opening guide", intent: "education", category: "opening" },

  // Puzzles & Training
  { keyword: "daily chess puzzle with solution", intent: "puzzle", category: "training" },
  { keyword: "chess puzzles for beginners", intent: "puzzle", category: "training" },
  { keyword: "chess tactics training", intent: "puzzle", category: "training" },
  { keyword: "chess pattern recognition exercises", intent: "puzzle", category: "training" },

  // Improvement
  { keyword: "how to improve chess rating", intent: "improvement", category: "strategy" },
  { keyword: "how to improve chess rating fast", intent: "improvement", category: "strategy" },
  { keyword: "chess improvement plan", intent: "improvement", category: "strategy" },
  { keyword: "how to get better at chess", intent: "improvement", category: "strategy" },

  // Strategy
  { keyword: "chess strategy for intermediate players", intent: "education", category: "strategy" },
  { keyword: "positional chess tips", intent: "education", category: "strategy" },
  { keyword: "chess middlegame strategy", intent: "education", category: "strategy" },

  // Endgames
  { keyword: "chess endgames tutorial", intent: "education", category: "endgame" },
  { keyword: "how to win chess endgames", intent: "education", category: "endgame" },
  { keyword: "king and pawn endgame basics", intent: "education", category: "endgame" },
  { keyword: "rook endgame techniques", intent: "education", category: "endgame" },
];

export const BLOG_CATEGORIES = [
  { id: "opening-theory", label: "Opening Theory", icon: "♟️" },
  { id: "chess-strategy", label: "Chess Strategy", icon: "♜" },
  { id: "endgame-training", label: "Endgame Training", icon: "♚" },
  { id: "chess-puzzles", label: "Chess Puzzles", icon: "🧩" },
  { id: "chess-improvement", label: "Chess Improvement", icon: "📈" },
  { id: "academy-updates", label: "Academy Updates", icon: "📢" },
];

export function getKeywordsByCategory(category) {
  return SEO_KEYWORDS.filter(k => k.category === category);
}

export function getKeywordsByIntent(intent) {
  return SEO_KEYWORDS.filter(k => k.intent === intent);
}

export function calculateReadingTime(content) {
  if (!content) return 1;
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function calculateSEOScore(post) {
  let score = 0;
  const issues = [];

  // Title length (10 pts)
  if (post.meta_title || post.title) {
    const titleLen = (post.meta_title || post.title).length;
    if (titleLen >= 30 && titleLen <= 60) score += 10;
    else if (titleLen > 0) { score += 5; issues.push('Title should be 30-60 characters'); }
  } else { issues.push('Missing title'); }

  // Meta description (15 pts)
  if (post.meta_description) {
    const descLen = post.meta_description.length;
    if (descLen >= 120 && descLen <= 160) score += 15;
    else if (descLen > 0) { score += 8; issues.push('Meta description should be 120-160 characters'); }
  } else { issues.push('Missing meta description'); }

  // Keyword in title (15 pts)
  if (post.keywords && (post.meta_title || post.title)) {
    const title = (post.meta_title || post.title).toLowerCase();
    const kws = typeof post.keywords === 'string' ? post.keywords.split(',') : (post.keywords || []);
    if (kws.some(kw => title.includes(kw.trim().toLowerCase()))) score += 15;
    else issues.push('Primary keyword missing from title');
  } else if (!post.keywords) { issues.push('No keywords set'); }

  // Featured image (10 pts)
  if (post.featured_image) score += 10;
  else issues.push('No featured image');

  // Content length (15 pts)
  if (post.content) {
    const wordCount = post.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
    if (wordCount >= 800) score += 15;
    else if (wordCount >= 300) { score += 8; issues.push('Content should be 800+ words for SEO'); }
    else issues.push('Content too short (aim for 800+ words)');
  } else { issues.push('No content'); }

  // Slug quality (5 pts)
  if (post.slug && post.slug.length > 3 && !post.slug.includes('_')) score += 5;
  else issues.push('Improve slug (use hyphens, be descriptive)');

  // Category set (10 pts)
  if (post.category) score += 10;
  else issues.push('No category selected');

  // Has headings in content (10 pts)
  if (post.content && (post.content.includes('<h2') || post.content.includes('<h3'))) score += 10;
  else issues.push('Add H2/H3 headings in content');

  // Published (10 pts)
  if (post.published) score += 10;

  return { score, issues };
}
