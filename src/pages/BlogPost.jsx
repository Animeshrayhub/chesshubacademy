import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogBySlug, getRelatedPosts } from '../api/blogApi';
import { useBlogPostingSchema } from '../components/SEOSchemas';
import { BLOG_CATEGORIES } from '../utils/seoKeywords';

function BlogCTATop() {
  return (
    <div className="blog-cta blog-cta-top">
      <span className="cta-icon">♟️</span>
      <div>
        <strong>Learn chess with professional coaches</strong>
        <p>Personalized training plans for every level. Join ChessHub Academy today.</p>
      </div>
      <a href="/#booking" className="cta-btn">Book Demo</a>
    </div>
  );
}

function BlogCTABottom() {
  return (
    <div className="blog-cta blog-cta-bottom">
      <h3>Ready to improve your chess?</h3>
      <p>Book your free demo class with our expert coaches and start your journey.</p>
      <a href="/#booking" className="cta-btn cta-btn-lg">Book Your Free Demo</a>
    </div>
  );
}

function RelatedArticles({ posts }) {
  if (!posts || posts.length === 0) return null;
  return (
    <div className="related-articles">
      <h3>Related Articles</h3>
      <div className="related-grid">
        {posts.map(post => (
          <Link to={`/blog/${post.slug}`} key={post.id} className="related-card">
            {post.featured_image && <img src={post.featured_image} alt={post.title} className="related-img" />}
            <div className="related-body">
              <h4>{post.title}</h4>
              <span className="related-meta">
                {post.reading_time || 3} min read
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function InternalLinks() {
  return (
    <div className="internal-links">
      <h4>Explore ChessHub</h4>
      <div className="internal-links-grid">
        <Link to="/#courses" className="internal-link">📚 Our Courses</Link>
        <Link to="/#booking" className="internal-link">📅 Book a Demo</Link>
        <Link to="/blog" className="internal-link">📝 All Articles</Link>
        <Link to="/tournaments" className="internal-link">🏆 Tournaments</Link>
      </div>
    </div>
  );
}

function setMetaTag(attr, key, content) {
  let tag = document.querySelector(`meta[${attr}="${key}"]`);
  if (tag) { tag.setAttribute('content', content); }
  else {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    tag.setAttribute('content', content);
    document.head.appendChild(tag);
  }
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useBlogPostingSchema(post);

  useEffect(() => {
    setLoading(true);
    getBlogBySlug(slug).then((data) => {
      setPost(data);
      setLoading(false);
      if (data?.category) {
        getRelatedPosts(data.category, slug).then(setRelated);
      }
    });
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    const title = post.meta_title || post.title;
    const desc = post.meta_description || '';
    const image = post.featured_image || '';
    const url = `${window.location.origin}/blog/${post.slug}`;

    document.title = `${title} | ChessHub Academy`;

    // Standard meta
    setMetaTag('name', 'description', desc);
    setMetaTag('name', 'keywords', post.keywords || '');
    setMetaTag('name', 'author', post.author || 'ChessHub Academy');

    // OpenGraph
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', desc);
    setMetaTag('property', 'og:type', 'article');
    setMetaTag('property', 'og:url', url);
    if (image) setMetaTag('property', 'og:image', image);

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', desc);
    if (image) setMetaTag('name', 'twitter:image', image);

    return () => { document.title = 'ChessHub Academy'; };
  }, [post]);

  const categoryLabel = post?.category
    ? BLOG_CATEGORIES.find(c => c.id === post.category)?.label
    : null;

  if (loading) return <div className="blog-post-page"><div className="page-loading">Loading...</div></div>;
  if (!post) return (
    <div className="blog-post-page">
      <nav className="page-nav">
        <div className="page-nav-inner">
          <Link to="/blog" className="back-link">← Back to Blog</Link>
        </div>
      </nav>
      <div className="page-empty">Post not found.</div>
    </div>
  );

  return (
    <div className="blog-post-page">
      <nav className="page-nav">
        <div className="page-nav-inner">
          <Link to="/blog" className="back-link">← Back to Blog</Link>
          {categoryLabel && <span className="nav-category">{categoryLabel}</span>}
        </div>
      </nav>

      <article className="blog-article" itemScope itemType="https://schema.org/BlogPosting">
        {post.featured_image && (
          <img src={post.featured_image} alt={post.title} className="blog-hero-image" itemProp="image" />
        )}
        <h1 itemProp="headline">{post.title}</h1>
        <div className="blog-meta">
          <time className="blog-date" itemProp="datePublished" dateTime={post.created_at}>
            {new Date(post.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
          {post.reading_time && <span className="reading-time">· {post.reading_time} min read</span>}
          {categoryLabel && <span className="blog-category-tag">{categoryLabel}</span>}
          <span itemProp="author" style={{ display: 'none' }}>{post.author || 'ChessHub Academy'}</span>
        </div>

        <BlogCTATop />

        <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }} itemProp="articleBody" />

        <BlogCTABottom />

        <InternalLinks />
      </article>

      <RelatedArticles posts={related} />

      <style>{`
        .blog-post-page { min-height: 100vh; background: var(--bg-primary, #0a0a1a); color: #fff; padding-bottom: 3rem; }
        .page-nav { background: rgba(20,20,40,0.95); border-bottom: 1px solid #333; padding: 1rem 2rem; position: sticky; top: 0; z-index: 100; }
        .page-nav-inner { max-width: 800px; margin: 0 auto; display: flex; align-items: center; gap: 1rem; }
        .back-link { color: var(--primary, #8b5cf6); text-decoration: none; font-weight: 600; }
        .nav-category { font-size: 0.8rem; padding: 3px 10px; border-radius: 10px; background: rgba(139,92,246,0.2); color: #c4b5fd; }
        .page-loading, .page-empty { text-align: center; padding: 4rem 2rem; color: #aaa; font-size: 1.2rem; }
        .blog-article { max-width: 800px; margin: 2rem auto; padding: 0 2rem; }
        .blog-hero-image { width: 100%; max-height: 400px; object-fit: cover; border-radius: 12px; margin-bottom: 1.5rem; }
        .blog-article h1 { font-size: 2rem; margin: 0 0 0.75rem; line-height: 1.3; }
        .blog-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .blog-date { color: #888; font-size: 0.9rem; }
        .reading-time { color: #888; font-size: 0.9rem; }
        .blog-category-tag { font-size: 0.75rem; padding: 2px 10px; border-radius: 10px; background: rgba(59,130,246,0.2); color: #93c5fd; }
        .blog-content { margin-top: 1rem; line-height: 1.8; color: #ddd; }
        .blog-content h2, .blog-content h3 { color: #fff; margin-top: 2rem; }
        .blog-content p { margin: 1rem 0; }
        .blog-content img { max-width: 100%; border-radius: 8px; }
        .blog-content a { color: var(--primary, #8b5cf6); }

        /* CTA Blocks */
        .blog-cta { border-radius: 12px; padding: 1.25rem 1.5rem; margin: 1.5rem 0; }
        .blog-cta-top { background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.25); display: flex; align-items: center; gap: 1rem; }
        .blog-cta-top .cta-icon { font-size: 2rem; }
        .blog-cta-top strong { display: block; font-size: 1rem; }
        .blog-cta-top p { margin: 4px 0 0; font-size: 0.85rem; color: #aaa; }
        .blog-cta-bottom { background: linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.15)); border: 1px solid rgba(139,92,246,0.3); text-align: center; }
        .blog-cta-bottom h3 { margin: 0 0 8px; }
        .blog-cta-bottom p { color: #bbb; margin: 0 0 1rem; font-size: 0.95rem; }
        .cta-btn { display: inline-block; padding: 8px 20px; border-radius: 8px; background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: #fff; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
        .cta-btn-lg { padding: 12px 32px; font-size: 1rem; }

        /* Internal Links */
        .internal-links { margin: 2rem 0; padding: 1.25rem; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); }
        .internal-links h4 { margin: 0 0 12px; font-size: 1rem; color: #ccc; }
        .internal-links-grid { display: flex; gap: 12px; flex-wrap: wrap; }
        .internal-link { padding: 6px 14px; border-radius: 8px; background: rgba(139,92,246,0.1); color: #c4b5fd; text-decoration: none; font-size: 0.85rem; font-weight: 500; border: 1px solid rgba(139,92,246,0.15); }
        .internal-link:hover { background: rgba(139,92,246,0.2); }

        /* Related Articles */
        .related-articles { max-width: 800px; margin: 0 auto 3rem; padding: 0 2rem; }
        .related-articles h3 { margin-bottom: 1rem; }
        .related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
        .related-card { border-radius: 10px; overflow: hidden; background: rgba(30,30,60,0.6); border: 1px solid #333; text-decoration: none; color: #fff; transition: transform 0.2s; }
        .related-card:hover { transform: translateY(-3px); border-color: #8b5cf6; }
        .related-img { width: 100%; height: 120px; object-fit: cover; }
        .related-body { padding: 0.8rem; }
        .related-body h4 { margin: 0 0 6px; font-size: 0.9rem; line-height: 1.35; }
        .related-meta { font-size: 0.75rem; color: #888; }
      `}</style>
    </div>
  );
}
