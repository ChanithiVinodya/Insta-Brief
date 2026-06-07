import React, { useEffect, useState } from 'react';
import { trendingApi } from '../api/client';

export default function TrendingPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All Topics');

  useEffect(() => {
    trendingApi.getTopics().then(res => {
      setTopics(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="screen active" style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <div className="heading" style={{ fontSize: '24px', fontStyle: 'italic' }}>Compiling intelligence...</div>
    </div>
  );

  const stats = [
    { label: 'Dispatches', val: '47', icon: '◆' },
    { label: 'Topics', val: topics.length, icon: '◆' },
    { label: 'Wire Services', val: '3', icon: '◆' },
    { label: 'Last Compiled', val: '6AM', icon: '◆' }
  ];

  const topThree = topics.slice(0, 3);
  const remaining = topics.slice(3, 9);
  const categories = ['All Topics', 'World', 'Politics', 'Technology', 'Health'];

  return (
    <div id="screen-trending" className="screen active" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 0 4rem 0' }}>
      {/* Header Block */}
      <header style={{ 
        background: 'var(--ink)', 
        color: 'var(--paper)', 
        padding: '3rem 2rem', 
        borderBottom: '4px double var(--gold)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4rem',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ color: 'var(--gold)', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1rem' }}>
            ⟡ Intelligence Report ⟡
          </div>
          <h1 className="heading" style={{ fontSize: '42px', fontWeight: '900', lineHeight: 1.1, marginBottom: '1rem' }}>
            The Wire at a Glance
          </h1>
          <p className="body-text" style={{ fontStyle: 'italic', fontSize: '16px', color: 'var(--paper3)', maxWidth: '400px' }}>
            Current atmospheric pressure of global discourse, synthesized from the latest wire dispatches.
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {stats.map(s => (
            <div key={s.label} style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(200, 150, 12, 0.3)', 
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div className="heading" style={{ fontSize: '24px', color: 'var(--gold)', fontWeight: '700' }}>{s.val}</div>
              <div className="ui-label" style={{ fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </header>

      <div style={{ background: 'var(--paper)', padding: '2rem' }}>
        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', justifyContent: 'center' }}>
          {categories.map(c => (
            <button 
              key={c}
              onClick={() => setActiveCategory(c)}
              style={{
                background: activeCategory === c ? 'var(--rule)' : 'var(--paper)',
                color: activeCategory === c ? 'var(--paper)' : 'var(--ink)',
                border: '1px solid var(--paper3)',
                padding: '6px 16px',
                fontFamily: 'var(--font-ui)',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: '0.2s'
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Top 3 Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {topThree.map((topic, i) => (
            <div key={topic.id} className="card-enter" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="card" style={{
                padding: '1.5rem',
                borderTop: `4px solid ${i === 0 ? 'var(--gold)' : i === 1 ? 'var(--accent)' : 'var(--muted)'}`,
                height: '100%',
                position: 'relative'
              }}>
                <div className="heading" style={{ 
                  position: 'absolute', 
                  top: '10px', 
                  right: '10px', 
                  fontSize: '48px', 
                  opacity: 0.1, 
                  fontWeight: '900' 
                }}>#{i + 1}</div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <div className="ui-label" style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>Momentum Topic</div>
                  <h2 className="heading" style={{ fontSize: '22px', fontWeight: '900', textTransform: 'capitalize' }}>{topic.topic}</h2>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '4px' }}>
                    <span className="ui-label">{topic.articleCount} Articles</span>
                    <span className="ui-label">Score: {topic.score.toFixed(1)}</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.05)' }}>
                    <div style={{ 
                      width: `${Math.min(100, topic.score * 10)}%`, 
                      height: '100%', 
                      background: i === 0 ? 'var(--gold)' : i === 1 ? 'var(--accent)' : 'var(--muted)' 
                    }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  <span className="ui-label" style={{ border: '1px solid var(--paper3)', padding: '2px 6px', fontSize: '8px' }}>Intelligence</span>
                  <span className="ui-label" style={{ border: '1px solid var(--paper3)', padding: '2px 6px', fontSize: '8px' }}>Global</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ranks 4-9 Table Grid */}
        <div className="section-banner" style={{ marginBottom: '1rem' }}>Additional Wire Topics</div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          borderTop: '2px solid var(--rule)',
          borderLeft: '2px solid var(--rule)'
        }}>
          {remaining.map((topic, i) => (
            <div key={topic.id} className="card-enter" style={{ animationDelay: `${(i + 3) * 0.05}s` }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem 1.5rem',
                gap: '1.5rem',
                borderBottom: '1px solid var(--paper3)',
                borderRight: '1px solid var(--paper3)',
                background: 'var(--paper)',
                transition: '0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--paper2)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--paper)'}
              >
                <div className="heading" style={{ fontSize: '20px', color: 'var(--muted)', width: '30px', fontWeight: '700' }}>#{i + 4}</div>
                <div style={{ flex: 1 }}>
                  <div className="heading" style={{ fontSize: '16px', fontWeight: '700', textTransform: 'capitalize' }}>{topic.topic}</div>
                  <div style={{ width: '40px', height: '2px', background: 'var(--rule)', marginTop: '4px' }}></div>
                </div>
                <div className="ui-label" style={{ fontSize: '10px', color: 'var(--muted)' }}>{topic.articleCount} articles</div>
                <div className="heading" style={{ fontSize: '14px', fontWeight: '700', width: '40px', textAlign: 'right' }}>{topic.score.toFixed(1)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
