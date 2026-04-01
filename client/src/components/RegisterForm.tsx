import React, { useState } from "react";
import { registerUser } from "../services/authService"; // This connects the UI to the API

interface RegisterFormProps {
  onToggle: () => void;
}

export default function RegisterForm({ onToggle }: RegisterFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // For success/error messages
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // 1. Call the API
      const response = await registerUser(firstName, lastName, email, password);
      
      // 2. Show Success (The "Check your email" message)
      setMessage(response.message);
      
      // Optional: Clear the form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      // 3. Show Error (e.g., "User already exists")
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Display Success/Error Message to User */}
      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium ${message.includes("successful") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-[#1a1a1a] uppercase tracking-wider">
            First Name
          </label>
          <div className="mt-1">
            <input
              id="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="block w-full rounded-xl border border-[#e5e5e0] px-3 py-2 focus:border-[#5A5A40] focus:outline-none focus:ring-[#5A5A40] sm:text-sm transition-all"
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
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="block w-full rounded-xl border border-[#e5e5e0] px-3 py-2 focus:border-[#5A5A40] focus:outline-none focus:ring-[#5A5A40] sm:text-sm transition-all"
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
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-xl border border-[#e5e5e0] px-3 py-2 focus:border-[#5A5A40] focus:outline-none focus:ring-[#5A5A40] sm:text-sm transition-all"
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
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-xl border border-[#e5e5e0] px-3 py-2 focus:border-[#5A5A40] focus:outline-none focus:ring-[#5A5A40] sm:text-sm transition-all"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-full bg-[#5A5A40] py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#4a4a34] transition-all transform active:scale-95 disabled:opacity-50"
        >
          {isLoading ? "Creating account..." : "Create account"}
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
