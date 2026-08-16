import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginRequest,
  signupRequest,
  getCurrentUser,
  updateProfileRequest,
  changePasswordRequest,
  deleteAccountRequest,
  requestPasswordReset as requestResetApi,
  verifyPasswordReset,
  confirmPasswordReset,
  uploadProfileAvatarRequest,
} from "../services/authService.js";

import {
  saveAuthToken,
  clearAuthToken,
  getAuthToken,
} from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [pendingVerification, setPendingVerification] = useState(null);
  const [resetFlow, setResetFlow] = useState(null);

  const applyAuth = useCallback((data, remember = true) => {
    if (!data?.token || !data?.user) {
      throw new Error("Invalid authentication response.");
    }

    saveAuthToken(data.token, remember);
    setUser(data.user);
    setIsAuthenticated(true);
    return data.user;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function restore() {
      const token = getAuthToken();

      if (!token) {
        if (mounted) setInitializing(false);
        return;
      }

      try {
        const data = await getCurrentUser();
        if (mounted) {
          setUser(data.user);
          setIsAuthenticated(true);
        }
      } catch {
        clearAuthToken();
        if (mounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) setInitializing(false);
      }
    }

    restore();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(
    async ({ identifier, password, rememberMe }) => {
      const data = await loginRequest({
        identifier,
        password,
        rememberMe,
      });
      return applyAuth(data, !!rememberMe);
    },
    [applyAuth]
  );

  const loginWithProvider = useCallback(async (provider) => {
    const allowed = ["google", "github", "microsoft"];

    if (!allowed.includes(provider)) {
      throw new Error("Unsupported login provider.");
    }

    // OAuth requires a full browser redirect.
    window.location.href = `/api/auth/${provider}/login`;
    return null;
  }, []);

  const completeOAuthLogin = useCallback(
    async (token) => {
      if (!token) throw new Error("Missing OAuth token.");

      saveAuthToken(token, true);

      try {
        const data = await getCurrentUser();
        setUser(data.user);
        setIsAuthenticated(true);
        return data.user;
      } catch (error) {
        clearAuthToken();
        setUser(null);
        setIsAuthenticated(false);
        throw error;
      }
    },
    []
  );

  const signup = useCallback(
    async ({ fullName, username, email, password }) => {
      const data = await signupRequest({
        fullName,
        username,
        email,
        password,
      });

      const nextUser = applyAuth(data, true);
      setPendingVerification(null);
      return nextUser;
    },
    [applyAuth]
  );

  // Kept for compatibility with the existing Signup UI.
  const verifyEmail = useCallback(async () => {
    setPendingVerification(null);
    return user;
  }, [user]);

  const resendVerification = useCallback(async () => true, []);

  const requestPasswordReset = useCallback(async (email) => {
    const data = await requestResetApi(email);
    setResetFlow({
      email,
      verified: false,
      devCode: data.dev_code || null,
    });
    return data;
  }, []);

  const verifyResetCode = useCallback(
    async (code) => {
      if (!resetFlow?.email) {
        throw new Error("Password reset session expired.");
      }

      await verifyPasswordReset(
        resetFlow.email,
        code
      );

      setResetFlow((prev) =>
        prev
          ? {
              ...prev,
              code,
              verified: true,
            }
          : prev
      );

      return true;
    },
    [resetFlow]
  );

  const resetPassword = useCallback(
    async (newPassword) => {
      if (!resetFlow?.email || !resetFlow?.code) {
        throw new Error("Password reset session expired.");
      }

      await confirmPasswordReset(
        resetFlow.email,
        resetFlow.code,
        newPassword
      );

      setResetFlow((prev) =>
        prev
          ? {
              ...prev,
              done: true,
            }
          : prev
      );

      return true;
    },
    [resetFlow]
  );

  const clearResetFlow = useCallback(
    () => setResetFlow(null),
    []
  );

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
    setIsAuthenticated(false);
    setPendingVerification(null);
    setResetFlow(null);
  }, []);

  const updateUser = useCallback(async (patch) => {
    const current = user || {};
    const next =
      typeof patch === "function"
        ? patch(current)
        : patch;

    const data = await updateProfileRequest({
      fullName: next.fullName,
      username: next.username,
    });

    setUser(data.user);
    return data.user;
  }, [user]);

  const uploadAvatar = useCallback(async (file) => {
    const data = await uploadProfileAvatarRequest(file);
    setUser(data.user);
    return data.user;
  }, []);

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      await changePasswordRequest(
        currentPassword,
        newPassword
      );
      return true;
    },
    []
  );

  const deleteAccount = useCallback(async () => {
    await deleteAccountRequest();
    logout();
    return true;
  }, [logout]);

  const value = {
    user,
    isAuthenticated,
    initializing,
    pendingVerification,
    resetFlow,

    login,
    loginWithProvider,
    completeOAuthLogin,

    signup,
    verifyEmail,
    resendVerification,

    requestPasswordReset,
    verifyResetCode,
    resetPassword,
    clearResetFlow,

    logout,
    updateUser,
    changePassword,
    uploadAvatar,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return ctx;
}
