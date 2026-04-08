import { useEffect, useState } from "react";
import AuthLayout from "./components/AuthLayout";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ResetPasswordForm from "./components/ResetPasswordForm";
import DashboardPage from "./pages/DashboardPage";
import { AnimatePresence, motion } from "motion/react";
import type { AuthUser } from "./types/auth";

type AuthState = "login" | "register" | "reset";

export default function App() {
  const [authState, setAuthState] = useState<AuthState>("login");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (!storedUser || !storedToken) {
      return;
    }

    try {
      setCurrentUser(JSON.parse(storedUser) as AuthUser);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, []);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setCurrentUser(null);
    setAuthState("login");
  };

  if (currentUser) {
    return <DashboardPage user={currentUser} onLogout={handleLogout} />;
  }

  const getTitle = () => {
    switch (authState) {
      case "login": return "Welcome Back";
      case "register": return "Join Study Buddy";
      case "reset": return "Reset Password";
    }
  };

  const getSubtitle = () => {
    switch (authState) {
      case "login": return "Your study sessions are waiting for you.";
      case "register": return "Start your collaborative learning journey today.";
      case "reset": return "We'll help you get back into your account.";
    }
  };

  return (
    <AuthLayout title={getTitle()} subtitle={getSubtitle()}>
      <AnimatePresence mode="wait">
        {authState === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <LoginForm 
              onToggle={() => setAuthState("register")} 
              onForgotPassword={() => setAuthState("reset")}
              onSuccess={handleLoginSuccess}
            />
          </motion.div>
        )}
        {authState === "register" && (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <RegisterForm onToggle={() => setAuthState("login")} />
          </motion.div>
        )}
        {authState === "reset" && (
          <motion.div
            key="reset"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <ResetPasswordForm onBack={() => setAuthState("login")} />
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}

