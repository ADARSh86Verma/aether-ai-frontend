import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingScreen from '../components/Common/LoadingScreen.jsx';

/**
 * Wrap Login/Signup/ForgotPassword with this so a signed-in user is sent
 * straight to the chat instead of seeing the auth forms again.
 */
export default function RedirectIfAuthed({ children }) {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) return <LoadingScreen label="Loading Aether…" />;
  if (isAuthenticated) return <Navigate to="/chat" replace />;
  return children;
}
