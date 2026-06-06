import { Link } from 'react-router-dom';

export default function ArticleCard({ article }) {
  return (
    <Link to={`/articles/${article.id}`} className="card block hover:border-brand/40 transition-all group">
      <div className="flex gap-4">
        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt=""
            className="w-24 h-24 object-cover rounded-xl flex-shrink-0 hidden sm:block"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-brand uppercase tracking-wide mb-1">{article.source}</p>
          <h2 className="font-display font-semibold text-lg text-ink group-hover:text-brand transition-colors line-clamp-2">
            {article.title}
          </h2>
          {article.summary && (
            <p className="text-muted text-sm mt-2 line-clamp-3">{article.summary}</p>
          )}
          {article.keywords?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {article.keywords.slice(0, 4).map((kw) => (
                <span key={kw} className="text-xs px-2 py-0.5 rounded-full bg-brand/10 text-brand">
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
