import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articleApi, interactionApi } from '../api/client.js';

export default function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    articleApi
      .getById(id)
      .then((res) => {
        setArticle(res.data.data || res.data); // Support both formats
        interactionApi.record(id, 'view').catch(() => {});
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load article'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="screen active" style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <div className="heading" style={{ fontSize: '24px', fontStyle: 'italic' }}>Retrieving dispatch...</div>
    </div>
  );

  if (!article) return (
     <div className="screen active" style={{ textAlign: 'center', padding: '100px' }}>
       <h1 className="heading">MISSING DISPATCH</h1>
       <p>{error || 'The requested article could not be located in our archive.'}</p>
       <Link to="/" className="btn-ghost" style={{ marginTop: '2rem', display: 'inline-block' }}>Back to Wire</Link>
     </div>
  );

  return (
    <div className="screen active fade-in-up" style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
      <header className="fade-in-up" style={{ animationDelay: '0.1s', marginBottom: '4rem' }}>
        <Link to="/" className="btn-ghost" style={{ textDecoration: 'none', fontSize: '10px', marginBottom: '2.5rem', display: 'inline-block', letterSpacing: '2px' }}>
          ← BACK TO THE DAILY WIRE
        </Link>
        
        <div style={{ borderTop: '2px solid var(--rule)', borderBottom: '2px solid var(--rule)', padding: '1.5rem 0', textAlign: 'center' }}>
          <div className="ui-label" style={{ color: 'var(--accent)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '12px', fontWeight: '900' }}>
            {article.source} · Wire Dispatch · Vol. XLII
          </div>
          <h1 className="heading" style={{ fontSize: '56px', fontWeight: '900', lineHeight: 1, marginBottom: '1.5rem', color: 'var(--ink)' }}>
            {article.title}
          </h1>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {article.keywords?.map(kw => (
              <span key={kw} className="ui-label" style={{ background: 'var(--paper2)', border: '1px solid var(--paper3)', padding: '4px 12px', fontSize: '10px', textTransform: 'uppercase', fontWeight: '700' }}>
                {kw}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="fade-in-up" style={{ animationDelay: '0.2s', marginBottom: '4rem' }}>
        {article.imageUrl && (
          <figure style={{ margin: 0, position: 'relative' }}>
            <img src={article.imageUrl} alt="" style={{ width: '100%', height: '500px', objectFit: 'cover', filter: 'grayscale(0.2) contrast(1.1)', border: '1px solid var(--rule)', boxShadow: '15px 15px 0 var(--paper3)' }} />
            <figcaption style={{ 
              position: 'absolute', 
              bottom: '-25px', 
              right: '20px', 
              fontFamily: 'var(--font-body)', 
              fontStyle: 'italic', 
              fontSize: '12px', 
              color: 'var(--muted)',
              background: 'var(--paper)',
              padding: '4px 12px',
              border: '1px solid var(--paper3)'
            }}>
              Direct Wire Transmission Photo: {article.source} Archive
            </figcaption>
          </figure>
        )}
      </div>

      <div className="fade-in-up" style={{ animationDelay: '0.3s' }}>
        {article.summary && (
          <div className="card paper-shimmer" style={{ 
            padding: '3rem', 
            marginBottom: '4rem', 
            borderLeft: '10px solid var(--gold)',
            background: 'var(--paper2)',
            boxShadow: '10px 10px 0 rgba(200, 150, 12, 0.1)'
          }}>
            <h2 className="heading" style={{ fontSize: '24px', fontStyle: 'italic', marginBottom: '1.5rem', borderBottom: '1px solid var(--gold)', paddingBottom: '0.5rem', display: 'inline-block' }}>Executive Intelligence Summary</h2>
            <p className="body-text" style={{ fontSize: '19px', lineHeight: 1.6, color: 'var(--ink)' }}>{article.summary}</p>
          </div>
        )}
      </div>

      <div className="fade-in-up" style={{ animationDelay: '0.4s' }}>
        {article.content && (
          <div className="body-text" style={{ 
            fontSize: '20px', 
            lineHeight: 1.8, 
            columnCount: window.innerWidth > 768 ? 2 : 1, 
            columnGap: '4rem',
            columnRule: '1px solid var(--paper3)',
            whiteSpace: 'pre-wrap',
            color: 'var(--ink)',
            textAlign: 'justify'
          }}>
            <span style={{
              float: 'left',
              fontSize: '84px',
              lineHeight: '64px',
              paddingTop: '4px',
              paddingRight: '12px',
              fontFamily: 'var(--font-masthead)',
              color: 'var(--accent)'
            }}>{article.content[0]}</span>
            {article.content.slice(1)}
          </div>
        )}
      </div>

      <footer className="fade-in-up" style={{ animationDelay: '0.5s', marginTop: '6rem', borderTop: '4px double var(--rule)', paddingTop: '3rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--muted)' }}>
            END OF DISPATCH · VERIFIED SECURE
          </p>
        </div>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-vintage"
          style={{ display: 'inline-flex', padding: '14px 40px' }}
        >
          View Original Source Wire
        </a>
      </footer>
    </div>
  );
}
