import React, { useEffect, useState } from 'react';
import { feedApi, userApi } from '../api/client';
import { Link, useSearchParams } from 'react-router-dom';

const ALL_TOPICS = 'all';

function matchesInterest(article, interest) {
  const term = interest.toLowerCase();
  return (
    article.keywords?.some((k) => k.toLowerCase().includes(term)) ||
    article.title.toLowerCase().includes(term) ||
    (article.summary || '').toLowerCase().includes(term)
  );
}

export default function FeedPage() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [topicTotal, setTopicTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeInterest, setActiveInterest] = useState(ALL_TOPICS);
  const [searchParams, setSearchParams] = useSearchParams();

  const topicFilter = searchParams.get('topic');

  useEffect(() => {
    userApi.getInterests()
      .then((res) => setUserInterests(res.data.interests || []))
      .catch(() => setUserInterests([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    if (topicFilter) {
      setActiveInterest(ALL_TOPICS);
    }

    const request = topicFilter
      ? feedApi.getFeed(1, 200, topicFilter)
      : feedApi.getFeed();

    request.then(res => {
      const data = res.data.data || [];
      setArticles(data);
      setFilteredArticles(data);
      setTopicTotal(res.data.pagination?.total ?? data.length);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [topicFilter]);

  useEffect(() => {
    if (topicFilter) return;

    if (activeInterest === ALL_TOPICS) {
      setFilteredArticles(articles);
    } else {
      setFilteredArticles(articles.filter((a) => matchesInterest(a, activeInterest)));
    }
  }, [activeInterest, articles, topicFilter]);

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
          {topicFilter ? `◈ TOPICAL INTELLIGENCE DOSSIER ◈` : `◈ LATEST INTELLIGENCE DISPATCH ◈`}
        </div>
        <h1 className="heading" style={{ fontSize: '64px', fontWeight: '900', color: 'var(--ink)', lineHeight: 1, textTransform: topicFilter ? 'capitalize' : 'none' }}>
          {topicFilter ? topicFilter : 'Your Morning Brief'}
        </h1>
        <p className="body-text" style={{ fontStyle: 'italic', fontSize: '20px', color: 'var(--muted)', marginTop: '0.5rem' }}>
          {topicFilter
            ? `${topicTotal} correlated dispatch${topicTotal === 1 ? '' : 'es'} tagged with "${topicFilter}"`
            : "A daily curiosity-driven chronicle of the world's movements."}
        </p>
        {topicFilter && (
          <div style={{ marginTop: '2rem' }}>
             <Link to="/trending" className="btn-vintage" style={{ fontSize: '10px', textDecoration: 'none' }}>
               ← Return to Global Trends
             </Link>
          </div>
        )}
      </header>

      {/* Interest filter bar */}
      {!topicFilter && (
      <div className="fade-in-up" style={{ 
        display: 'flex', 
        gap: '0.8rem', 
        marginBottom: '3.5rem', 
        justifyContent: 'center', 
        flexWrap: 'wrap',
        borderBottom: '1px solid var(--paper3)',
        paddingBottom: '1.5rem'
      }}>
        <button 
          onClick={() => {
            setActiveInterest(ALL_TOPICS);
            setSearchParams({});
          }}
          className="btn-vintage"
          style={{
            background: activeInterest === ALL_TOPICS ? 'var(--ink)' : 'transparent',
            color: activeInterest === ALL_TOPICS ? 'var(--gold)' : 'var(--muted)',
            borderColor: activeInterest === ALL_TOPICS ? 'var(--gold)' : 'var(--paper3)',
            padding: '6px 18px',
            fontSize: '10px'
          }}
        >
          All Topics
        </button>
        {userInterests.map((interest) => (
          <button 
            key={interest}
            onClick={() => {
              setActiveInterest(interest);
              setSearchParams({});
            }}
            className="btn-vintage"
            style={{
              background: activeInterest === interest ? 'var(--ink)' : 'transparent',
              color: activeInterest === interest ? 'var(--gold)' : 'var(--muted)',
              borderColor: activeInterest === interest ? 'var(--gold)' : 'var(--paper3)',
              padding: '6px 18px',
              fontSize: '10px',
              textTransform: 'capitalize'
            }}
          >
            {interest}
          </button>
        ))}
        {userInterests.length === 0 && (
          <Link to="/profile" className="btn-vintage" style={{ fontSize: '10px', textDecoration: 'none' }}>
            Set up your topic preferences →
          </Link>
        )}
        <Link to="/profile" className="btn-vintage" style={{ fontSize: '10px', textDecoration: 'none', borderStyle: 'dashed' }}>
          Edit preferences
        </Link>
      </div>
      )}

      {topicFilter && (
      <div className="fade-in-up" style={{ 
        display: 'flex', 
        gap: '0.8rem', 
        marginBottom: '3.5rem', 
        justifyContent: 'center', 
        flexWrap: 'wrap',
        borderBottom: '1px solid var(--paper3)',
        paddingBottom: '1.5rem'
      }}>
        <button 
          onClick={() => {
            setActiveInterest(ALL_TOPICS);
            setSearchParams({});
          }}
          className="btn-vintage"
          style={{ background: 'var(--accent)', color: 'var(--paper)', borderColor: 'var(--accent)', padding: '6px 18px', fontSize: '10px', fontWeight: '900' }}
        >
          Clear topic: {topicFilter} ✕
        </button>
      </div>
      )}

      {/* Empty State */}
      {filteredArticles.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem', border: '1px dashed var(--paper3)' }}>
          <h2 className="heading" style={{ fontSize: '32px', color: 'var(--muted)' }}>No Dispatches Located</h2>
          <p className="body-text" style={{ fontStyle: 'italic' }}>
            {topicFilter
              ? `We found no articles tagged with "${topicFilter}".`
              : activeInterest === ALL_TOPICS
                ? 'No articles are available in your feed right now.'
                : `We found no articles matching "${activeInterest}" in your feed.`}
          </p>
          <button className="btn-ghost" style={{ marginTop: '2rem' }} onClick={() => { setActiveInterest(ALL_TOPICS); setSearchParams({}); }}>Return to Main Feed</button>
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
                  <img src={featured.imageUrl} alt="" referrerPolicy="no-referrer" style={{ width: window.innerWidth < 768 ? '100%' : '45%', height: '400px', objectFit: 'cover', border: '1px solid var(--rule)', boxShadow: '10px 10px 0 var(--paper3)' }} />
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
              <img src={article.imageUrl} alt="" referrerPolicy="no-referrer" style={{ width: window.innerWidth < 480 ? '100%' : '140px', height: '140px', objectFit: 'cover', border: '1px solid var(--rule)', boxShadow: '5px 5px 0 var(--paper3)' }} />
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
            {article.keywords?.slice(0, 4).map(tag => (
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
