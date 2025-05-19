'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function ResendVerificationButton({ email }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage(data.message);
        setDisabled(true);
      } else {
        setError(data.error || 'Failed to resend verification email.');
        if (res.status === 429) setDisabled(true);
      }
    } catch {
      setError('Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4">
      <button
        onClick={handleResend}
        disabled={loading || disabled}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Resend Verification Email'}
      </button>
      {message && <div className="text-green-600 mt-2">{message}</div>}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (isAuthenticated()) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Failed to login');
      }
    } catch {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#000000] min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="bg-[#1E1E1E] rounded-xl shadow-lg p-8 w-full max-w-md border border-[#222]">
          <h1 className="text-2xl font-bold mb-6 text-center text-[#fff]">Login to RAISEit</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-[#d1d5db] mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-[#d1d5db] mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input-field"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <div className="mb-4 text-[#ef4444] text-sm">{error}</div>
            )}
            
            {/* Show resend button if error is about verification and email is entered */}
            {error && (
              (error.toLowerCase().includes('verify your email') || error.toLowerCase().includes('email not verified')) && email
            ) && (
              <ResendVerificationButton email={email} />
            )}
            
            <button
              type="submit"
              className="w-full py-2 px-4 bg-black text-white rounded-lg font-medium shadow hover:bg-grey-700 hover:shadow-lg hover:scale-105 transition-all"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/forget-password" className="text-sm text-[#60a5fa] hover:underline">
              Forgot Password?
            </Link>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-[#9ca3af]">
              Not Registered Yet?{' '}
              <Link href="/signup" className="text-[#ffffff] hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 