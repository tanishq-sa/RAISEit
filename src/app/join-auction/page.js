'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthenticatedNavbar from '@/components/AuthenticatedNavbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

export default function JoinAuction() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [auctions, setAuctions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [auctionCode, setAuctionCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated()) {
      router.push('/login?redirect=/join-auction');
      return;
    }
    
    // Fetch auctions - only public ones
    const fetchAuctions = async () => {
      try {
        const response = await fetch('/api/auctions?publicOnly=true');
        const data = await response.json();
        
        if (response.ok && data.success) {
          setAuctions(data.auctions || []);
        } else {
          console.error('Failed to fetch auctions:', data.error);
        }
      } catch (err) {
        console.error('Failed to fetch auctions:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuctions();
  }, [isAuthenticated, router]);
  
  const filteredAuctions = auctions.filter(auction => 
    auction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    auction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    auction.creatorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!auctionCode) {
      setError('Please enter an auction code');
      return;
    }
    
    try {
      const response = await fetch(`/api/auctions/code?code=${auctionCode}`);
      const data = await response.json();
      
      if (!response.ok || !data.success || !data.auction) {
        setError('Invalid auction code. Please try again.');
        return;
      }
      
      // Navigate to the auction page
      router.push(`/auction/${data.auction._id}`);
    } catch (err) {
      setError('Failed to join auction. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthenticatedNavbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Join an Auction</h1>
        
        {/* Join by Code Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Join with Auction Code</h2>
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label htmlFor="auctionCode" className="block text-sm font-medium text-gray-700">
                Enter Auction Code
              </label>
              <input
                type="text"
                id="auctionCode"
                value={auctionCode}
                onChange={(e) => setAuctionCode(e.target.value)}
                className="input-field"
                placeholder="Enter the auction code"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="primary-btn w-full"
            >
              Join Auction
            </button>
          </form>
        </div>

        {/* Browse Public Auctions Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Browse Public Auctions</h2>
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              placeholder="Search auctions..."
            />
          </div>
          
          {loading ? (
            <div className="text-center py-4">Loading auctions...</div>
          ) : filteredAuctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAuctions.map((auction) => (
                <div key={auction._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg mb-2">{auction.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{auction.description}</p>
                  <p className="text-sm text-gray-500">Created by: {auction.creatorName}</p>
                  <Link
                    href={`/auction/${auction._id}`}
                    className="mt-4 inline-block primary-btn"
                  >
                    View Auction
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No auctions found matching your search.
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}