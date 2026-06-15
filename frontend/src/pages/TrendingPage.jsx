import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { trendingApi } from '../api/client';

export default function TrendingPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch 50 topics to ensure we have enough unique ones for the top 20 display
    trendingApi.getTopics(50).then(res => {
      const data = res.data.data || [];
      // Filter out duplicate topics by name, keeping the highest score one
      const uniqueMap = new Map();
      data.forEach(item => {
        if (!uniqueMap.has(item.topic) || uniqueMap.get(item.topic).score < item.score) {
          uniqueMap.set(item.topic, item);
        }
      });
      // Sort by score and take top 20
      const sortedUnique = Array.from(uniqueMap.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

      setTopics(sortedUnique);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="screen active" style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <div className="heading" style={{ fontSize: '24px', fontStyle: 'italic' }}>Compiling intelligence...</div>
    </div>
  );

  const stats = [
    { label: 'Dispatches', val: '124', icon: '◆' },
    { label: 'Topics', val: topics.length, icon: '◆' },
    { label: 'Wire Services', val: '8', icon: '◆' },
    { label: 'Last Compiled', val: 'Recently', icon: '◆' }
  ];

  const topThree = topics.slice(0, 3);
  const remaining = topics.slice(3, 20);

  return (
    <div id="screen-trending" className="screen active fade-in-up" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 0 4rem 0' }}>
      {/* Header Block */}
      <header style={{
        background: 'var(--ink)',
        color: 'var(--paper)',
        padding: '5rem 3rem',
        borderBottom: '6px double var(--gold)',
        display: 'grid',
        gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : 'minmax(400px, 1fr) 1.2fr',
        gap: '4rem',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract background elements */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', border: '1px solid rgba(200, 150, 12, 0.1)', transform: 'rotate(45deg)' }}></div>

        <div className="fade-in-up" style={{ animationDelay: '0.1s', position: 'relative', zIndex: 2 }}>
          <div style={{ color: 'var(--gold)', fontSize: '13px', letterSpacing: '6px', textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: '700' }}>
            ⟡ Global Intelligence Analysis ⟡
          </div>
          <h1 className="heading" style={{ fontSize: '72px', fontWeight: '900', lineHeight: 1, marginBottom: '2rem' }}>
            The Pulse of <br /><span style={{ color: 'var(--gold)' }}>The World</span>
          </h1>
          <p className="body-text" style={{ fontStyle: 'italic', fontSize: '22px', color: 'var(--paper3)', maxWidth: '650px', lineHeight: 1.5, opacity: 0.8 }}>
            Real-time atmospheric pressure readings of global discourse, synthesized through our proprietary wire intelligence network.
          </p>
        </div>

        <div className="fade-in-up" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '2rem',
          animationDelay: '0.3s',
          position: 'relative',
          zIndex: 2
        }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(200, 150, 12, 0.3)',
              padding: '2rem',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              transition: 'transform 0.3s ease',
              cursor: 'default'
            }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div className="heading" style={{ fontSize: '42px', color: 'var(--gold)', fontWeight: '900' }}>{s.val}</div>
              <div className="ui-label" style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--paper3)', fontWeight: '700' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </header>

      <div style={{ background: 'var(--paper)', padding: '4rem 3rem' }}>
        {/* Top 3 Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '3rem',
          marginBottom: '6rem'
        }}>
          {topThree.map((topic, i) => (
            <div key={topic.id} className="fade-in-up" style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
              <Link to={`/?topic=${encodeURIComponent(topic.topic)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={`card ${i === 0 ? 'paper-shimmer' : ''}`} style={{
                  padding: '3rem',
                  borderTop: `8px solid ${i === 0 ? 'var(--gold)' : i === 1 ? 'var(--accent)' : 'var(--muted)'}`,
                  height: '100%',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-12px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div className="heading" style={{
                    position: 'absolute',
                    top: '30px',
                    right: '30px',
                    fontSize: '84px',
                    opacity: 0.08,
                    fontWeight: '900',
                    userSelect: 'none',
                    lineHeight: 1
                  }}>#{i + 1}</div>

                  <div style={{ marginBottom: '2rem', flex: 1 }}>
                    <div className="ui-label" style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: '900', marginBottom: '16px', letterSpacing: '2px' }}>
                      ⚡ Trending Now
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexDirection: 'column' }}>
                      {topic.imageUrl && (
                        <img src={topic.imageUrl} alt="" referrerPolicy="no-referrer" style={{ width: '100%', height: '200px', objectFit: 'cover', border: '1px solid var(--rule)', boxShadow: '8px 8px 0 var(--paper3)' }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <h2 className="heading" style={{ fontSize: '42px', fontWeight: '900', textTransform: 'capitalize', lineHeight: 1.1, marginBottom: '1.2rem' }}>{topic.topic}</h2>
                        <p className="body-text" style={{ fontSize: '17px', color: 'var(--ink)', lineHeight: 1.5, fontStyle: 'italic' }}>
                          {topic.summary ? (topic.summary.length > 220 ? topic.summary.substring(0, 220) + '...' : topic.summary) : 'Analyzing high-frequency wire transmissions and related geopolitical signals for this emerging topic...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '12px' }}>
                      <span className="ui-label" style={{ fontWeight: '900' }}>{topic.articleCount} CORRELATED DISPATCHES</span>
                      <span className="ui-label" style={{ color: 'var(--gold)', fontWeight: '900' }}>VELOCITY: {topic.score.toFixed(1)}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, topic.score * 10)}%`,
                        height: '100%',
                        background: i === 0 ? 'var(--gold)' : i === 1 ? 'var(--accent)' : 'var(--muted)',
                        transition: 'width 1.5s cubic-bezier(0.23, 1, 0.32, 1)'
                      }}></div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Ranks 4-20 Table Grid */}
        <div className="section-banner fade-in-up" style={{ marginBottom: '2.5rem', animationDelay: '0.8s', padding: '8px 20px', fontSize: '15px' }}>Extended Coverage Index</div>
        <div className="fade-in-up" style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 1024 ? '1fr' : 'repeat(2, 1fr)',
          borderTop: '3px solid var(--rule)',
          borderLeft: '3px solid var(--rule)',
          animationDelay: '0.9s'
        }}>
          {remaining.map((topic, i) => (
            <div key={topic.id}>
              <Link to={`/?topic=${encodeURIComponent(topic.topic)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2rem 2.5rem',
                  gap: '2rem',
                  borderBottom: '1px solid var(--paper3)',
                  borderRight: '1px solid var(--paper3)',
                  background: 'var(--paper)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = 'var(--paper2)';
                    e.currentTarget.style.paddingLeft = '3rem';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = 'var(--paper)';
                    e.currentTarget.style.paddingLeft = '2.5rem';
                  }}
                >
                  <div className="heading" style={{ fontSize: '28px', color: 'var(--muted)', width: '50px', fontWeight: '900', opacity: 0.4 }}>#{i + 4}</div>
                  <div style={{ flex: 1 }}>
                    <div className="heading" style={{ fontSize: '28px', fontWeight: '900', textTransform: 'capitalize' }}>{topic.topic}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="ui-label" style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px', fontWeight: '700' }}>{topic.articleCount} Articles</div>
                    <div className="heading" style={{ fontSize: '22px', fontWeight: '900', color: 'var(--ink)' }}>{topic.score.toFixed(1)}</div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
