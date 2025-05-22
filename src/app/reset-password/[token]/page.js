"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AuthenticatedNavbar from "@/components/AuthenticatedNavbar";
import Footer from "@/components/Footer";

function isStrongPassword(password) {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
}

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Password strength validation
  const validatePassword = (pass) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumbers = /\d/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    
    const errors = [];
    if (pass.length < minLength) errors.push(`At least ${minLength} characters`);
    if (!hasUpperCase) errors.push('At least one uppercase letter');
    if (!hasLowerCase) errors.push('At least one lowercase letter');
    if (!hasNumbers) errors.push('At least one number');
    if (!hasSpecialChar) errors.push('At least one special character');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Live email validation
  const emailError = emailTouched && email && !emailRegex.test(email) 
    ? 'Please enter a valid email address.' 
    : '';

  // Live password validation
  const passwordValidation = passwordTouched ? validatePassword(password) : { isValid: true, errors: [] };
  const passwordError = passwordTouched && !passwordValidation.isValid 
    ? 'Password must meet all requirements.' 
    : '';

  // Live confirm password validation
  const confirmPasswordError = confirmPasswordTouched && password !== confirmPassword 
    ? 'Passwords do not match.' 
    : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate email
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Validate password strength
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      setError("Password does not meet the requirements.");
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || "Password reset successful. You can now login with your new password.");
      } else {
        setError(data.error || "Failed to reset password.");
      }
    } catch (err) {
      setError("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <AuthenticatedNavbar />
      <main className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
          {error && (error.toLowerCase().includes('invalid') || error.toLowerCase().includes('expired')) ? (
            <div className="text-red-500 text-center text-base font-medium">
              This password reset link is invalid or has expired.<br />
              Please request a new password reset email.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#d1d5db] mb-1">
                  Email Address
                </label>
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
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#d1d5db] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPasswordTouched(true)}
                  className="input-field"
                  placeholder="Enter new password"
                  required
                />
                {passwordTouched && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-400 mb-1">Password must contain:</div>
                    <ul className="text-xs text-gray-400 list-disc list-inside">
                      {passwordValidation.errors.map((error, index) => (
                        <li key={index} className={password.includes(error) ? 'text-green-400' : 'text-red-400'}>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {passwordError && <div className="text-red-400 text-xs mt-1">{passwordError}</div>}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#d1d5db] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setConfirmPasswordTouched(true)}
                  className="input-field"
                  placeholder="Confirm new password"
                  required
                />
                {confirmPasswordError && <div className="text-red-400 text-xs mt-1">{confirmPasswordError}</div>}
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-500 text-sm">{success}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white primary-btn"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
