import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';

const ARTICLE_DATA = [
  { src: "RSS · NYT", hl: "Russian Satellites Have Been Jamming GPS Signals Across Europe, Scientists Say", sz: "lg", body: "Scientists and U.S. military briefers have linked short, widespread interference incidents to Russia, revealing deep vulnerabilities in a technology essential to everyday society. The jamming has disrupted aviation navigation and maritime routes alike, prompting urgent calls for redundant positioning systems." },
  { src: "NewsAPI", hl: "Most K-12 Teachers Say AI's Impact on Education Will Eclipse the Internet", sz: "md", body: "A new NPR/Ipsos poll shows many teachers are saving hours weekly using artificial intelligence tools, but a majority remain troubled by evidence that independent critical thought among students is being eroded at an alarming rate across all grade levels." },
  { src: "Reuters", hl: "Pope Leo Prepares for New Duels in Spain After Taking on Trump and A.I.", sz: "md", body: "Leo arrived in Madrid on Saturday for a weeklong visit in which he will meet with migrants and may come under fire from Vox, Spain's far-right party, adding yet another geopolitical confrontation to his already turbulent pontificate." },
  { src: "RSS · NYT", hl: "Israeli Strike Kills 3 Lebanese Soldiers, Days After Signing Truce", sz: "sm", body: "Israel's military offensive in Lebanon, launched to dismantle Hezbollah's northern infrastructure, has drawn in regular Lebanese army units, threatening to unravel a fragile ceasefire agreement brokered through weeks of shuttle diplomacy by Western powers." },
  { src: "AP Wire", hl: "Iran Nuclear Talks Resume Amid Escalating Tensions With Western Powers", sz: "md", body: "Diplomatic back-channels have quietly reopened after months of stalemate. Analysts warn that a breakdown in negotiations could trigger the most severe proliferation crisis in a decade, with consequences stretching from the Persian Gulf to European financial markets." },
  { src: "NewsAPI", hl: "Ebola Outbreak Spreads to Three New Provinces in the Democratic Republic of Congo", sz: "lg", body: "World Health Organization officials confirmed that the viral hemorrhagic fever has crossed provincial boundaries despite active containment efforts. Vaccination campaigns are underway but face significant logistical obstacles in remote and conflict-affected territories." },
  { src: "Reuters", hl: "Vladimir Putin Signs Decree Expanding State Control Over Foreign Currency Transactions", sz: "sm", body: "The measure gives the Kremlin sweeping authority to monitor and restrict the movement of foreign capital by Russian nationals, a move analysts say tightens the financial vice on the oligarch class while shielding the rouble from speculative pressure." },
  { src: "AP Wire", hl: "British Parliament Passes Emergency Legislation on Digital Surveillance", sz: "md", body: "The bill cleared the House of Commons by a narrow margin after days of heated debate. Civil liberties groups condemned it as the most significant expansion of state monitoring powers since the Regulation of Investigatory Powers Act of the year 2000." },
  { src: "RSS · NYT", hl: "President Signs Executive Order Restricting Imports of Rare Earth Minerals", sz: "sm", body: "The order targets seventeen strategic materials sourced primarily from adversarial nations. Industry groups warn of supply chain disruptions across the semiconductor, defence, and clean energy sectors that could take years to resolve through alternative sourcing." },
  { src: "NewsAPI", hl: "Artificial Intelligence Models Now Write First Drafts for a Third of All News Articles", sz: "lg", body: "A survey of two hundred newsrooms across twelve countries reveals an accelerating shift toward machine-assisted journalism. Editors report significant time savings but grapple with mounting questions of attribution, factual accuracy, and the erosion of institutional editorial voice." },
  { src: "Reuters", hl: "Ceasefire in Gaza Holds for Seventh Consecutive Day as Talks Continue in Cairo", sz: "md", body: "Mediators from Egypt, Qatar, and the United States expressed cautiously optimism as both parties observed the truce. Humanitarian convoys have resumed limited operations in the northern sector, delivering food, medicine, and emergency shelter materials." },
  { src: "AP Wire", hl: "Spain's Far-Right Vox Party Calls for Snap Elections After Coalition Collapse", sz: "sm", body: "The governing coalition lost its parliamentary majority following defections over a contentious immigration reform package. Constitutional scholars say snap elections could be called within sixty days, throwing the European Union's fourth-largest economy into political uncertainty." },
  // Repeated for loop stability
  { src: "RSS · NYT", hl: "Quantum Supremacy Achieved in New Silicon Valley Laboratory", sz: "lg", body: "A team of researchers at a leading technology firm has announced the creation of a quantum processor capable of completing calculations in seconds that would take standard supercomputers ten millennia. The breakthrough marks a new era in computational power." },
  { src: "Reuters", hl: "Venice Implements High-Stakes Canal Restoration Project", sz: "md", body: "The floating city has begun the most ambitious engineering project in its history to stabilize the foundational pilings of San Marco. The effort involves underwater robotics and a new variety of salt-resistant stone sourced from the Italian Alps." },
  { src: "AP Wire", hl: "Mars Rover Discovers Subsurface Water Deposits in Gale Crater", sz: "sm", body: "Data transmitted from the late-model rover suggests significant reservoirs of liquid-brine water located beneath the Martian crust, a finding that could dramatically alter the timeline for future manned exploration of the Red Planet." }
];


const AD_DATA = [
  { title: "Cartwright & Sons", body: "Importers of Fine Indian Teas & Colonial Provisions. Established in the Borough of Southwark, 1887. Wholesale enquiries welcome." },
  { title: "Dr. Elmore's Restorative Tonic", body: "Prescribed by physicians of distinction throughout the Empire. Recommended for nervous exhaustion, bilious complaints & want of vitality." },
  { title: "The Grand Continental Hotel", body: "Vienna · Paris · Constantinople · Cairo. Unsurpassed elegance for the discerning traveller. Telegraphic reservations accepted." }
];

const CITIES = ["London", "Washington", "Cairo", "Vienna", "Madrid"];

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
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

    // Distribute articles
    ARTICLE_DATA.forEach((art, i) => {
      distributed[i % n].push(art);
    });

    const newCols = distributed.map((articles, colIdx) => ({
      hasMasthead: colIdx === 0,
      articles: articles
    }));

    setCols(newCols);

    // Set grid template
    const template = Array.from({ length: n }, (_, i) => i === 0 ? '1fr' : '2px 1fr').join(' ');
    setGridTemplate(template);

    // Set duration
    const w = window.innerWidth;
    if (w >= 1024) setDuration('55s');
    else if (w >= 768) setDuration('60s');
    else setDuration('70s');
  }, [getColCount]);

  useEffect(() => {
    buildNewspaper();
    const handleResize = () => {
      // Simple debounce
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
      const res = await authApi.login(formData);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const renderArticle = (art, index) => {
    const isDropCap = index % 4 === 0;
    const city = CITIES[index % CITIES.length];

    return (
      <div key={index} className="article-block" style={{ marginBottom: '14px' }}>
        <div className="source-badge" style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '7px',
          fontWeight: '700',
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
          color: 'rgba(100,50,20,0.6)',
          marginBottom: '4px'
        }}>
          {art.src}
        </div>
        <h3 className={`headline ${art.sz}`} style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: '700',
          lineHeight: '1.2',
          color: 'rgba(20,12,4,0.72)',
          fontSize: art.sz === 'lg' ? '18px' : art.sz === 'md' ? '16px' : '14px',
          marginBottom: '4px'
        }}>
          {art.hl}
        </h3>
        <div className="byline" style={{
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          fontSize: '10px',
          color: 'rgba(40,22,5,0.45)',
          marginBottom: '6px'
        }}>
          By Our Correspondent · {city}
        </div>
        <p className={`body ${isDropCap ? 'n-dropcap' : ''}`} style={{
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          fontSize: '12px',
          lineHeight: '1.65',
          color: 'rgba(35,20,5,0.58)'
        }}>
          {isDropCap && (
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: '900',
              fontSize: '36px',
              float: 'left',
              lineHeight: '0.75',
              margin: '4px 3px 0 0',
              color: 'rgba(20,12,4,0.7)'
            }}>{art.body[0]}</span>
          )}
          {isDropCap ? art.body.slice(1) : art.body}
        </p>

        {index === 1 && (
          <div className="advert" style={{
            border: '1.5px solid rgba(40,22,5,0.3)',
            padding: '8px',
            textAlign: 'center',
            marginTop: '18px'
          }}>
            <div style={{ borderTop: '1px solid rgba(40,22,5,0.25)', borderBottom: '1px solid rgba(40,22,5,0.25)', padding: '4px 0', margin: '4px 0' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: '900', fontStyle: 'italic', fontSize: '13px' }}>
                {AD_DATA[0].title}
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: '10px' }}>
              {AD_DATA[0].body}
            </div>
          </div>
        )}

        {index === 4 && (
          <div className="engraving" style={{
            width: '100%',
            height: '60px',
            background: 'rgba(40,22,5,0.08)',
            border: '1px solid rgba(40,22,5,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'rgba(40,22,5,0.35)',
            marginTop: '18px'
          }}>
            [ Engraving ]
          </div>
        )}

        <div className="rule" style={{ height: '1px', background: 'rgba(40,22,5,0.3)', marginTop: '14px' }}></div>
      </div>
    );
  };

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
              background: 'repeating-linear-gradient(180deg, rgba(60,35,10,0.55) 0, rgba(60,35,10,0.55) 4px, transparent 4px, transparent 10px)'
            }}></div>
          )}
          <div className="news-col" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {col.hasMasthead && (
              <div className="masthead-block" style={{ borderBottom: '3px double rgba(40,20,5,0.5)', paddingBottom: '12px', marginBottom: '8px' }}>
                <h1 style={{ fontFamily: 'var(--font-masthead)', fontSize: '36px', color: 'rgba(25,15,5,0.75)', margin: 0 }}>The InstaBrief Gazette</h1>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(40,25,5,0.5)', margin: '4px 0 0 0' }}>
                  Dispatching clarity to the modern mind · Founded 2026
                </p>
              </div>
            )}
            {col.articles.map((art, artIdx) => renderArticle(art, artIdx))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="login-root" style={{
      position: 'relative',
      minHeight: '100vh',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--paper-base)'
    }}>
      {/* Newspaper Background */}
      <div className="paper-bg" aria-hidden="true" style={{
        position: 'absolute',
        inset: '0',
        background: 'var(--paper-bg)',
        overflow: 'hidden',
        zIndex: 2
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 60% at 20% 30%, rgba(180,140,60,0.35) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 70%, rgba(160,120,40,0.3) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 55% 15%, rgba(200,170,90,0.2) 0%, transparent 50%),
            repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.018) 1px, rgba(0,0,0,0.018) 2px)
          `,
          pointerEvents: 'none'
        }}></div>

        <div className="scroll-track" style={{
          position: 'absolute',
          top: '0', left: '0', right: '0',
          animationDuration: duration
        }}>
          <NewspaperContent />
          <NewspaperContent />
        </div>
      </div>

      {/* Overlays */}
      <div className="fog-top" style={{
        position: 'absolute', top: '0', left: '0', right: '0', height: '120px',
        background: 'linear-gradient(to bottom, rgba(180,155,95,0.92) 0%, transparent 100%)',
        zIndex: 3, pointerEvents: 'none'
      }}></div>
      <div className="fog-bottom" style={{
        position: 'absolute', bottom: '0', left: '0', right: '0', height: '120px',
        background: 'linear-gradient(to top, rgba(160,135,75,0.92) 0%, transparent 100%)',
        zIndex: 3, pointerEvents: 'none'
      }}></div>
      <div className="aged-overlay" style={{
        position: 'absolute', inset: '0', background: 'rgba(120,80,20,0.14)',
        zIndex: 4, pointerEvents: 'none'
      }}></div>
      <div className="card-dim" style={{
        position: 'absolute', inset: '0', background: 'rgba(20,10,0,0.38)',
        zIndex: 5, pointerEvents: 'none'
      }}></div>

      {/* Login Card */}
      <div className="login-card" style={{
        position: 'relative',
        zIndex: 6,
        background: 'var(--paper)',
        border: '2px solid var(--rule)',
        boxShadow: '8px 8px 0 rgba(20,10,0,0.55), 0 0 60px rgba(0,0,0,0.45)',
        width: '95%',
        maxWidth: window.innerWidth >= 768 ? '440px' : window.innerWidth >= 480 ? '460px' : '400px'
      }}>
        <div className="card-mast" style={{
          background: 'var(--ink)',
          padding: '1.2rem 1.6rem',
          textAlign: 'center',
          borderBottom: '3px double var(--gold)'
        }}>
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '10px',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            marginBottom: '6px'
          }}>◆ Est. 2026 ◆</div>
          <div style={{
            fontFamily: 'var(--font-masthead)',
            fontSize: window.innerWidth >= 480 ? '38px' : '32px',
            color: 'var(--paper)',
            lineHeight: 1.2
          }}>InstaBrief</div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
            fontSize: '14px',
            color: 'rgba(245,238,216,0.55)'
          }}>The Personalized Intelligencer</div>
        </div>

        <div className="card-body" style={{ padding: window.innerWidth >= 480 ? '1.5rem 1.6rem' : '1.2rem 1.2rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: '700',
            fontSize: '24px',
            color: 'var(--ink)',
            margin: '0 0 6px 0'
          }}>Welcome Back, Reader</h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
            fontSize: '15px',
            color: 'var(--muted)',
            margin: '0 0 2rem 0'
          }}>Sign in to your personalized morning dispatch</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--paper3)' }}></div>
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '10px',
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              color: 'var(--muted)'
            }}>Credentials</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--paper3)' }}></div>
          </div>

          <form onSubmit={handleSubmit} aria-label="Login form">
            {error && <div style={{ color: 'var(--accent)', fontSize: '11px', textAlign: 'center', marginBottom: '1rem', fontStyle: 'italic' }}>{error}</div>}

            <div style={{ marginBottom: '0.85rem' }}>
              <label htmlFor="email" style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '10px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                display: 'block',
                marginBottom: '4px'
              }}>Correspondent's Address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  border: '1px solid var(--paper3)',
                  borderBottom: '2px solid var(--rule)',
                  background: 'var(--paper2)',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '15px',
                  outline: 'none'
                }}
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                onFocus={e => e.target.style.borderBottomColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderBottomColor = 'var(--rule)'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="password" style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '10px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                display: 'block',
                marginBottom: '4px'
              }}>Cipher Key</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••••"
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  border: '1px solid var(--paper3)',
                  borderBottom: '2px solid var(--rule)',
                  background: 'var(--paper2)',
                  color: 'var(--ink)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: '15px',
                  outline: 'none'
                }}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                onFocus={e => e.target.style.borderBottomColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderBottomColor = 'var(--rule)'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
              style={{
                width: '100%',
                padding: '11px 16px',
                background: 'var(--ink)',
                color: 'var(--paper)',
                border: '2px solid var(--ink)',
                fontFamily: 'var(--font-heading)',
                fontWeight: '700',
                fontSize: '14px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s, border-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'var(--accent)';
                e.currentTarget.style.borderColor = 'var(--accent)';
                const arrow = e.currentTarget.querySelector('.arrow');
                if (arrow) arrow.style.right = '10px';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'var(--ink)';
                e.currentTarget.style.borderColor = 'var(--ink)';
                const arrow = e.currentTarget.querySelector('.arrow');
                if (arrow) arrow.style.right = '14px';
              }}
            >
              {loading ? 'Verifying...' : 'Enter the Newsroom'}
              {!loading && (
                <span className="arrow" style={{
                  position: 'absolute',
                  right: '14px',
                  transition: 'right 0.2s'
                }}>→</span>
              )}
            </button>

            <div style={{ marginTop: '1rem', textAlign: 'center', fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: '14px', color: 'var(--muted)' }}>
              No subscription? <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Register as a new reader</Link>
            </div>
          </form>
        </div>

        <div style={{
          borderTop: '1px solid var(--paper3)',
          padding: '6px 1.6rem',
          display: 'flex',
          justifyContent: 'space-between',
          background: 'rgba(237,227,196,0.6)',
          fontFamily: 'var(--font-ui)',
          fontSize: '10px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: 'var(--muted)'
        }}>
          <span>InstaBrief Gazette · Vol. XLII</span>
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
}
