import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import LoadingScreen from "../../components/Common/LoadingScreen.jsx";

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { completeOAuthLogin } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const token = params.get("token");
      const code = params.get("code");
      const state = params.get("state");
      const provider = params.get("provider");

      // Provider first returns to the HTTPS frontend callback.
      // Forward the authorization code to FastAPI through Vite's /api proxy.
      if (!token && code && state && provider) {
        window.location.replace(
          `/api/auth/callback?${new URLSearchParams({
            provider,
            code,
            state,
          }).toString()}`
        );
        return;
      }

      if (!token) {
        if (!cancelled) setError("OAuth login did not return a token.");
        return;
      }

      try {
        await completeOAuthLogin(token);
        if (!cancelled) navigate("/chat", { replace: true });
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
            err.message ||
            "Could not complete OAuth login."
          );
        }
      }
    }

    finish();

    return () => {
      cancelled = true;
    };
  }, [params, completeOAuthLogin, navigate]);

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div>
          <h2>Login failed</h2>
          <p>{error}</p>
          <button type="button" onClick={() => navigate("/login")}>
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return <LoadingScreen label="Completing secure login…" />;
}
