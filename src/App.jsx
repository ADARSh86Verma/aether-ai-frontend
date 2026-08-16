import { Navigate, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home.jsx';
import Welcome from './pages/Welcome/Welcome.jsx';
import Login from './pages/Login/Login.jsx';
import Signup from './pages/Signup/Signup.jsx';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword.jsx';
import Profile from './pages/Profile/Profile.jsx';
import Settings from './pages/Settings/Settings.jsx';
import RequireAuth from './routes/RequireAuth.jsx';
import RedirectIfAuthed from './routes/RedirectIfAuthed.jsx';
import OAuthCallback from './pages/OAuthCallback/OAuthCallback.jsx';
import { useAuth } from './context/AuthContext.jsx';
import LoadingScreen from './components/Common/LoadingScreen.jsx';

function RootRedirect() {
  const { isAuthenticated, initializing } = useAuth();
  if (initializing) return <LoadingScreen label="Loading Aether…" />;
  return <Navigate to={isAuthenticated ? '/chat' : '/welcome'} replace />;
}

// Route guards are kept independent from the page components so the UI can evolve
// without changing the routing contract.
function App() {
  return (
    <>
      <div className="aurora-backdrop" aria-hidden="true" />
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route
          path="/oauth/callback"
          element={<OAuthCallback />}
        />

        <Route
          path="/login"
          element={
            <RedirectIfAuthed>
              <Login />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectIfAuthed>
              <Signup />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <RedirectIfAuthed>
              <ForgotPassword />
            </RedirectIfAuthed>
          }
        />

        <Route
          path="/chat"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/chat/:chatId"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          }
        />

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </>
  );
}

export default App;
