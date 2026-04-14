import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

interface ResetPasswordFormProps {
  onBack: () => void;
}

export default function ResetPasswordForm({ onBack }: ResetPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Password reset requested for:", email);
    setIsSubmitted(true);
    // In a real app, this would call an API to send the reset email
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-6">
        <div className="bg-[#5A5A40]/10 p-4 rounded-2xl">
          <p className="text-[#5A5A40] font-medium">
            Check your inbox!
          </p>
          <p className="text-sm text-gray-600 mt-2">
            We've sent password reset instructions to <span className="font-semibold">{email}</span>.
          </p>
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

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
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

      <div>
        <button
          type="submit"
          className="flex w-full justify-center rounded-full border border-transparent bg-[#5A5A40] py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#4a4a34] focus:outline-none focus:ring-2 focus:ring-[#5A5A40] focus:ring-offset-2 transition-all transform active:scale-95"
        >
          Send reset link
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
