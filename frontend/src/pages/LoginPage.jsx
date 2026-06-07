import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(formData);
      login(res.data.data.user, res.data.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="screen-login" className="screen active" style={{
      minHeight: 'calc(100vh - 120px)',
      background: 'var(--paper3)',
      backgroundImage: `
        repeating-linear-gradient(var(--ink) 0 1px, transparent 1px 40px),
        repeating-linear-gradient(90deg, var(--ink) 0 1px, transparent 1px 80px)
      `,
      backgroundSize: '80px 40px',
      opacity: 0.1, /* Combined with background-color to make it faint */
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      {/* Real container with full opacity */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div className="card" style={{
          maxWidth: '420px',
          width: '100%',
          background: 'var(--paper)',
          border: '2px solid var(--rule)',
          boxShadow: '7px 7px 0 var(--rule)',
          padding: 0,
          borderRadius: 0,
          cursor: 'default'
        }}>
          <div style={{
            background: 'var(--ink)',
            padding: '1.5rem',
            textAlign: 'center',
            borderBottom: '3px double var(--gold)'
          }}>
            <div style={{ color: 'var(--gold)', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
              ◆ Est. 2024 ◆
            </div>
            <div className="masthead" style={{ color: 'var(--paper)', fontSize: '32px' }}>InstaBrief</div>
            <div style={{ color: 'var(--paper3)', fontStyle: 'italic', fontSize: '13px', fontFamily: 'var(--font-body)' }}>
              Dispatching clarity to the modern mind.
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
            <h2 className="heading" style={{ fontSize: '21px', fontWeight: '700', marginBottom: '4px' }}>Welcome Back, Reader</h2>
            <p style={{ fontStyle: 'italic', fontSize: '14px', color: 'var(--muted)', marginBottom: '1.5rem' }}>
              Kindle your curiosity with the latest dispatches.
            </p>

            <div style={{ borderBottom: '1px solid var(--rule)', marginBottom: '1.5rem', position: 'relative' }}>
              <span style={{ 
                position: 'absolute', 
                top: '-10px', 
                left: '20px', 
                background: 'var(--paper)', 
                padding: '0 8px',
                fontSize: '9px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'var(--muted)'
              }}>Credentials</span>
            </div>

            {error && <div style={{ color: 'var(--accent)', fontSize: '12px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '4px', color: 'var(--ink)' }}>Username</label>
              <input
                className="ui-label"
                type="text"
                required
                style={{
                  width: '100%',
                  background: 'var(--paper2)',
                  border: 'none',
                  borderBottom: '2px solid var(--rule)',
                  padding: '8px 4px',
                  outline: 'none',
                  fontSize: '14px'
                }}
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '4px', color: 'var(--ink)' }}>Password</label>
              <input
                className="ui-label"
                type="password"
                required
                style={{
                  width: '100%',
                  background: 'var(--paper2)',
                  border: 'none',
                  borderBottom: '2px solid var(--rule)',
                  padding: '8px 4px',
                  outline: 'none',
                  fontSize: '14px'
                }}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              className="heading"
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'var(--ink)',
                color: 'var(--paper)',
                padding: '12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                position: 'relative',
                transition: '0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--accent)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--ink)'}
            >
              Enter the Archive
              <span style={{ position: 'absolute', right: '20px' }}>→</span>
            </button>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '13px' }}>
              <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                No subscription? Register as a new reader
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
