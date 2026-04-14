import { useState } from "react";
import AuthLayout from "./components/AuthLayout";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ResetPasswordForm from "./components/ResetPasswordForm";
import DashboardPage from "./pages/DashboardPage"; 
import ProfilePage from "./pages/ProfilePage"; 
import { AnimatePresence, motion } from "motion/react";
import { hydrateUserProfile, persistUserProfile } from "./services/authService";
import type { AuthUser } from "./types/auth";

type AuthState = "login" | "register" | "reset" | "dashboard" | "profile";

export default function App() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    return localStorage.getItem("token") ? "dashboard" : "login";
  });

  // This state allows the UI to update immediately when you "save" the profile locally
  const [localUser, setLocalUser] = useState<AuthUser | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLocalUser(null);
    setAuthState("login");
  };

  const handleLoginSuccess = () => {
    setAuthState("dashboard");
  };

  const handleSaveProfile = (updatedUser: AuthUser) => {
    // For now, we just save it to local state and localStorage
    // This bypasses the backend but keeps the UI "synced" for your demo
    setLocalUser(updatedUser);
    persistUserProfile(updatedUser);
    console.log("Profile saved locally:", updatedUser);
  };

  // Get the most up-to-date user data
  const getCurrentUser = (): AuthUser => {
    if (localUser) return localUser;
    const rawUser = JSON.parse(localStorage.getItem('user') || '{}');
    return hydrateUserProfile(rawUser);
  };

  // DASHBOARD VIEW
  if (authState === "dashboard") {
    return (
      <DashboardPage 
        user={getCurrentUser()} 
        onLogout={handleLogout}
        onOpenProfile={() => setAuthState("profile")}
      />
    );
  }

  // PROFILE VIEW
  if (authState === "profile") {
    return (
      <ProfilePage 
        user={getCurrentUser()}
        onBack={() => setAuthState("dashboard")}
        onLogout={handleLogout}
        onSaveProfile={handleSaveProfile}
      />
    );
  }

  return (
    <AuthLayout title={authState === "register" ? "Join Study Buddy" : "Welcome Back"} subtitle="Your study sessions are waiting.">
      <AnimatePresence mode="wait">
        {authState === "login" && (
          <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <LoginForm 
              onToggle={() => setAuthState("register")} 
              onForgotPassword={() => setAuthState("reset")}
              onSuccess={handleLoginSuccess}
            />
          </motion.div>
        )}
        {authState === "register" && (
          <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <RegisterForm onToggle={() => setAuthState("login")} />
          </motion.div>
        )}
        {authState === "reset" && (
          <motion.div key="reset" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <ResetPasswordForm onBack={() => setAuthState("login")} />
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
