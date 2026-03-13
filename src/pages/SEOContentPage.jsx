import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSEOContentBySlug, getSEOContentByCategory } from '../api/seoContentApi';

function setMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
  if (tag) tag.setAttribute('content', content);
  else {
    tag = document.createElement('meta');
    if (name.startsWith('og:') || name.startsWith('article:')) tag.setAttribute('property', name);
    else tag.name = name;
    tag.content = content;
    document.head.appendChild(tag);
  }
}

export default function SEOContentPage() {
  const { slug } = useParams();
  const [content, setContent] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSEOContentBySlug(slug).then(data => {
      setContent(data);
      setLoading(false);
      if (data) {
        document.title = data.meta_title || `${data.title} | ChessHub Academy`;
        setMeta('description', data.meta_description || '');
        setMeta('keywords', data.target_keyword || '');
        setMeta('og:title', data.meta_title || data.title);
        setMeta('og:description', data.meta_description || '');
        setMeta('og:type', 'article');
        if (data.featured_image) setMeta('og:image', data.featured_image);
        getSEOContentByCategory(data.category).then(all => {
          setRelated(all.filter(r => r.slug !== slug).slice(0, 3));
        });
      }
    });
    return () => { document.title = 'ChessHub Academy'; };
  }, [slug]);

  if (loading) return (
    <div className="seo-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a1a', color: '#fff' }}>
      <p>Loading...</p>
    </div>
  );

  if (!content) return (
    <div className="seo-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: '#0a0a1a', color: '#fff' }}>
      <h2>Content not found</h2>
      <Link to="/blog" style={{ color: '#8b5cf6', marginTop: '1rem' }}>← Back to Blog</Link>
    </div>
  );

  return (
    <div className="seo-page">
      <nav className="page-nav">
        <div className="page-nav-inner">
          <Link to="/" className="back-link">← Home</Link>
          <span className="category-badge">{content.category}</span>
        </div>
      </nav>

      <article className="seo-article" itemScope itemType="https://schema.org/Article">
        <header className="article-header">
          <h1 itemProp="headline">{content.title}</h1>
          <div className="article-meta">
            {content.difficulty_level && <span className="difficulty-badge">{content.difficulty_level}</span>}
            {content.target_keyword && <span className="keyword-tag">{content.target_keyword}</span>}
          </div>
        </header>

        <div className="article-body" itemProp="articleBody" dangerouslySetInnerHTML={{ __html: content.content }} />

        {related.length > 0 && (
          <div className="related-section">
            <h2>Related Lessons</h2>
            <div className="related-grid">
              {related.map(r => (
                <Link to={`/learn/${r.slug}`} key={r.id} className="related-card">
                  <h3>{r.title}</h3>
                  <p>{r.meta_description || ''}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="seo-cta">
          <h2>Take your chess to the next level</h2>
          <p>Join ChessHub Academy and learn from professional coaches with personalized training plans.</p>
          <a href="/#booking" className="cta-btn">Book Your Free Demo</a>
        </div>
      </article>

      <style>{`
        .seo-page { min-height: 100vh; background: #0a0a1a; color: #fff; padding-bottom: 3rem; }
        .page-nav { background: rgba(20,20,40,0.95); border-bottom: 1px solid #333; padding: 1rem 2rem; position: sticky; top: 0; z-index: 100; }
        .page-nav-inner { max-width: 800px; margin: 0 auto; display: flex; align-items: center; gap: 1rem; }
        .back-link { color: #8b5cf6; text-decoration: none; font-weight: 600; }
        .category-badge { font-size: 0.75rem; padding: 3px 10px; border-radius: 10px; background: rgba(139,92,246,0.15); color: #a78bfa; text-transform: capitalize; }
        .seo-article { max-width: 800px; margin: 0 auto; padding: 2rem; }
        .article-header { margin-bottom: 2rem; }
        .article-header h1 { font-size: 2rem; margin-bottom: 0.75rem; line-height: 1.3; }
        .article-meta { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .difficulty-badge { font-size: 0.75rem; padding: 3px 10px; border-radius: 10px; background: rgba(16,185,129,0.15); color: #6ee7b7; text-transform: capitalize; }
        .keyword-tag { font-size: 0.75rem; padding: 3px 10px; border-radius: 10px; background: rgba(59,130,246,0.15); color: #93c5fd; }
        .article-body { line-height: 1.8; color: #ddd; font-size: 1.05rem; }
        .article-body h2 { margin: 2rem 0 1rem; font-size: 1.4rem; color: #fff; }
        .article-body h3 { margin: 1.5rem 0 0.75rem; font-size: 1.15rem; color: #fff; }
        .article-body p { margin-bottom: 1rem; }
        .article-body ul, .article-body ol { margin: 1rem 0; padding-left: 1.5rem; }
        .article-body li { margin-bottom: 0.5rem; }
        .article-body img { max-width: 100%; border-radius: 8px; margin: 1rem 0; }
        .related-section { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #333; }
        .related-section h2 { margin-bottom: 1rem; }
        .related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
        .related-card { padding: 1rem; border-radius: 10px; background: rgba(30,30,60,0.6); border: 1px solid #333; text-decoration: none; color: #fff; transition: border-color 0.2s; }
        .related-card:hover { border-color: #8b5cf6; }
        .related-card h3 { font-size: 0.95rem; margin: 0 0 6px; }
        .related-card p { font-size: 0.8rem; color: #aaa; margin: 0; line-height: 1.4; }
        .seo-cta { max-width: 600px; margin: 3rem auto 0; text-align: center; padding: 2rem; background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1)); border: 1px solid rgba(139,92,246,0.25); border-radius: 16px; }
        .seo-cta h2 { margin: 0 0 8px; font-size: 1.3rem; }
        .seo-cta p { color: #bbb; margin: 0 0 1.2rem; }
        .cta-btn { display: inline-block; padding: 12px 28px; border-radius: 8px; background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: #fff; text-decoration: none; font-weight: 600; }
      `}</style>
    </div>
  );
}
