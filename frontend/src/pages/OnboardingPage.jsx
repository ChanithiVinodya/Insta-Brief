import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import InterestPicker from '../components/InterestPicker.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';

export default function OnboardingPage() {
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (selected.length < 3) {
      setError('Please select at least 3 interests');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await userApi.setInterests(selected);
      await userApi.completeOnboarding();
      setUser((u) => (u ? { ...u, onboardingCompleted: true } : u));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save interests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 2rem' }}>
      <div style={{ maxWidth: '800px' }}>
        <h1 className="heading" style={{ fontSize: '48px', fontWeight: '900', color: 'var(--ink)', marginBottom: '1rem' }}>Define Your Intelligence Profile</h1>
        <p className="body-text" style={{ fontSize: '20px', color: 'var(--muted)', marginBottom: '3rem', fontStyle: 'italic' }}>
          Select the frequency bands you wish to monitor. Choose at least three categories to begin your briefing.
        </p>
        <ErrorAlert message={error} />
        <div style={{ background: 'var(--paper2)', padding: '2.5rem', border: '1px solid var(--paper3)', marginBottom: '2rem' }}>
          <InterestPicker selected={selected} onChange={setSelected} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p className="ui-label" style={{ fontSize: '14px', color: 'var(--muted)' }}>{selected.length} Topics Selected</p>
          <button
            type="button"
            onClick={handleContinue}
            disabled={loading || selected.length < 3}
            className="btn-ghost"
            style={{ 
              padding: '12px 32px', 
              fontSize: '14px', 
              background: loading || selected.length < 3 ? 'transparent' : 'var(--ink)',
              color: loading || selected.length < 3 ? 'var(--gold)' : 'var(--paper)',
              opacity: loading || selected.length < 3 ? 0.5 : 1
            }}
          >
            {loading ? 'CALIBRATING...' : 'COMMENCE BRIEFING →'}
          </button>
        </div>
      </div>
    </div>
  );
}
