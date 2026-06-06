import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header-bar sticky top-0 z-50 border-b border-brand/10 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white font-display font-bold text-lg shadow-md">
            IB
          </span>
          <span className="font-display font-bold text-xl text-ink group-hover:text-brand transition-colors">
            InstaBrief
          </span>
        </Link>

        {user && (
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-muted">
            <Link to="/" className="hover:text-brand transition-colors">Feed</Link>
            <Link to="/trending" className="hover:text-brand transition-colors">Trending</Link>
          </nav>
        )}

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <>
              <span className="hidden md:inline text-sm text-muted">{user.displayName}</span>
              <button type="button" onClick={handleLogout} className="text-sm text-terracotta hover:underline">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="text-sm font-medium text-brand hover:underline">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
