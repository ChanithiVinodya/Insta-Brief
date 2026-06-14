import { Link } from "react-router-dom";

export default function ArticleCard({ article }) {
  return (
    <div className="card-enter">
      <Link
        to={`/articles/${article.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div
          className="card"
          style={{
            padding: "1.5rem",
            borderLeft: "4px solid var(--accent)",
            display: "flex",
            gap: "1.5rem",
            alignItems: "center",
          }}
        >
          {article.imageUrl && (
            <img
              src={article.imageUrl}
              alt=""
              referrerPolicy="no-referrer"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                border: "1px solid var(--rule)",
                filter: "grayscale(0.3)",
              }}
              className="hidden sm:block"
            />
          )}
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <span
                className="ui-label"
                style={{
                  color: "var(--accent)",
                  fontSize: "12px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                }}
              >
                {article.source} Disptach
              </span>
            </div>
            <h3
              className="heading"
              style={{
                fontSize: "26px",
                fontWeight: "900",
                lineHeight: 1.2,
                marginBottom: "0.75rem",
              }}
            >
              {article.title}
            </h3>
            <p
              className="body-text"
              style={{
                fontSize: "16px",
                fontStyle: "italic",
                marginBottom: "1rem",
                color: "var(--muted)",
                lineHeight: 1.4,
              }}
            >
              {article.summary?.length > 250
                ? article.summary.substring(0, 250) + "..."
                : article.summary}
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {article.tags?.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="ui-label"
                  style={{
                    background: "var(--tag-bg)",
                    color: "var(--tag-fg)",
                    fontSize: "10px",
                    padding: "2px 8px",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
