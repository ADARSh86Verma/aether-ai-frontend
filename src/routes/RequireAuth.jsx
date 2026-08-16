import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingScreen from '../components/Common/LoadingScreen.jsx';

/**
 * Wrap protected routes with this. Dummy auth only — no backend session
 * check, just the local AuthContext state restored from localStorage.
 */
export default function RequireAuth({ children }) {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) return <LoadingScreen label="Loading Aether…" />;
  if (!isAuthenticated) return <Navigate to="/welcome" replace />;
  return children;
}
