import { useState } from "react";
import AuthLayout from "./components/AuthLayout";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ResetPasswordForm from "./components/ResetPasswordForm";
import DashboardPage from "./pages/DashboardPage"; 
import { AnimatePresence, motion } from "motion/react";
import { hydrateUserProfile } from "./services/authService";

type AuthState = "login" | "register" | "reset" | "dashboard" | "profile";

export default function App() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    return localStorage.getItem("token") ? "dashboard" : "login";
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthState("login");
  };

  const handleLoginSuccess = () => {
    setAuthState("dashboard");
  };

  if (authState === "dashboard") {
    // We hydrate the user profile to ensure major/courses are included
    const rawUser = JSON.parse(localStorage.getItem('user') || '{}');
    const user = hydrateUserProfile(rawUser);

    return (
      <DashboardPage 
        user={user} 
        onLogout={handleLogout}
        onOpenProfile={() => setAuthState("profile")}
      />
    );
  }

  // Handle simple routing for the profile page if needed
  if (authState === "profile") {
    return <div className="p-10 text-center">Profile Page Placeholder - <button onClick={() => setAuthState("dashboard")} className="underline">Back</button></div>;
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
      </AnimatePresence>
    </AuthLayout>
  );
}
