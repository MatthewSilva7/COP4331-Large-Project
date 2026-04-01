import React, { useState } from "react";
import { motion } from "motion/react";

interface RegisterFormProps {
  onToggle: () => void;
}

export default function RegisterForm({ onToggle }: RegisterFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Register attempt:", { firstName, lastName, email, password });
    alert("Registration functionality would go here! (Firebase was declined, so this is a demo).");
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-[#1a1a1a] uppercase tracking-wider">
            First Name
          </label>
          <div className="mt-1">
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="block w-full appearance-none rounded-xl border border-[#e5e5e0] px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#5A5A40] focus:outline-none focus:ring-[#5A5A40] sm:text-sm transition-all"
            />
          </div>
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-[#1a1a1a] uppercase tracking-wider">
            Last Name
          </label>
          <div className="mt-1">
            <input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="block w-full appearance-none rounded-xl border border-[#e5e5e0] px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#5A5A40] focus:outline-none focus:ring-[#5A5A40] sm:text-sm transition-all"
            />
          </div>
        </div>
      </div>

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
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full appearance-none rounded-xl border border-[#e5e5e0] px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#5A5A40] focus:outline-none focus:ring-[#5A5A40] sm:text-sm transition-all"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="flex w-full justify-center rounded-full border border-transparent bg-[#5A5A40] py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#4a4a34] focus:outline-none focus:ring-2 focus:ring-[#5A5A40] focus:ring-offset-2 transition-all transform active:scale-95"
        >
          Create account
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onToggle}
            className="font-medium text-[#5A5A40] hover:text-[#4a4a34] underline underline-offset-4"
          >
            Sign in here
          </button>
        </p>
      </div>
    </form>
  );
}
