import React, { useState } from 'react';
import { loginUser } from '../services/authService';

interface LoginFormProps {
  onToggle: () => void;
  onForgotPassword: () => void;
  onSuccess: () => void;
}

export default function LoginForm({ onToggle, onForgotPassword, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log(">>> [DEBUG] LoginForm submitting...");

    try {
      const data = await loginUser(email, password);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      onSuccess(); // Tell App.tsx to switch to Dashboard
      
    } catch (err: any) {
      console.error(">>> [DEBUG] Login Error caught:", err);
      // This is what was missing!
      setError(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ERROR BOX - This will now finally show up */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-pulse">
          <p className="font-bold">Login Error</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
            Email Address
          </label>
          <input 
            type="email" 
            required
            className="w-full rounded-xl border border-gray-200 bg-[#f3f7ff] px-4 py-3 text-sm outline-none focus:border-[#5A5A40]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
            Password
          </label>
          <input 
            type="password" 
            required
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#5A5A40]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-gray-500">
            <input type="checkbox" className="rounded border-gray-300" />
            Remember me
          </label>
          <button type="button" onClick={onForgotPassword} className="text-xs text-gray-500 underline">
            Forgot your password?
          </button>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full rounded-full bg-[#5a5a40] py-4 text-sm font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-center text-xs text-gray-500">
        Don't have an account? <button onClick={onToggle} className="underline">Register here</button>
      </p>
    </div>
  );
}
