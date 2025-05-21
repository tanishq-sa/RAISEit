'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthenticatedNavbar from '@/components/AuthenticatedNavbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

export default function CreateAuction() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [auctionData, setAuctionData] = useState({
    name: '',
    description: '',
    baseValue: '',
    maxPlayersPerTeam: 3,
    bidderBudget: 5000,
    isPublic: true,
    players: [{ name: '', image: null, basePrice: '' }]
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdAuction, setCreatedAuction] = useState(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated()) {
      router.push('/login?redirect=/create-auction');
      return;
    }
  }, [isAuthenticated, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAuctionData({
      ...auctionData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handlePlayerChange = (index, field, value) => {
    const updatedPlayers = [...auctionData.players];
    updatedPlayers[index] = {
      ...updatedPlayers[index],
      [field]: value
    };
    setAuctionData({
      ...auctionData,
      players: updatedPlayers
    });
  };

  const addPlayer = () => {
    setAuctionData({
      ...auctionData,
      players: [...auctionData.players, { name: '', image: null, basePrice: '' }]
    });
  };

  const removePlayer = (index) => {
    const updatedPlayers = auctionData.players.filter((_, i) => i !== index);
    setAuctionData({
      ...auctionData,
      players: updatedPlayers
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Validate data
      if (!auctionData.name || !auctionData.description || !auctionData.baseValue) {
        setError('Please fill all required fields');
        setLoading(false);
        return;
      }
      // Check if all players have names
      if (auctionData.players.some(player => !player.name)) {
        setError('All players must have names');
        setLoading(false);
        return;
      }
      // Add creator ID to auction data
      const auctionWithCreator = {
        ...auctionData,
        creatorId: user._id,
        creatorName: user.name,
        baseValue: parseFloat(auctionData.baseValue),
        bidderBudget: parseFloat(auctionData.bidderBudget),
        maxPlayersPerTeam: parseInt(auctionData.maxPlayersPerTeam),
        players: auctionData.players.map(player => ({
          ...player,
          basePrice: player.basePrice ? parseFloat(player.basePrice) : parseFloat(auctionData.baseValue),
          status: 'pending'
        }))
      };
      // Create auction using API endpoint instead of direct MongoDB access
      const response = await fetch('/api/auctions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auctionWithCreator),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to create auction. Please try again.');
        setLoading(false);
        return;
      }
      setCreatedAuction(data.auction);
      setSuccess(true);
    } catch (err) {
      setError('Failed to create auction. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AuthenticatedNavbar />
      
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Create an Auction</h1>
        
        {success ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#dcfce7] text-[#166534] p-4 rounded-md mb-6">
              Auction created successfully!
            </div>
            
            <div className="bg-[#f3f4f6] p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4">{createdAuction.name}</h2>
              <p className="mb-6">{createdAuction.description}</p>
              
              <div className="border-t border-[#e5e7eb] pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-2">Invitation Code</h3>
                <div className="bg-[#1f1f1f] text-[#ffffff] p-4 rounded-md text-center text-2xl tracking-wider font-mono">
                  {createdAuction.code}
                </div>
                <p className="text-sm text-[#6b7280] mt-2">
                  Share this code with others to join your auction
                </p>
              </div>
              
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => router.push(`/auction/${createdAuction._id}`)}
                  className="primary-btn"
                >
                  Go to Auction
                </button>
                
                <button
                  onClick={() => router.push('/create-auction')}
                  className="secondary-btn"
                >
                  Create Another Auction
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            {error && (
              <div className="bg-[#fee2e2] text-[#b91c1c] p-4 rounded-md mb-6">
                {error}
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-[#374151] mb-1">
                Auction Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="input-field"
                placeholder="Enter auction name"
                value={auctionData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-[#374151] mb-1">
                Auction Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                className="input-field"
                placeholder="Describe your auction"
                value={auctionData.description}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="baseValue" className="block text-sm font-medium text-[#374151] mb-1">
                Default Player Base Value
              </label>
              <input
                id="baseValue"
                name="baseValue"
                type="number"
                min="0"
                className="input-field"
                placeholder="Enter base value"
                value={auctionData.baseValue}
                onChange={handleChange}
                required
              />
              <p className="text-sm text-[#6b7280] mt-1">
                This will be the default starting bid for all players
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="maxPlayersPerTeam" className="block text-sm font-medium text-[#374151] mb-1">
                Max Players Per Team
              </label>
              <input
                id="maxPlayersPerTeam"
                name="maxPlayersPerTeam"
                type="number"
                min="1"
                className="input-field"
                placeholder="Enter max players per team"
                value={auctionData.maxPlayersPerTeam}
                onChange={handleChange}
                required
              />
              <p className="text-sm text-[#6b7280] mt-1">
                Users will be limited to this many players on their team
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="bidderBudget" className="block text-sm font-medium text-[#374151] mb-1">
                Default Bidder Budget
              </label>
              <input
                id="bidderBudget"
                name="bidderBudget"
                type="number"
                min="0"
                className="input-field"
                placeholder="Enter bidder budget"
                value={auctionData.bidderBudget}
                onChange={handleChange}
                required
              />
              <p className="text-sm text-[#6b7280] mt-1">
                This is the default budget for bidders when they join your auction
              </p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center">
                <input
                  id="isPublic"
                  name="isPublic"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  checked={auctionData.isPublic}
                  onChange={handleChange}
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-[#374151]">
                  Make this auction public
                </label>
              </div>
              <p className="text-sm text-[#6b7280] mt-1 ml-6">
                Public auctions will appear in the browse list. Private auctions can only be joined with the code.
              </p>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Players</h2>
              
              {auctionData.players.map((player, index) => (
                <div key={index} className="mb-6 p-4 border border-[#e5e7eb] rounded-md">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium">Player {index + 1}</h3>
                    {auctionData.players.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePlayer(index)}
                        className="text-[#ef4444]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-[#374151] mb-1">
                      Player Name
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter player name"
                      value={player.name}
                      onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-[#374151] mb-1">
                      Image URL (Optional)
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter image URL"
                      value={player.image || ''}
                      onChange={(e) => handlePlayerChange(index, 'image', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#374151] mb-1">
                      Base Price (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="input-field"
                      placeholder={`Use default (${auctionData.baseValue || 'not set'})`}
                      value={player.basePrice}
                      onChange={(e) => handlePlayerChange(index, 'basePrice', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addPlayer}
                className="secondary-btn"
              >
                Add Player
              </button>
            </div>
            
            <div className="mt-8">
              <button
                type="submit"
                className="primary-btn w-full"
                disabled={loading}
              >
                {loading ? 'Creating Auction...' : 'Create Auction'}
              </button>
            </div>
          </form>
        )}
      </div>
      
      <Footer />
    </div>
  );
} 