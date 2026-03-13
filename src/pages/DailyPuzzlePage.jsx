import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { getSEOContentByCategory } from '../api/seoContentApi';

const DailyPuzzle = lazy(() => import('../components/Puzzles/DailyPuzzle'));

function setMeta(name, content) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (tag) tag.setAttribute('content', content);
  else {
    tag = document.createElement('meta');
    tag.name = name;
    tag.content = content;
    document.head.appendChild(tag);
  }
}

export default function DailyPuzzlePage() {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    document.title = 'Daily Chess Puzzles with Solutions | ChessHub Academy';
    setMeta('description', 'Solve daily chess puzzles with solutions and explanations. Improve your tactical skills with free chess puzzles from ChessHub Academy.');
    setMeta('keywords', 'daily chess puzzle, chess puzzles for beginners, chess tactics training, chess puzzle with solution');
    return () => { document.title = 'ChessHub Academy'; };
  }, []);

  useEffect(() => {
    getSEOContentByCategory('puzzle').then(setLessons);
  }, []);

  return (
    <div className="seo-page">
      <nav className="page-nav">
        <div className="page-nav-inner">
          <Link to="/" className="back-link">← Home</Link>
          <h2>🧩 Daily Chess Puzzles</h2>
        </div>
      </nav>

      <div className="seo-hero">
        <h1>Daily Chess Puzzle with Solution</h1>
        <p>Sharpen your tactics every day with hand-picked chess puzzles. Each puzzle includes a full solution and explanation.</p>
      </div>

      <div className="seo-content-area">
        <Suspense fallback={<div className="loading">Loading puzzle...</div>}>
          <DailyPuzzle />
        </Suspense>
      </div>

      {lessons.length > 0 && (
        <div className="seo-lessons">
          <h2>Puzzle Lessons & Guides</h2>
          <div className="lesson-grid">
            {lessons.map(l => (
              <Link to={`/learn/${l.slug}`} key={l.id} className="lesson-card">
                <h3>{l.title}</h3>
                <span className="lesson-level">{l.difficulty_level}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="seo-cta">
        <h2>Join ChessHub Academy to improve faster</h2>
        <p>Get personalized puzzle training and expert coaching from our team.</p>
        <a href="/#booking" className="cta-btn">Book Your Free Demo</a>
      </div>

      <SEOPageStyles />
    </div>
  );
}

function SEOPageStyles() {
  return (
    <style>{`
      .seo-page { min-height: 100vh; background: #0a0a1a; color: #fff; padding-bottom: 3rem; }
      .page-nav { background: rgba(20,20,40,0.95); border-bottom: 1px solid #333; padding: 1rem 2rem; position: sticky; top: 0; z-index: 100; }
      .page-nav-inner { max-width: 1000px; margin: 0 auto; display: flex; align-items: center; gap: 1rem; }
      .back-link { color: #8b5cf6; text-decoration: none; font-weight: 600; }
      .seo-hero { max-width: 800px; margin: 2.5rem auto 1.5rem; padding: 0 2rem; text-align: center; }
      .seo-hero h1 { font-size: 2rem; margin-bottom: 0.75rem; line-height: 1.3; }
      .seo-hero p { color: #aaa; font-size: 1.05rem; line-height: 1.6; }
      .seo-content-area { max-width: 800px; margin: 0 auto; padding: 0 2rem; }
      .seo-lessons { max-width: 800px; margin: 3rem auto; padding: 0 2rem; }
      .seo-lessons h2 { margin-bottom: 1rem; }
      .lesson-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem; }
      .lesson-card { padding: 1.2rem; border-radius: 10px; background: rgba(30,30,60,0.6); border: 1px solid #333; text-decoration: none; color: #fff; transition: border-color 0.2s; }
      .lesson-card:hover { border-color: #8b5cf6; }
      .lesson-card h3 { margin: 0 0 8px; font-size: 1rem; }
      .lesson-level { font-size: 0.75rem; padding: 2px 10px; border-radius: 10px; background: rgba(16,185,129,0.15); color: #6ee7b7; text-transform: capitalize; }
      .seo-cta { max-width: 600px; margin: 3rem auto; text-align: center; padding: 2rem; background: linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1)); border: 1px solid rgba(139,92,246,0.25); border-radius: 16px; }
      .seo-cta h2 { margin: 0 0 8px; font-size: 1.3rem; }
      .seo-cta p { color: #bbb; margin: 0 0 1.2rem; }
      .cta-btn { display: inline-block; padding: 12px 28px; border-radius: 8px; background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: #fff; text-decoration: none; font-weight: 600; }
      .loading { text-align: center; padding: 3rem; color: #aaa; }
    `}</style>
  );
}
