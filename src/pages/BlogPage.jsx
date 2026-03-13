import { useState, useEffect } from 'react';
import { getBlogPosts } from '../api/blogApi';
import { Link } from 'react-router-dom';
import { BLOG_CATEGORIES } from '../utils/seoKeywords';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    getBlogPosts().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    document.title = 'Chess Blog — Tips, Strategy & Tutorials | ChessHub Academy';
    const setMeta = (name, content) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (tag) tag.setAttribute('content', content);
      else {
        tag = document.createElement('meta');
        tag.name = name;
        tag.content = content;
        document.head.appendChild(tag);
      }
    };
    setMeta('description', 'Read expert chess articles on openings, strategy, endgames, puzzles and improvement tips from ChessHub Academy coaches.');
    setMeta('keywords', 'chess blog, chess tips, chess strategy, chess openings, chess puzzles, learn chess online');
    return () => { document.title = 'ChessHub Academy'; };
  }, []);

  const featured = posts.filter(p => p.featured);
  const filtered = activeCategory === 'all'
    ? posts
    : posts.filter(p => p.category === activeCategory);

  return (
    <div className="blog-page">
      <nav className="page-nav">
        <div className="page-nav-inner">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h2>📝 ChessHub Blog</h2>
        </div>
      </nav>

      {/* Category Filter */}
      <div className="category-bar">
        <button
          className={`cat-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >All</button>
        {BLOG_CATEGORIES.map(c => (
          <button key={c.id}
            className={`cat-btn ${activeCategory === c.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(c.id)}
          >{c.icon} {c.label}</button>
        ))}
      </div>

      {/* Featured Posts */}
      {activeCategory === 'all' && featured.length > 0 && (
        <div className="featured-section">
          <h3 className="section-label">⭐ Featured</h3>
          <div className="featured-grid">
            {featured.slice(0, 3).map(post => (
              <Link to={`/blog/${post.slug}`} key={post.id} className="featured-card glass-card">
                {post.featured_image && (
                  <img src={post.featured_image} alt={post.title} className="featured-img" />
                )}
                <div className="featured-body">
                  {post.category && (
                    <span className="post-category">{BLOG_CATEGORIES.find(c => c.id === post.category)?.label}</span>
                  )}
                  <h3>{post.title}</h3>
                  <p>{post.meta_description || post.content?.replace(/<[^>]*>/g, '').substring(0, 120) + '...'}</p>
                  <span className="blog-date">
                    {new Date(post.created_at).toLocaleDateString()} {post.reading_time ? `· ${post.reading_time} min read` : ''}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="page-loading">Loading posts...</div>
      ) : filtered.length === 0 ? (
        <div className="page-empty">No blog posts in this category yet.</div>
      ) : (
        <div className="blog-grid">
          {filtered.map((post) => (
            <Link to={`/blog/${post.slug}`} key={post.id} className="blog-card glass-card">
              {post.featured_image && (
                <img src={post.featured_image} alt={post.title} className="blog-image" />
              )}
              <div className="blog-card-body">
                {post.category && (
                  <span className="post-category">{BLOG_CATEGORIES.find(c => c.id === post.category)?.label}</span>
                )}
                <h3>{post.title}</h3>
                <p className="blog-excerpt">
                  {post.meta_description || post.content?.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                </p>
                <div className="blog-card-footer">
                  <span className="blog-date">{new Date(post.created_at).toLocaleDateString()}</span>
                  {post.reading_time && <span className="reading-time">{post.reading_time} min read</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Blog page CTA */}
      <div className="blog-page-cta">
        <h3>Want to improve faster?</h3>
        <p>Join ChessHub Academy for personalized coaching from expert instructors.</p>
        <a href="/#booking" className="cta-btn">Book Your Free Demo</a>
      </div>

      <style>{`
        .blog-page { min-height: 100vh; background: var(--bg-primary, #0a0a1a); color: #fff; padding-bottom: 3rem; }
        .page-nav { background: rgba(20,20,40,0.95); border-bottom: 1px solid #333; padding: 1rem 2rem; position: sticky; top: 0; z-index: 100; }
        .page-nav-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; gap: 2rem; }
        .back-link { color: var(--primary, #8b5cf6); text-decoration: none; font-weight: 600; }
        .page-loading, .page-empty { text-align: center; padding: 4rem 2rem; color: #aaa; font-size: 1.2rem; }

        .category-bar { display: flex; gap: 8px; max-width: 1200px; margin: 1.5rem auto 0; padding: 0 2rem; flex-wrap: wrap; }
        .cat-btn { padding: 6px 16px; border-radius: 20px; border: 1px solid #444; background: transparent; color: #aaa; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; }
        .cat-btn.active { background: rgba(139,92,246,0.2); border-color: #8b5cf6; color: #fff; }

        .featured-section { max-width: 1200px; margin: 1.5rem auto 0; padding: 0 2rem; }
        .section-label { font-size: 0.9rem; color: #aaa; margin-bottom: 0.75rem; }
        .featured-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .featured-card { border-radius: 12px; overflow: hidden; background: rgba(30,30,60,0.6); border: 1px solid rgba(139,92,246,0.3); text-decoration: none; color: #fff; transition: transform 0.2s; }
        .featured-card:hover { transform: translateY(-4px); }
        .featured-img { width: 100%; height: 200px; object-fit: cover; }
        .featured-body { padding: 1.2rem; }
        .featured-body h3 { margin: 0.5rem 0; font-size: 1.15rem; }
        .featured-body p { color: #aaa; font-size: 0.9rem; line-height: 1.5; margin: 0; }

        .blog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem; max-width: 1200px; margin: 2rem auto; padding: 0 2rem; }
        .blog-card { border-radius: 12px; overflow: hidden; background: rgba(30,30,60,0.6); border: 1px solid #333; text-decoration: none; color: #fff; transition: transform 0.2s, border-color 0.2s; }
        .blog-card:hover { transform: translateY(-4px); border-color: var(--primary, #8b5cf6); }
        .blog-image { width: 100%; height: 180px; object-fit: cover; }
        .blog-card-body { padding: 1.2rem; }
        .blog-card-body h3 { margin: 0.4rem 0 0.5rem; font-size: 1.1rem; }
        .blog-excerpt { color: #aaa; font-size: 0.9rem; line-height: 1.5; }
        .blog-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
        .blog-date { font-size: 0.8rem; color: #666; }
        .reading-time { font-size: 0.8rem; color: #888; }
        .post-category { font-size: 0.7rem; padding: 2px 8px; border-radius: 8px; background: rgba(59,130,246,0.15); color: #93c5fd; }

        .blog-page-cta { max-width: 700px; margin: 3rem auto; text-align: center; padding: 2rem; background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1)); border: 1px solid rgba(139,92,246,0.25); border-radius: 16px; }
        .blog-page-cta h3 { margin: 0 0 8px; font-size: 1.3rem; }
        .blog-page-cta p { color: #bbb; margin: 0 0 1.2rem; }
        .cta-btn { display: inline-block; padding: 12px 28px; border-radius: 8px; background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: #fff; text-decoration: none; font-weight: 600; }
      `}</style>
    </div>
  );
}
