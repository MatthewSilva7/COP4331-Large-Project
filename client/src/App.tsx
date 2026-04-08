import { useState } from "react";
import AuthLayout from "./components/AuthLayout";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ResetPasswordForm from "./components/ResetPasswordForm";
import DashboardPage from "./pages/Dashboard"; 
import { AnimatePresence, motion } from "motion/react";

type AuthState = "login" | "register" | "reset" | "dashboard";

export default function App() {
  // Check if token exists in localStorage to stay logged in
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

  // ROUTING LOGIC: If logged in, skip the AuthLayout
  if (authState === "dashboard") {
    return <DashboardPage onLogout={handleLogout} />;
  }

  const getTitle = () => {
    if (authState === "register") return "Join Study Buddy";
    if (authState === "reset") return "Reset Password";
    return "Welcome Back";
  };

  const getSubtitle = () => {
    if (authState === "register") return "Start your collaborative learning journey today.";
    if (authState === "reset") return "We'll help you get back into your account.";
    return "Your study sessions are waiting for you.";
  };

  return (
    <AuthLayout title={getTitle()} subtitle={getSubtitle()}>
      <AnimatePresence mode="wait">
        {authState === "login" && (
          <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <LoginForm 
              onToggle={() => setAuthState("register")} 
              onForgotPassword={() => setAuthState("reset")}
              onSuccess={handleLoginSuccess}
            />
          </motion.div>
        )}
        {authState === "register" && (
          <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <RegisterForm onToggle={() => setAuthState("login")} />
          </motion.div>
        )}
        {authState === "reset" && (
          <motion.div key="reset" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <ResetPasswordForm onBack={() => setAuthState("login")} />
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}