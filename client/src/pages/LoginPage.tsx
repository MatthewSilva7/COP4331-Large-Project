import React, { useState } from 'react';
import { loginUser } from '../services/authService';

const LoginPage: React.FC = () => {
  const [email, setInputEmail] = useState('');
  const [password, setInputPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(">>> [DEBUG] Submit Clicked. Email:", email);
    
    setError('');
    setIsLoading(true);

    try {
      console.log(">>> [DEBUG] Calling loginUser service...");
      const data = await loginUser(email, password);
      
      console.log(">>> [DEBUG] Success! Received data:", data);
      
      // Save credentials for the App to find
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Force a hard refresh to the dashboard
      window.location.href = "/"; 
      
    } catch (err: any) {
      console.error(">>> [DEBUG] Catch block reached. Error:", err);
      
      // THE SMOKING GUN: If this alert doesn't show up, 
      // your frontend isn't seeing the backend error at all.
      window.alert("FRONTEND DETECTED ERROR: " + (err.message || "Unknown Error"));
      
      setError(err.message || "Incorrect email or password.");
    } finally {
      setIsLoading(false);
      console.log(">>> [DEBUG] Request finished (Finally block).");
    }
  };

  return (
    <div className="flex min-h-[400px] flex-col justify-center bg-[#f9f7f2] px-4 py-12">
      <div className="mx-auto w-full max-w-sm rounded-[2rem] border border-[#e6dfd0] bg-white p-8 shadow-2xl">
        <h2 className="text-center font-serif text-3xl font-semibold text-[#201c15] mb-8">Login</h2>

        {/* PROMINENT ERROR BOX */}
        {error && (
          <div className="mb-6 rounded-2xl border border-[#ebd2cc] bg-[#fff5f2] p-4 text-sm text-[#8a3d2f] animate-bounce">
            <p className="font-bold flex items-center gap-2">
              <span>⚠️</span> Login Failed
            </p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#7d765f] mb-2 ml-1">Email Address</label>
            <input 
              type="email" 
              placeholder="e.g. bob@knights.ucf.edu"
              className="w-full rounded-2xl border border-[#ddd4c3] bg-[#fcfaf4] px-4 py-3.5 text-sm text-[#201c15] outline-none focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] transition-all"
              value={email} 
              onChange={(e) => setInputEmail(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#7d765f] mb-2 ml-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full rounded-2xl border border-[#ddd4c3] bg-[#fcfaf4] px-4 py-3.5 text-sm text-[#201c15] outline-none focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] transition-all"
              value={password} 
              onChange={(e) => setInputPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-4 w-full rounded-full bg-[#3d5a40] py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#314934] hover:shadow-xl active:scale-95 disabled:opacity-50"
          >
            {isLoading ? "Validating Account..." : "Sign In"}
          </button>
        </form>

        <p className="mt-10 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#b5af9a]">
          Study Buddy Finder v1.2
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
