import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';

const ARTICLE_DATA = [
  { src: "RSS · NYT", hl: "Russian Satellites Have Been Jamming GPS Signals Across Europe, Scientists Say", sz: "lg", body: "Scientists and U.S. military briefers have linked short, widespread interference incidents to Russia, revealing deep vulnerabilities in a technology essential to everyday society." },
  { src: "NewsAPI", hl: "Most K-12 Teachers Say AI's Impact on Education Will Eclipse the Internet", sz: "md", body: "A new NPR/Ipsos poll shows many teachers are saving hours weekly using artificial intelligence tools, but a majority remain troubled by evidence that independent critical thought is being eroded." },
  { src: "Reuters", hl: "Pope Leo Prepares for New Duels in Spain After Taking on Trump and A.I.", sz: "md", body: "Leo arrived in Madrid on Saturday for a weeklong visit in which he will meet with migrants and may come under fire from Vox, Spain's far-right party." },
  { src: "RSS · NYT", hl: "Israeli Strike Kills 3 Lebanese Soldiers, Days After Signing Truce", sz: "sm", body: "Israel's military offensive in Lebanon, launched to dismantle Hezbollah's northern infrastructure, has drawn in regular Lebanese army units." },
  { src: "AP Wire", hl: "Global Semiconductor Supply Chains Stabilize After Months of Turbulence", sz: "md", body: "Manufacturers report that the lead times for critical components have enfin begun to normalize, though experts warn of potential secondary shocks in the logistics sector." },
  { src: "Reuters", hl: "New Archaeological Discovery in Egypt Reveals Unseen Dynastic Tomb", sz: "lg", body: "A mission in Saqqara has uncovered a beautifully preserved tomb dating back to the Fifth Dynasty, complete with vibrant murals depicting daily life in the Old Kingdom." },
  { src: "NewsAPI", hl: "Renewable Energy Capacity Set to Set Records in Upcoming Fiscal Year", sz: "sm", body: "Projected investment in solar and wind infrastructure is expected to surpass previous benchmarks as nations accelerate their transition toward sustainable power generation." },
  { src: "RSS · NYT", hl: "International Space Station Prepares for Largest Docking in Five Years", sz: "md", body: "The orbital laboratory will soon host a multinational crew who will conduct experiments on long-term habitation and extraterrestrial manufacturing techniques." }
];

const CITIES = ["London", "Washington", "Cairo", "Vienna", "Madrid"];

export default function RegisterPage() {
  const [formData, setFormData] = useState({ displayName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cols, setCols] = useState([]);
  const [gridTemplate, setGridTemplate] = useState('1fr');
  const [duration, setDuration] = useState('70s');

  const { login } = useAuth();
  const navigate = useNavigate();

  const getColCount = useCallback(() => {
    const w = window.innerWidth;
    if (w >= 1024) return 4;
    if (w >= 768) return 3;
    if (w >= 480) return 2;
    return 1;
  }, []);

  const buildNewspaper = useCallback(() => {
    const n = getColCount();
    const distributed = Array.from({ length: n }, () => []);
    
    ARTICLE_DATA.forEach((art, i) => {
      distributed[i % n].push(art);
    });

    const newCols = distributed.map((articles, colIdx) => ({
      hasMasthead: colIdx === 0,
      articles: articles
    }));

    setCols(newCols);
    const template = Array.from({ length: n }, (_, i) => i === 0 ? '1fr' : '2px 1fr').join(' ');
    setGridTemplate(template);

    const w = window.innerWidth;
    if (w >= 1024) setDuration('55s');
    else if (w >= 768) setDuration('60s');
    else setDuration('70s');
  }, [getColCount]);

  useEffect(() => {
    buildNewspaper();
    const handleResize = () => {
      clearTimeout(window.resizeTimer);
      window.resizeTimer = setTimeout(buildNewspaper, 200);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [buildNewspaper]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.register(formData);
      login(res.data.user, res.data.token);
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderArticle = (art, index) => (
    <div key={index} className="article-block" style={{ marginBottom: '14px', opacity: 0.4 }}>
      <h3 style={{ 
        fontFamily: 'var(--font-heading)', 
        fontSize: art.sz === 'lg' ? '18px' : '14px',
        color: 'rgba(20,12,4,0.6)',
        marginBottom: '4px'
      }}>{art.hl}</h3>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(35,20,5,0.4)' }}>{art.body}</p>
      <div className="rule" style={{ height: '1px', background: 'rgba(40,22,5,0.2)', marginTop: '14px' }}></div>
    </div>
  );

  const NewspaperContent = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: gridTemplate,
      padding: '0 10px'
    }}>
      {cols.map((col, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <div className="col-rule" style={{
              width: '2px',
              background: 'repeating-linear-gradient(180deg, rgba(60,35,10,0.3) 0, rgba(60,35,10,0.3) 4px, transparent 4px, transparent 10px)'
            }}></div>
          )}
          <div className="news-col" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {col.hasMasthead && (
              <div className="masthead-block" style={{ borderBottom: '2px solid rgba(40,20,5,0.3)', paddingBottom: '8px', marginBottom: '8px' }}>
                <h1 style={{ fontFamily: 'var(--font-masthead)', fontSize: '24px', color: 'rgba(25,15,5,0.5)', margin: 0 }}>The InstaBrief</h1>
              </div>
            )}
            {col.articles.map((art, artIdx) => renderArticle(art, artIdx))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="register-root" style={{
      position: 'relative',
      minHeight: '100vh',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--paper-base)'
    }}>
      {/* Background with parallax effect */}
      <div className="paper-bg" style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--paper-bg)',
          opacity: 0.9
        }}></div>
        <div className="scroll-track" style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          animationDuration: duration,
          filter: 'grayscale(0.2) sepia(0.2)'
        }}>
          <NewspaperContent />
          <NewspaperContent />
        </div>
        <div className="aged-overlay" style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 50%, transparent 20%, rgba(20,10,0,0.4) 100%)',
          zIndex: 2, pointerEvents: 'none'
        }}></div>
      </div>

      {/* Registration Card */}
      <div className="login-card fade-in-up paper-shimmer" style={{
        position: 'relative',
        zIndex: 10,
        background: 'var(--paper)',
        border: '3px double var(--rule)',
        boxShadow: '12px 12px 0 rgba(20,10,0,0.6), 0 0 80px rgba(0,0,0,0.5)',
        width: '95%',
        maxWidth: '480px',
        padding: '2.5rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '10px',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: '0.5rem',
            fontWeight: '700'
          }}>New Dispatch Enrollment</div>
          <h1 style={{
            fontFamily: 'var(--font-masthead)',
            fontSize: '42px',
            color: 'var(--ink)',
            margin: 0,
            lineHeight: 1
          }}>Join the Gazette</h1>
          <div style={{
            height: '2px',
            width: '60px',
            background: 'var(--gold)',
            margin: '1rem auto'
          }}></div>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
            fontSize: '16px',
            color: 'var(--muted)'
          }}>Secure your personal intelligence wire today.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="fade-in-up" style={{ 
              color: 'var(--paper)', 
              background: 'var(--accent)', 
              padding: '8px', 
              fontSize: '12px', 
              textAlign: 'center', 
              marginBottom: '1.5rem', 
              fontFamily: 'var(--font-ui)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {error}
            </div>
          )}

          <div className="input-group">
            <input
              type="text"
              id="displayName"
              placeholder=" "
              required
              className="input-field-vintage"
              value={formData.displayName}
              onChange={e => setFormData({ ...formData, displayName: e.target.value })}
            />
            <label htmlFor="displayName" className="input-label-float">Preferred Identity / Name</label>
          </div>

          <div className="input-group">
            <input
              type="email"
              id="email"
              placeholder=" "
              required
              className="input-field-vintage"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            <label htmlFor="email" className="input-label-float">Dispatch Address (Email)</label>
          </div>

          <div className="input-group">
            <input
              type="password"
              id="password"
              placeholder=" "
              required
              minLength={8}
              className="input-field-vintage"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
            <label htmlFor="password" className="input-label-float">Cipher Key (8+ characters)</label>
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <button
              type="submit"
              disabled={loading}
              className="btn-vintage w-full"
              style={{ padding: '14px' }}
            >
              {loading ? (
                <span>Engraving Records...</span>
              ) : (
                <>
                  <span>Begin Subscription</span>
                  <span style={{ marginLeft: '10px' }}>→</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          fontSize: '14px',
          color: 'var(--muted)',
          borderTop: '1px solid var(--paper3)',
          paddingTop: '1rem'
        }}>
          Already a reader? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '700', textDecoration: 'none', borderBottom: '1px solid var(--accent)' }}>Return to Newsroom</Link>
        </div>

        {/* Decorative corner elements */}
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderTop: '2px solid var(--paper3)', borderRight: '2px solid var(--paper3)' }}></div>
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '20px', height: '20px', borderBottom: '2px solid var(--paper3)', borderLeft: '2px solid var(--paper3)' }}></div>
      </div>

      {/* Floating UI Elements */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        right: '30px',
        zIndex: 5,
        fontFamily: 'var(--font-ui)',
        fontSize: '10px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
      }}>
        <span>Vol. I · Issue IV</span>
        <span>Secure Transmission Active</span>
      </div>
    </div>
  );
}
