import React, { useEffect, useState } from 'react';
import { feedApi } from '../api/client';
import { Link } from 'react-router-dom';

export default function FeedPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    feedApi.getFeed().then(res => {
      setArticles(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="screen active" style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <div className="heading" style={{ fontSize: '24px', fontStyle: 'italic' }}>Gathering dispatches...</div>
    </div>
  );

  const featured = articles[0];
  const regular = articles.slice(1);

  return (
    <div id="screen-feed" className="screen active" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Newspaper Header */}
      <header style={{ 
        textAlign: 'center', 
        marginBottom: '3rem', 
        borderBottom: '4px double var(--rule)',
        paddingBottom: '1.5rem',
        background: 'var(--paper)'
      }}>
        <div style={{ fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
          ✦ ✦ ✦
        </div>
        <h1 className="heading" style={{ fontSize: '48px', fontWeight: '900', color: 'var(--ink)' }}>Your Morning Brief</h1>
        <p className="body-text" style={{ fontStyle: 'italic', fontSize: '18px', color: 'var(--muted)' }}>
          A curiosity-driven summary of the world's movements.
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--rule)' }}></div>
          <span style={{ fontSize: '12px' }}>◈</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--rule)' }}></div>
        </div>
      </header>

      {/* Featured Article */}
      {featured && (
        <div className="card-enter" style={{ marginBottom: '3rem' }}>
          <Link to={`/articles/${featured.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              borderLeft: '5px solid var(--gold)',
              padding: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <span className="ui-label" style={{ 
                  background: 'var(--gold)', 
                  color: 'var(--ink)', 
                  padding: '2px 8px', 
                  fontSize: '10px', 
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>Featured Dispatch</span>
                <span className="body-text" style={{ fontStyle: 'italic', fontSize: '12px' }}>{featured.source}</span>
              </div>
              <h2 className="heading" style={{ fontSize: '28px', fontWeight: '900', lineHeight: 1.2, marginBottom: '1rem' }}>
                {featured.title}
              </h2>
              <p className="body-text" style={{ fontSize: '16px', marginBottom: '1.5rem', color: 'var(--ink)' }}>
                {featured.summary}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {featured.tags?.map(tag => (
                  <span key={tag} className="ui-label" style={{ 
                    background: 'var(--tag-bg)', 
                    color: 'var(--tag-fg)', 
                    fontSize: '9px', 
                    padding: '2px 8px'
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Two-Column Grid */}
      <div className="section-banner" style={{ marginBottom: '1rem' }}>Chronicle of Events</div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'minmax(0, 1fr) 1px minmax(0, 1fr)', 
        gap: '2rem' 
      }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {regular.filter((_, i) => i % 2 === 0).map((article, index) => (
            <ArticleCard key={article.id} article={article} index={index} stagger={index * 0.05} />
          ))}
        </div>

        {/* Divider */}
        <div style={{ 
          background: 'repeating-linear-gradient(0deg, var(--rule) 0, var(--rule) 4px, transparent 4px, transparent 8px)' 
        }}></div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {regular.filter((_, i) => i % 2 !== 0).map((article, index) => (
            <ArticleCard key={article.id} article={article} index={index} stagger={(index + 1) * 0.05} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article, stagger }) {
  return (
    <div className="card-enter" style={{ animationDelay: `${stagger}s` }}>
      <Link to={`/articles/${article.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="card" style={{ 
          padding: '1.25rem', 
          borderLeft: '4px solid var(--accent)',
          height: '100%'
        }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span className="ui-label" style={{ 
              color: 'var(--accent)', 
              fontSize: '10px', 
              fontWeight: '700',
              textTransform: 'uppercase'
            }}>{article.source}</span>
          </div>
          <h3 className="heading" style={{ fontSize: '18px', fontWeight: '700', lineHeight: 1.3, marginBottom: '0.75rem' }}>
            {article.title}
          </h3>
          <p className="body-text" style={{ fontSize: '13px', fontStyle: 'italic', marginBottom: '1rem', color: 'var(--muted)' }}>
            {article.summary.length > 120 ? article.summary.substring(0, 120) + '...' : article.summary}
          </p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {article.tags?.slice(0, 3).map(tag => (
              <span key={tag} className="ui-label" style={{ 
                background: 'var(--tag-bg)', 
                color: 'var(--tag-fg)', 
                fontSize: '8px', 
                padding: '1px 6px'
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}
