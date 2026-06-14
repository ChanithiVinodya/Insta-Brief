import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import InterestPicker from '../components/InterestPicker.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';

export default function ProfilePage() {
  const { user } = useAuth();
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    userApi.getInterests()
      .then((res) => setSelected(res.data.interests || []))
      .catch(() => setError('Failed to load your preferences'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (selected.length < 3) {
      setError('Please select at least 3 topics');
      return;
    }
    setError('');
    setSaved(false);
    setSaving(true);
    try {
      await userApi.setInterests(selected);
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="screen active" style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <div className="heading" style={{ fontSize: '24px', fontStyle: 'italic' }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '5rem 2rem' }}>
      <div style={{ maxWidth: '800px' }}>
        <div style={{ fontSize: '12px', letterSpacing: '6px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '1rem', fontWeight: '700' }}>
          ◈ Reader Profile ◈
        </div>
        <h1 className="heading" style={{ fontSize: '48px', fontWeight: '900', color: 'var(--ink)', marginBottom: '0.5rem' }}>
          {user?.displayName || 'Your Profile'}
        </h1>
        <p className="body-text" style={{ fontSize: '18px', color: 'var(--muted)', marginBottom: '3rem', fontStyle: 'italic' }}>
          Update the topics you follow. These appear as filters on your feed.
        </p>

        <ErrorAlert message={error} />
        {saved && (
          <p className="body-text" style={{ color: 'var(--accent)', fontStyle: 'italic', marginBottom: '1rem' }}>
            Preferences saved. Your feed filters have been updated.
          </p>
        )}

        <div style={{ background: 'var(--paper2)', padding: '2.5rem', border: '1px solid var(--paper3)', marginBottom: '2rem' }}>
          <h2 className="heading" style={{ fontSize: '24px', marginBottom: '1.5rem' }}>Topic Preferences</h2>
          <InterestPicker selected={selected} onChange={setSelected} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <p className="ui-label" style={{ fontSize: '14px', color: 'var(--muted)' }}>{selected.length} topics selected</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/" className="btn-vintage" style={{ fontSize: '10px', textDecoration: 'none' }}>
              ← Back to Feed
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || selected.length < 3}
              className="btn-ghost"
              style={{
                padding: '12px 32px',
                fontSize: '14px',
                background: saving || selected.length < 3 ? 'transparent' : 'var(--ink)',
                color: saving || selected.length < 3 ? 'var(--gold)' : 'var(--paper)',
                opacity: saving || selected.length < 3 ? 0.5 : 1,
              }}
            >
              {saving ? 'SAVING...' : 'SAVE PREFERENCES'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
