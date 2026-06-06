import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { articleApi, interactionApi } from '../api/client.js';
import Spinner from '../components/Spinner.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';

export default function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    articleApi
      .getById(id)
      .then((res) => {
        setArticle(res.data);
        interactionApi.record(id, 'view').catch(() => {});
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load article'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!article) return <ErrorAlert message={error || 'Article not found'} />;

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-brand hover:underline mb-4 inline-block">
        &larr; Back to feed
      </Link>
      <ErrorAlert message={error} />
      <p className="text-xs font-medium text-brand uppercase tracking-wide">{article.source}</p>
      <h1 className="font-display text-3xl font-bold text-ink mt-2 mb-4">{article.title}</h1>

      {article.imageUrl && (
        <img src={article.imageUrl} alt="" className="w-full rounded-2xl mb-6 object-cover max-h-80" />
      )}

      {article.summary && (
        <div className="card mb-6 border-l-4 border-l-brand">
          <h2 className="font-display font-semibold text-brand mb-2">AI Summary</h2>
          <p className="text-ink leading-relaxed">{article.summary}</p>
        </div>
      )}

      {article.keywords?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {article.keywords.map((kw) => (
            <span key={kw} className="text-xs px-3 py-1 rounded-full bg-brand/10 text-brand capitalize">
              {kw}
            </span>
          ))}
        </div>
      )}

      {article.content && (
        <div className="prose prose-sm max-w-none text-muted leading-relaxed whitespace-pre-wrap">
          {article.content}
        </div>
      )}

      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary inline-block mt-8"
      >
        Read original source
      </a>
    </article>
  );
}
