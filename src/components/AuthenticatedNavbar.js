'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AuthenticatedNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-[#000000] py-4 px-6 md:px-12 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-[#ffffff]">
          <span className="font-bold tracking-wider">RAISE<span className="lowercase">it</span></span>
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-[#ffffff]"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Desktop navigation */}
        <div className="hidden md:flex space-x-8 items-center">
          <Link href="/" className="text-[#ffffff] hover:text-[#e5e7eb]">
            Home
          </Link>
          
          {isAuthenticated() && (
            <>
              <Link href="/create-auction" className="text-[#ffffff] hover:text-[#e5e7eb]">
                Create Auction
              </Link>
              
              <Link href="/join-auction" className="text-[#ffffff] hover:text-[#e5e7eb]">
                Join Auction
              </Link>
              
              <Link href="/my-team" className="text-[#ffffff] hover:text-[#e5e7eb]">
                My Team
              </Link>
              
              <button
                onClick={logout}
                className="border border-[#ffffff] text-[#ffffff] px-4 py-2 rounded hover:bg-[#333333]"
              >
                Logout
              </button>
            </>
          )}
          
          {!isAuthenticated() && (
            <>
              <Link href="/contact" className="text-[#ffffff] hover:text-[#e5e7eb]">
                Contact
              </Link>
              <Link href="/login" className="border border-[#ffffff] text-[#ffffff] px-4 py-2 rounded hover:bg-[#333333]">
                Login
              </Link>
              <Link href="/signup" className="border border-[#ffffff] text-[#ffffff] px-4 py-2 rounded hover:bg-[#333333]">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-[#000000] shadow-md py-4 px-6 z-10">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-[#ffffff] hover:text-[#e5e7eb]">
                Home
              </Link>
              
              {isAuthenticated() && (
                <>
                  <Link href="/create-auction" className="text-[#ffffff] hover:text-[#e5e7eb]">
                    Create Auction
                  </Link>
                  
                  <Link href="/join-auction" className="text-[#ffffff] hover:text-[#e5e7eb]">
                    Join Auction
                  </Link>
                  
                  <Link href="/my-team" className="text-[#ffffff] hover:text-[#e5e7eb]">
                    My Team
                  </Link>
                  
                  <button
                    onClick={logout}
                    className="text-left text-[#ffffff] hover:text-[#e5e7eb]"
                  >
                    Logout
                  </button>
                </>
              )}
              
              {!isAuthenticated() && (
                <>
                  <Link href="/contact" className="text-[#ffffff] hover:text-[#e5e7eb]">
                    Contact
                  </Link>
                  <Link href="/login" className="block py-2 px-4 border border-[#ffffff] text-[#ffffff] rounded-md">
                    Login
                  </Link>
                  <Link href="/signup" className="block py-2 px-4 border border-[#ffffff] text-[#ffffff] rounded-md">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        {/* User info if authenticated */}
        {isAuthenticated() && (
          <div className="hidden md:block text-[#ffffff] text-sm">
            Logged in as: {user?.name} 
          </div>
        )}
      </div>
    </nav>
  );
} 