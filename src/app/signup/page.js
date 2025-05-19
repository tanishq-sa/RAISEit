'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const router = useRouter();
  const { signup, isAuthenticated } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (isAuthenticated()) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  function isValidEmail(email) {
    // Simple regex for email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Live email validation
  const emailError = emailTouched && email && !isValidEmail(email) ? 'Please enter a valid email address!' : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Validate email format
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address!');
      return;
    }
    // Validate passwords match
    if (password !== retypePassword) {
      setError('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      const result = await signup(name, email, password);
      
      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Failed to create account');
      }
    } catch (err) {
      setError('An error occurred during signup');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#000000] min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="bg-[#1E1E1E] rounded-xl shadow-lg p-8 w-full max-w-md border border-[#222]">
          <h1 className="text-2xl font-bold mb-6 text-center text-[#fff]">Create an Account</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-[#d1d5db] mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                className="input-field"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
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
                onBlur={() => setEmailTouched(true)}
                required
              />
              {emailError && <div className="text-[#ef4444] text-xs mt-1">{emailError}</div>}
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-[#d1d5db] mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input-field"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="retypePassword" className="block text-sm font-medium text-[#d1d5db] mb-1">
                Retype Password
              </label>
              <input
                id="retypePassword"
                type="password"
                className="input-field"
                placeholder="Retype your password"
                value={retypePassword}
                onChange={(e) => setRetypePassword(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <div className="mb-4 text-[#ef4444] text-sm">{error}</div>
            )}
            
            <button
              type="submit"
              className="w-full py-2 px-4 bg-black text-white rounded-lg font-medium shadow hover:bg-grey-700 hover:shadow-lg hover:scale-105 transition-all"
              disabled={loading || !!emailError}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-[#9ca3af]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#ffffff] hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 