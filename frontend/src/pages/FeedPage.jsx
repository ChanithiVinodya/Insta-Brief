import { useEffect, useState } from 'react';
import { feedApi } from '../api/client.js';
import ArticleCard from '../components/ArticleCard.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';

export default function FeedPage() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    feedApi
      .getFeed(page)
      .then((res) => {
        setArticles(res.data.data);
        setPagination(res.data.pagination);
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load feed'))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink mb-1">Your feed</h1>
      <p className="text-muted text-sm mb-6">Personalized by your interests and trending signals</p>
      <ErrorAlert message={error} />

      {articles.length === 0 && !error && (
        <div className="card text-center text-muted py-12">
          <p>No articles yet. The AI service is ingesting news — check back shortly.</p>
        </div>
      )}

      <div className="space-y-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-8">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-secondary disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-muted self-center text-sm">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-secondary disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
