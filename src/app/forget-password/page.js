"use client";

import { useState } from "react";
import AuthenticatedNavbar from "@/components/AuthenticatedNavbar";
import Footer from "@/components/Footer";

export default function ForgetPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  function isValidEmail(email) {
    // Simple regex for email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setResetLink("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        setMessage(data.message || "If an account with that email exists, a password reset link has been sent.");
        if (data.resetLink) setResetLink(data.resetLink);
      } else {
        setError(data.error || "Failed to process request.");
      }
    } catch (err) {
      setError("Failed to process request.");
    } finally {
      setLoading(false);
    }
  };

  // Live email validation
  const emailError = emailTouched && email && !isValidEmail(email) ? 'Please enter a valid email address.' : '';

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col">
      <AuthenticatedNavbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="bg-[#1E1E1E] rounded-xl shadow-lg p-8 w-full max-w-md border border-[#222]">
          <h1 className="text-2xl font-bold mb-6 text-center text-[#fff]">Forgot Password?</h1>
          {submitted ? (
            <div className="text-green-400 text-center">
              {message}
              {resetLink && (
                <div className="mt-4 text-xs text-gray-400 break-all">
                  <span className="font-semibold">Reset Link (for testing):</span><br />
                  <a href={resetLink} className="text-blue-400 underline" target="_blank" rel="noopener noreferrer">{resetLink}</a>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#d1d5db] mb-1">
                  Email Address
                </label>
                  {/* <span className="block text-xs text-gray-400 mb-1">Enter your email</span> */}
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  className="input-field"
                  placeholder="Enter your email"
                  required
                />
                {emailError && <div className="text-red-400 text-xs mt-1">{emailError}</div>}
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full py-2 px-4 bg-black text-white rounded-lg font-medium shadow hover:bg-grey-700 hover:shadow-lg hover:scale-105 transition-all"
                disabled={loading || !!emailError}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 