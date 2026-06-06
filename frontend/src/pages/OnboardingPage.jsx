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
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-ink mb-2">What interests you?</h1>
      <p className="text-muted mb-8">
        Pick topics to personalize your feed. Select at least three.
      </p>
      <ErrorAlert message={error} />
      <InterestPicker selected={selected} onChange={setSelected} />
      <p className="text-sm text-muted mt-4">{selected.length} selected</p>
      <button
        type="button"
        onClick={handleContinue}
        disabled={loading || selected.length < 3}
        className="btn-primary mt-8"
      >
        {loading ? 'Saving...' : 'Continue to feed'}
      </button>
    </div>
  );
}
