import React, { useState } from 'react';
import { loginUser } from '../services/authService';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); // Clear previous errors

    try {
      const data = await loginUser(email, password);
      
      // Store credentials
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect - You might need to call a function from props here
      // like onSuccess() to tell App.tsx to switch to the dashboard
      window.location.reload(); 
      
    } catch (err: any) {
      // This catches the "Invalid credentials" error from your authService
      setError(err.message || "We couldn't find an account with that email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[400px] flex-col justify-center">
      <div className="mx-auto w-full max-w-sm rounded-[2rem] border border-[#e6dfd0] bg-white p-8 shadow-xl">
        <h2 className="text-center font-serif text-3xl font-semibold text-[#201c15] mb-6">Login</h2>

        {/* ERROR MESSAGE BOX */}
        {error && (
          <div className="mb-6 rounded-xl border border-[#ebd2cc] bg-[#fff5f2] px-4 py-3 text-sm text-[#8a3d2f] animate-in fade-in slide-in-from-top-1">
            <p className="font-bold mb-1">Login Failed</p>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#6d654f] mb-1">Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com"
              className="w-full rounded-xl border border-[#ddd4c3] bg-[#fcfaf4] px-4 py-3 text-sm text-[#201c15] outline-none focus:border-[#5A5A40] transition-colors"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6d654f] mb-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#ddd4c3] bg-[#fcfaf4] px-4 py-3 text-sm text-[#201c15] outline-none focus:border-[#5A5A40] transition-colors"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full rounded-full bg-[#3d5a40] py-4 text-sm font-bold text-white shadow-md transition hover:bg-[#314934] disabled:opacity-50 active:scale-95"
          >
            {isLoading ? "Checking credentials..." : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-[#7d765f] uppercase tracking-widest">
          Study Buddy v1.0
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
