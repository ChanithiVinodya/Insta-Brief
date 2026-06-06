import { useEffect, useState } from 'react';
import { trendingApi } from '../api/client.js';
import Spinner from '../components/Spinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';

export default function TrendingPage() {
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trendingApi
      .getTopics()
      .then((res) => setTopics(res.data.data))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load trending'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink mb-1">Trending topics</h1>
      <p className="text-muted text-sm mb-6">Keywords gaining momentum across recent articles</p>
      <ErrorAlert message={error} />

      {topics.length === 0 && !error && (
        <div className="card text-center text-muted py-12">
          No trending topics yet. Check back after the AI service processes articles.
        </div>
      )}

      <div className="space-y-3">
        {topics.map((topic, index) => (
          <div key={topic.id} className="card flex items-center gap-4">
            <span className="font-display text-2xl font-bold text-brand/40 w-8">
              {index + 1}
            </span>
            <div className="flex-1">
              <h2 className="font-display font-semibold text-lg capitalize text-ink">{topic.topic}</h2>
              <p className="text-sm text-muted">
                {topic.articleCount} articles · score {topic.score.toFixed(1)}
              </p>
            </div>
            <div
              className="h-2 rounded-full bg-brand/20 flex-1 max-w-[120px] hidden sm:block"
              style={{ width: `${Math.min(100, topic.score * 5)}%`, maxWidth: 120 }}
            >
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${Math.min(100, topic.score * 10)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
