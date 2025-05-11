'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AuthenticatedNavbar from '@/components/AuthenticatedNavbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleCreateAuction = () => {
    if (isAuthenticated()) {
      router.push('/create-auction');
    } else {
      router.push('/login?redirect=/create-auction');
    }
  };

  const handleJoinAuction = () => {
    if (isAuthenticated()) {
      router.push('/join-auction');
    } else {
      router.push('/login?redirect=/join-auction');
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <AuthenticatedNavbar />

      {/* Hero Section */}
      <section className="py-20 px-4 flex-grow">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Where Teams Compete, and Bids Rise.
          </h1>
          <p className="text-lg mb-10 max-w-2xl mx-auto">
            Players are pre-set by the admin. Teams register, bid, and win.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button 
              onClick={handleCreateAuction}
              className="border border-[#000000] py-2 px-6 rounded hover:bg-[#f3f4f6] hover:bg-grey-700 hover:shadow-lg hover:scale-105 transition-all"
            >
              Create Auction
            </button>
            <button
              onClick={handleJoinAuction}
              className="border border-[#000000] py-2 px-6 rounded hover:bg-[#f3f4f6] hover:bg-grey-700 hover:shadow-lg hover:scale-105 transition-all"
            >
              Join Auction
            </button>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 px-4 bg-[#ffffff] border-t border-b border-[#e5e7eb]">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">HOW IT WORKS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="border border-[#e5e7eb]">
              <div className="border-b border-[#e5e7eb] py-3">
                <h3 className="text-center font-bold">Step 1:</h3>
              </div>
              <div className="p-6">
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Become the admin by creating a new auction.</li>
                  <li>Set the rules: team budget, number of players, bid time, and teams allowed.</li>
                  <li>A unique Auction Code is generated for others to join.</li>
                </ol>
              </div>
            </div>

            {/* Step 2 */}
            <div className="border border-[#e5e7eb]">
              <div className="border-b border-[#e5e7eb] py-3">
                <h3 className="text-center font-bold">Step 2:</h3>
              </div>
              <div className="p-6">
                <ol className="list-decimal pl-5 space-y-2">
                  <li>The admin adds players with names and base prices to the auction pool.</li>
                  <li>This list will be used during bidding.</li>
                </ol>
              </div>
            </div>

            {/* Step 3 */}
            <div className="border border-[#e5e7eb]">
              <div className="border-b border-[#e5e7eb] py-3">
                <h3 className="text-center font-bold">Step 3:</h3>
              </div>
              <div className="p-6">
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Participants use the shared Auction Code to join the live session.</li>
                  <li>No sign-up needed for players — just enter the code and a name.</li>
                </ol>
              </div>
            </div>

            {/* Step 4 */}
            <div className="border border-[#e5e7eb]">
              <div className="border-b border-[#e5e7eb] py-3">
                <h3 className="text-center font-bold">Step 4:</h3>
              </div>
              <div className="p-6">
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Once the auction starts, players are displayed one by one for bidding.</li>
                  <li>Teams bid smartly to build the best squad within the set budget.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
} 