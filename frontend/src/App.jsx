import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { NewsTicker, Navbar, DatelineBar } from './components/GlobalChrome.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import FeedPage from './pages/FeedPage.jsx';
import ArticlePage from './pages/ArticlePage.jsx';
import TrendingPage from './pages/TrendingPage.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <NewsTicker />
          <Navbar />
          <DatelineBar />
          <main>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute requireOnboarding>
                    <FeedPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/articles/:id"
                element={
                  <ProtectedRoute requireOnboarding>
                    <ArticlePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trending"
                element={
                  <ProtectedRoute requireOnboarding>
                    <TrendingPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
