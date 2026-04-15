import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { forgotPassword, resetPassword } from "../services/authService";

interface ResetPasswordFormProps {
  onBack: () => void;
}

export default function ResetPasswordForm({ onBack }: ResetPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Check the URL for a token when the component loads
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) setToken(urlToken);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (token) {
        // We have a token: Update the password
        await resetPassword(token, password);
        setIsSubmitted(true);

        // Clean up the URL so the token doesn't linger
        window.history.replaceState({}, document.title, "/");

        // Automatically send them back to login after 3 seconds
        setTimeout(() => onBack(), 3000);
      } else {
        // No token: Request a recovery email
        await forgotPassword(email);
        setIsSubmitted(true);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // SUCCESS STATES (Email sent OR Password updated)
  if (isSubmitted) {
    return (
      <div className="text-center space-y-6">
        <div className="bg-[#5A5A40]/10 p-4 rounded-2xl">
          {token ? (
            <>
              <p className="text-[#5A5A40] font-medium text-lg">Password Updated!</p>
              <p className="text-sm text-gray-600 mt-2">
                Your password has been changed successfully. Sending you back to login...
              </p>
            </>
          ) : (
            <>
              <p className="text-[#5A5A40] font-medium text-lg">Check your inbox!</p>
              <p className="text-sm text-gray-600 mt-2">
                We've sent password reset instructions to <span className="font-semibold">{email}</span>.
              </p>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={onBack}
          className="font-medium text-[#5A5A40] hover:text-[#4a4a34] underline underline-offset-4 flex items-center justify-center w-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to sign in
        </button>
      </div>
    );
  }

  // FORM STATE
  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      
      {/* ERROR MESSAGE BOX */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-pulse">
          <p className="font-bold flex items-center gap-2">⚠️ Error</p>
          <p>{error}</p>
        </div>
      )}

      {token ? (
        // NEW PASSWORD INPUT (Shown if arriving from email link)
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-[#1a1a1a] uppercase tracking-wider">
            New Password
          </label>
          <div className="mt-1">
            <input
              id="new-password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full appearance-none rounded-xl border border-[#e5e5e0] px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#5A5A40] focus:outline-none focus:ring-[#5A5A40] sm:text-sm transition-all"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500 italic">
            Make sure it's something you'll remember this time!
          </p>
        </div>
      ) : (
        // EMAIL INPUT (Shown normally)
        <div>
          <label htmlFor="reset-email" className="block text-sm font-medium text-[#1a1a1a] uppercase tracking-wider">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="reset-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full appearance-none rounded-xl border border-[#e5e5e0] px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#5A5A40] focus:outline-none focus:ring-[#5A5A40] sm:text-sm transition-all"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500 italic">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-full border border-transparent bg-[#5A5A40] py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#4a4a34] focus:outline-none focus:ring-2 focus:ring-[#5A5A40] focus:ring-offset-2 transition-all transform active:scale-95 disabled:opacity-50"
        >
          {isLoading ? "Processing..." : (token ? "Update Password" : "Send reset link")}
        </button>
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onBack}
          className="font-medium text-[#5A5A40] hover:text-[#4a4a34] underline underline-offset-4 flex items-center justify-center w-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to sign in
        </button>
      </div>
    </form>
  );
}