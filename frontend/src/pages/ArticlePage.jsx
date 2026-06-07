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
    <div className="screen active" style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1rem' }}>
      <Link to="/" className="ui-label" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '10px', marginBottom: '2rem', display: 'inline-block' }}>
        ← RETURN TO GAZETTE
      </Link>
      
      <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--paper3)', paddingBottom: '1.5rem' }}>
        <div className="ui-label" style={{ color: 'var(--muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
          {article.source} Dispatch
        </div>
        <h1 className="heading" style={{ fontSize: '38px', fontWeight: '900', lineHeight: 1.1, marginBottom: '1rem' }}>
          {article.title}
        </h1>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {article.keywords?.map(kw => (
            <span key={kw} className="ui-label" style={{ border: '1px solid var(--paper3)', padding: '2px 8px', fontSize: '9px', textTransform: 'uppercase' }}>
              {kw}
            </span>
          ))}
        </div>
      </header>

      {article.imageUrl && (
        <div style={{ marginBottom: '2.5rem', position: 'relative' }}>
          <img src={article.imageUrl} alt="" style={{ width: '100%', filter: 'grayscale(0.3) contrast(1.1)', border: '1px solid var(--rule)' }} />
          <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'var(--ink)', color: 'var(--paper)', fontSize: '8px', padding: '2px 6px' }}>
            WIRE PHOTO
          </div>
        </div>
      )}

      {article.summary && (
        <div className="card" style={{ 
          padding: '2rem', 
          marginBottom: '3rem', 
          borderLeft: '4px solid var(--gold)',
          background: 'var(--paper2)'
        }}>
          <h2 className="heading" style={{ fontSize: '20px', fontStyle: 'italic', marginBottom: '1rem' }}>Executive Summary</h2>
          <p className="body-text" style={{ fontSize: '16px', lineHeight: 1.6 }}>{article.summary}</p>
        </div>
      )}

      {article.content && (
        <div className="body-text" style={{ 
          fontSize: '18px', 
          lineHeight: 1.7, 
          columnCount: 1, 
          columnGap: '2rem',
          whiteSpace: 'pre-wrap',
          color: 'var(--ink)'
        }}>
          {article.content}
        </div>
      )}

      <div style={{ marginTop: '4rem', borderTop: '2px solid var(--rule)', paddingTop: '2rem', textAlign: 'center' }}>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost"
          style={{ fontSize: '12px', padding: '10px 24px' }}
        >
          Read Full Original Wire Dispatch
        </a>
      </div>
    </div>
  );
}
