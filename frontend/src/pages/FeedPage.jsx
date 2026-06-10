import React, { useEffect, useState } from 'react';
import { feedApi } from '../api/client';
import { Link, useSearchParams } from 'react-router-dom';

const CATEGORIES = [
  'All Topics', 'World', 'Politics', 'Technology', 'Health', 
  'Science', 'Business', 'Sports', 'Entertainment', 'Culture'
];

export default function FeedPage() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All Topics');
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTopic = searchParams.get('topic');

  useEffect(() => {
    feedApi.getFeed().then(res => {
      const data = res.data.data || [];
      setArticles(data);
      
      // If we came from a trending topic, filter immediately
      if (initialTopic) {
        const filtered = data.filter(a => 
          a.title.toLowerCase().includes(initialTopic.toLowerCase()) ||
          a.summary.toLowerCase().includes(initialTopic.toLowerCase()) ||
          a.keywords.some(k => k.toLowerCase().includes(initialTopic.toLowerCase()))
        );
        setFilteredArticles(filtered);
        setActiveCategory(`Topic: ${initialTopic}`);
      } else {
        setFilteredArticles(data);
      }
      
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [initialTopic]);

  useEffect(() => {
    if (activeCategory === 'All Topics') {
      setFilteredArticles(articles);
    } else if (activeCategory.startsWith('Topic: ')) {
      // Handled by the initial check, but if user clicks away and back? 
      // Keep it as is for now.
    } else {
      // Simple keyword-based categorization for demonstration
      const filtered = articles.filter(a => 
        a.keywords.some(k => k.toLowerCase().includes(activeCategory.toLowerCase())) ||
        a.title.toLowerCase().includes(activeCategory.toLowerCase()) ||
        a.summary.toLowerCase().includes(activeCategory.toLowerCase())
      );
      setFilteredArticles(filtered);
    }
  }, [activeCategory, articles]);

  const featured = filteredArticles[0];
  const regular = filteredArticles.slice(1);

  if (loading) return (
    <div className="screen active" style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <div className="heading" style={{ fontSize: '24px', fontStyle: 'italic' }}>Gathering dispatches...</div>
    </div>
  );

  return (
    <div id="screen-feed" className="screen active fade-in-up" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Newspaper Header */}
      <header style={{
        textAlign: 'center',
        marginBottom: '2rem',
        borderBottom: '4px double var(--rule)',
        paddingBottom: '2rem',
        background: 'var(--paper)',
        position: 'relative'
      }}>
        <div style={{ fontSize: '12px', letterSpacing: '6px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '12px', fontWeight: '700' }}>
          {initialTopic ? `◈ TOPICAL INTELLIGENCE DOSSIER ◈` : `◈ LATEST INTELLIGENCE DISPATCH ◈`}
        </div>
        <h1 className="heading" style={{ fontSize: '64px', fontWeight: '900', color: 'var(--ink)', lineHeight: 1 }}>
          {initialTopic ? initialTopic : 'Your Morning Brief'}
        </h1>
        <p className="body-text" style={{ fontStyle: 'italic', fontSize: '20px', color: 'var(--muted)', marginTop: '0.5rem' }}>
          {initialTopic 
            ? `Comprehensive synthesis of wire reports regarding "${initialTopic}"`
            : "A daily curiosity-driven chronicle of the world's movements."}
        </p>
        {initialTopic && (
          <div style={{ marginTop: '2rem' }}>
             <Link to="/trending" className="btn-vintage" style={{ fontSize: '10px', textDecoration: 'none' }}>
               ← Return to Global Trends
             </Link>
          </div>
        )}
      </header>

      {/* Category Filter Bar (Moved from Trending) */}
      <div className="fade-in-up" style={{ 
        display: 'flex', 
        gap: '0.8rem', 
        marginBottom: '3.5rem', 
        justifyContent: 'center', 
        flexWrap: 'wrap',
        borderBottom: '1px solid var(--paper3)',
        paddingBottom: '1.5rem'
      }}>
        {CATEGORIES.map(c => (
          <button 
            key={c}
            onClick={() => {
              setActiveCategory(c);
              if (c === 'All Topics') setSearchParams({}); // Reset URL params
            }}
            className="btn-vintage"
            style={{
              background: activeCategory === c ? 'var(--ink)' : 'transparent',
              color: activeCategory === c ? 'var(--gold)' : 'var(--muted)',
              borderColor: activeCategory === c ? 'var(--gold)' : 'var(--paper3)',
              padding: '6px 18px',
              fontSize: '10px'
            }}
          >
            {c}
          </button>
        ))}
        {activeCategory.startsWith('Topic: ') && (
          <button 
            onClick={() => {
              setActiveCategory('All Topics');
              setSearchParams({});
            }}
            className="btn-vintage"
            style={{ background: 'var(--accent)', color: 'var(--paper)', borderColor: 'var(--accent)', padding: '6px 18px', fontSize: '10px', fontWeight: '900' }}
          >
            Clear Filter: {initialTopic} ✕
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredArticles.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem', border: '1px dashed var(--paper3)' }}>
          <h2 className="heading" style={{ fontSize: '32px', color: 'var(--muted)' }}>No Dispatches Located</h2>
          <p className="body-text" style={{ fontStyle: 'italic' }}>We found no articles matching the "{activeCategory}" frequency.</p>
          <button className="btn-ghost" style={{ marginTop: '2rem' }} onClick={() => {setActiveCategory('All Topics'); setSearchParams({});}}>Return to Main Feed</button>
        </div>
      )}

      {/* Featured Article */}
      {featured && (
        <div className="fade-in-up" style={{ marginBottom: '4rem', animationDelay: '0.1s' }}>
          <Link to={`/articles/${featured.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card paper-shimmer" style={{
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '8px solid var(--gold)',
              padding: '3rem',
              boxShadow: '20px 20px 60px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <span className="ui-label" style={{
                  background: 'var(--gold)',
                  color: 'var(--ink)',
                  padding: '4px 12px',
                  fontSize: '12px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  letterSpacing: '2px'
                }}>Lead Story</span>
                <span className="body-text" style={{ fontStyle: 'italic', fontSize: '16px', borderBottom: '1px solid var(--paper3)' }}>{featured.source} · Dispatch</span>
              </div>
              <div style={{ display: 'flex', gap: '3rem', marginBottom: '2rem', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
                {featured.imageUrl && (
                  <img src={featured.imageUrl} alt="" style={{ width: window.innerWidth < 768 ? '100%' : '45%', height: '400px', objectFit: 'cover', border: '1px solid var(--rule)', boxShadow: '10px 10px 0 var(--paper3)' }} />
                )}
                <div style={{ flex: 1 }}>
                  <h2 className="heading" style={{ fontSize: '52px', fontWeight: '900', lineHeight: 1, marginBottom: '1.5rem', color: 'var(--ink)' }}>
                    {featured.title}
                  </h2>
                  <p className="body-text" style={{ fontSize: '22px', lineHeight: 1.5, color: 'var(--ink)', fontStyle: 'italic' }}>
                    {featured.summary}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Two-Column Grid */}
      {regular.length > 0 && <div className="section-banner fade-in-up" style={{ marginBottom: '2rem', animationDelay: '0.2s', padding: '6px 16px', fontSize: '14px' }}>Chronicle of Global Events</div>}
      <div className="fade-in-up" style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : 'minmax(0, 1fr) 1px minmax(0, 1fr)',
        gap: '3rem',
        animationDelay: '0.3s'
      }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {regular.filter((_, i) => i % 2 === 0).map((article, index) => (
            <ArticleCard key={article.id} article={article} index={index} stagger={index * 0.1 + 0.4} />
          ))}
        </div>

        {/* Divider */}
        {window.innerWidth >= 1024 && regular.length > 0 && (
          <div style={{
            background: 'repeating-linear-gradient(0deg, var(--rule) 0, var(--rule) 6px, transparent 6px, transparent 12px)',
            opacity: 0.2
          }}></div>
        )}

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {regular.filter((_, i) => i % 2 !== 0).map((article, index) => (
            <ArticleCard key={article.id} article={article} index={index} stagger={(index + 1) * 0.1 + 0.4} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article, stagger }) {
  return (
    <div className="fade-in-up" style={{ animationDelay: `${stagger}s` }}>
      <Link to={`/articles/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="card" style={{
          padding: '2rem',
          borderLeft: '6px solid var(--accent)',
          height: '100%',
          transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease',
          background: 'var(--paper)'
        }}
        onMouseOver={e => {
          e.currentTarget.style.transform = 'translateY(-8px) rotate(-0.5deg)';
          e.currentTarget.style.boxShadow = '15px 15px 40px rgba(0,0,0,0.1)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.transform = 'translateY(0) rotate(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span className="ui-label" style={{
              color: 'var(--accent)',
              fontSize: '13px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>{article.source}</span>
          </div>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', flexDirection: window.innerWidth < 480 ? 'column' : 'row' }}>
            {article.imageUrl && (
              <img src={article.imageUrl} alt="" style={{ width: window.innerWidth < 480 ? '100%' : '140px', height: '140px', objectFit: 'cover', border: '1px solid var(--rule)', boxShadow: '5px 5px 0 var(--paper3)' }} />
            )}
            <div style={{ flex: 1 }}>
              <h3 className="heading" style={{ fontSize: '28px', fontWeight: '900', lineHeight: 1.2, marginBottom: '1rem' }}>
                {article.title}
              </h3>
              <p className="body-text" style={{ fontSize: '17px', fontStyle: 'italic', color: 'var(--muted)', lineHeight: 1.5 }}>
                {article.summary.length > 300 ? article.summary.substring(0, 300) + '...' : article.summary}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {article.tags?.slice(0, 4).map(tag => (
              <span key={tag} className="ui-label" style={{
                background: 'var(--tag-bg)',
                color: 'var(--tag-fg)',
                fontSize: '11px',
                padding: '2px 8px',
                letterSpacing: '0.5px'
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}
