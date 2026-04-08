import { loginUser } from "../services/authService";
import React, { useState } from "react";
import type { AuthUser } from "../types/auth";

interface LoginFormProps {
  onToggle: () => void;
  onForgotPassword: () => void;
  onSuccess: (user: AuthUser) => void;
}

export default function LoginForm({
  onToggle,
  onForgotPassword,
  onSuccess,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Clear old errors
    
    try {
      const data = await loginUser(email, password);
      
      // Save the token to local storage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onSuccess(data.user);
      
    } catch (err: any) {
      if (err.message === "VERIFICATION_REQUIRED") {
        setError("Please check your email to verify your account before logging in.");
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#1a1a1a] uppercase tracking-wider">
          Email address
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full appearance-none rounded-xl border border-[#e5e5e0] px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#5A5A40] focus:outline-none focus:ring-[#5A5A40] sm:text-sm transition-all"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" title="Password" className="block text-sm font-medium text-[#1a1a1a] uppercase tracking-wider">
          Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full appearance-none rounded-xl border border-[#e5e5e0] px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#5A5A40] focus:outline-none focus:ring-[#5A5A40] sm:text-sm transition-all"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-[#5A5A40] focus:ring-[#5A5A40]"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <button
            type="button"
            onClick={onForgotPassword}
            className="font-medium text-[#5A5A40] hover:text-[#4a4a34] underline underline-offset-4"
          >
            Forgot your password?
          </button>
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="flex w-full justify-center rounded-full border border-transparent bg-[#5A5A40] py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#4a4a34] focus:outline-none focus:ring-2 focus:ring-[#5A5A40] focus:ring-offset-2 transition-all transform active:scale-95"
        >
          Sign in
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onToggle}
            className="font-medium text-[#5A5A40] hover:text-[#4a4a34] underline underline-offset-4"
          >
            Register here
          </button>
        </p>
      </div>
    </form>
  );
}
