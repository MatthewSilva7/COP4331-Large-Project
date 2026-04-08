import { loginUser } from "../services/authService";
import React, { useState } from "react";

interface LoginFormProps {
  onToggle: () => void;
  onForgotPassword: () => void;
  onSuccess: () => void; // Added for App.tsx routing
}

export default function LoginForm({ onToggle, onForgotPassword, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); 
    
    try {
      const data = await loginUser(email, password);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
  
      // Trigger the App.tsx to switch to Dashboard
      onSuccess(); 
      
    } catch (err: any) {
      if (err.message === "VERIFICATION_REQUIRED") {
        setError("Please verify your email before logging in.");
      } else {
        setError(err.message || "Invalid credentials");
      }
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-[#1a1a1a] uppercase tracking-wider">Email address</label>
        <input
          type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-xl border border-[#e5e5e0] px-3 py-2 shadow-sm focus:border-[#5A5A40] focus:ring-[#5A5A40] sm:text-sm transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1a1a1a] uppercase tracking-wider">Password</label>
        <input
          type="password" required value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-xl border border-[#e5e5e0] px-3 py-2 shadow-sm focus:border-[#5A5A40] focus:ring-[#5A5A40] sm:text-sm transition-all"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <button type="button" onClick={onForgotPassword} className="font-medium text-[#5A5A40] hover:text-[#4a4a34] underline underline-offset-4">
            Forgot your password?
          </button>
        </div>
      </div>

      <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#5A5A40] hover:bg-[#4a4a34] focus:outline-none transition-all transform active:scale-95">
        Sign in
      </button>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <button type="button" onClick={onToggle} className="font-medium text-[#5A5A40] hover:text-[#4a4a34] underline underline-offset-4">
            Register here
          </button>
        </p>
      </div>
    </form>
  );
}