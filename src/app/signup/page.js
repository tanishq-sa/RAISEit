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
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [retypePasswordTouched, setRetypePasswordTouched] = useState(false);
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
  const emailError = emailTouched && email && !isValidEmail(email) ? 'Please enter a valid email address!' : '';

  // Live password validation
  const passwordValidation = passwordTouched ? validatePassword(password) : { isValid: true, errors: [] };
  const passwordError = passwordTouched && !passwordValidation.isValid 
    ? 'Password must meet all requirements.' 
    : '';

  // Live confirm password validation
  const confirmPasswordError = retypePasswordTouched && password !== retypePassword 
    ? 'Passwords do not match.' 
    : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate email format
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address!');
      return;
    }

    // Validate password strength
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      setError('Password does not meet the requirements.');
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
                onBlur={() => setPasswordTouched(true)}
                required
              />
              {passwordTouched && !passwordValidation.isValid && (
                <div className="mt-2">
                  <div className="text-xs text-[#9ca3af] mb-1">Password must contain:</div>
                  <ul className="text-xs text-[#9ca3af] list-disc list-inside">
                    {passwordValidation.errors.map((error, index) => (
                      <li key={index} className={password.includes(error) ? 'text-green-400' : 'text-[#ef4444]'}>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {passwordError && <div className="text-[#ef4444] text-xs mt-1">{passwordError}</div>}
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
                onBlur={() => setRetypePasswordTouched(true)}
                required
              />
              {confirmPasswordError && <div className="text-[#ef4444] text-xs mt-1">{confirmPasswordError}</div>}
            </div>
            
            {error && (
              <div className="mb-4 text-[#ef4444] text-sm">{error}</div>
            )}
            
            <button
              type="submit"
              className="w-full py-2 px-4 bg-black text-white rounded-lg font-medium shadow hover:bg-grey-700 hover:shadow-lg hover:scale-105 transition-all"
              disabled={loading || !!emailError || !!passwordError || !!confirmPasswordError}
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