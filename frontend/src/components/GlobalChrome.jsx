import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { trendingApi } from '../api/client';

export const NewsTicker = () => {
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    trendingApi.getTopics().then(res => setTrends(res.data.data)).catch(() => {});
  }, []);

  return (
    <div className="ticker-wrap">
      <div className="ticker">
        {trends.length > 0 ? (
          trends.map((t, i) => (
            <span key={i} className="ticker-item">
              {t.topic} {t.score.toFixed(1)} ◆
            </span>
          ))
        ) : (
          <span className="ticker-item">
            MARKET STEADY ◆ NEW DISPATCHES PENDING ◆ INTELLIGENCE FLOWING ◆
          </span>
        )}
        {/* Repeat for seamless loop */}
        {trends.map((t, i) => (
          <span key={`dup-${i}`} className="ticker-item">
            {t.topic} {t.score.toFixed(1)} ◆
          </span>
        ))}
      </div>
    </div>
  );
};

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: 'var(--ink)',
      borderBottom: '3px double var(--gold)',
      padding: '0.75rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'var(--accent)',
          border: '2px solid var(--gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--gold)',
          fontWeight: '900',
          fontSize: '18px',
          fontFamily: 'var(--font-heading)'
        }}>
          IB
        </div>
        <span className="masthead" style={{ color: 'var(--paper)', fontSize: '24px' }}>InstaBrief</span>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <Link to="/" style={{
          textDecoration: 'none',
          color: isActive('/') ? 'var(--gold)' : 'var(--paper)',
          fontSize: '18px',
          textTransform: 'uppercase',
          letterSpacing: '2.0px',
          fontFamily: 'var(--font-ui)',
          fontWeight: '900'
        }}>Feed</Link>
        <Link to="/trending" style={{
          textDecoration: 'none',
          color: isActive('/trending') ? 'var(--gold)' : 'var(--paper)',
          fontSize: '18px',
          textTransform: 'uppercase',
          letterSpacing: '2.0px',
          fontFamily: 'var(--font-ui)',
          fontWeight: '900'
        }}>Trending</Link>
        <Link to="/profile" style={{
          textDecoration: 'none',
          color: isActive('/profile') ? 'var(--gold)' : 'var(--paper)',
          fontSize: '18px',
          textTransform: 'uppercase',
          letterSpacing: '2.0px',
          fontFamily: 'var(--font-ui)',
          fontWeight: '900'
        }}>Profile</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {user ? (
          <>
            <span style={{ color: 'var(--paper)', fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: '14px' }}>
              <Link to="/profile" style={{ color: 'inherit', textDecoration: 'none' }}>
                {user.displayName || user.username}
              </Link>
            </span>
            <button className="btn-ghost" onClick={() => { logout(); navigate('/login'); }}>Sign Out</button>
          </>
        ) : (
          <Link to="/login" className="btn-ghost">Sign In</Link>
        )}
      </div>
    </nav>
  );
};

export const DatelineBar = () => {
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }).toUpperCase();

  return (
    <div style={{
      background: 'var(--paper2)',
      borderBottom: '2px solid var(--ink)',
      padding: '4px 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: 'var(--font-ui)',
      fontSize: '10px',
      letterSpacing: '1.5px',
      textTransform: 'uppercase'
    }}>
      <div>INSTABRIEF GAZETTE ◆ {date} ◆ VOL. I</div>
      <div>Personalized by your reading signals</div>
    </div>
  );
};
