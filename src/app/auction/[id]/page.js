'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AuthenticatedNavbar from '@/components/AuthenticatedNavbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

export default function AuctionPage() {
  const params = useParams();
  const id = params.id;
  const { user, isAuthenticated, isAdmin, isBidder, updateFunds, addPlayer } = useAuth();
  const router = useRouter();
  
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');
  const [bids, setBids] = useState([]);
  const [bidHistory, setBidHistory] = useState([]);
  const [bidding, setBidding] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [visibilityStatus, setVisibilityStatus] = useState(true);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [auctionStarted, setAuctionStarted] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  // Timer state
  const [timer, setTimer] = useState(15);
  const [lastHighestBid, setLastHighestBid] = useState(null);
  const [bidders, setBidders] = useState([]);
  const [hasSyncedFunds, setHasSyncedFunds] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated()) {
      router.push('/login?redirect=/auction/' + id);
      return;
    }

    // Fetch auction data
    const fetchAuction = async () => {
      setLoading(true);
      try {
        // Use fetch API instead of direct MongoDB utils
        const response = await fetch(`/api/auctions/${id}`);
        const data = await response.json();
        
        if (!response.ok || !data.auction) {
          setError('Auction not found');
          return;
        }
        
        const auctionData = data.auction;
        
        // Fetch bidders for this auction
        const biddersResponse = await fetch(`/api/auctions/${id}/bidders`);
        const biddersData = await biddersResponse.json();
        
        // Merge bidders data with auction data
        auctionData.bidders = biddersData.bidders || [];
        
        setAuction(auctionData);
        setCurrentPlayerIndex(auctionData.currentPlayerIndex || 0);
        setBudgetAmount(auctionData.bidderBudget || 5000);
        setVisibilityStatus(auctionData.isPublic);
        setAuctionStarted(auctionData.status === 'active');
        setAuctionEnded(auctionData.status === 'ended');
        
        // Fetch bids for this auction
        const bidsResponse = await fetch(`/api/bids?auctionId=${id}`);
        const bidsData = await bidsResponse.json();
        setBids(bidsData.bids || []);
        
        // If there are bids for the current player, set the bid amount to the highest bid + 100
        if (auctionData.players && auctionData.players.length > 0) {
          const currentPlayer = auctionData.players[auctionData.currentPlayerIndex || 0];
          if (currentPlayer) {
            const highestBidResponse = await fetch(`/api/bids?auctionId=${id}&playerId=${currentPlayer._id}&highest=true`);
            const highestBidData = await highestBidResponse.json();
            const highestBid = highestBidData.bid;
            
            if (highestBid) {
              setBidAmount(highestBid.amount + 1);
            } else {
              setBidAmount(currentPlayer.basePrice || auctionData.baseValue);
            }
          }
        }
      } catch (err) {
        setError('Failed to load auction data');
        console.error('Error fetching auction:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [id, isAuthenticated, router]);

  // Timer effect: reset on player change, count down every second
  useEffect(() => {
    if (auctionEnded || !auctionStarted) return;
    setTimer(15); // Reset timer on player change
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentPlayerIndex, auctionEnded, auctionStarted]);

  // Poll for new bids every second and reset timer to 15s if a new highest bid is detected
  useEffect(() => {
    if (!auction || auctionEnded || !auctionStarted) return;
    const playerId = auction.players?.[currentPlayerIndex]?._id;
    let polling = true;
    const poll = async () => {
      if (!polling) return;
      try {
        const res = await fetch(`/api/bids?auctionId=${auction._id}&playerId=${playerId}&highest=true`);
        const data = await res.json();
        const highestBid = data.bid;
        if (highestBid && highestBid._id !== lastHighestBid) {
          setLastHighestBid(highestBid._id);
          setTimer(15); // Reset timer to 15s for all users
        }
      } catch (err) {
        // ignore
      }
      setTimeout(poll, 1000);
    };
    poll();
    return () => { polling = false; };
  }, [auction, currentPlayerIndex, auctionEnded, lastHighestBid, auctionStarted]);

  // Auto-advance for creator when timer reaches zero
  useEffect(() => {
    if (
      auction &&
      user &&
      timer === 0 &&
      user._id === auction.creatorId &&
      currentPlayerIndex < auction.players.length - 1 &&
      !auctionEnded &&
      auctionStarted
    ) {
      const timeout = setTimeout(() => {
        nextPlayer();
      }, 1000); // 1 second delay before advancing
      return () => clearTimeout(timeout);
    }
  }, [timer, user?._id, auction?.creatorId, currentPlayerIndex, auction?.players?.length, auctionEnded, auctionStarted]);

  // Poll for auction updates
  useEffect(() => {
    if (!auction || auctionEnded) return;
    
    const pollAuction = async () => {
      try {
        const response = await fetch(`/api/auctions/${id}`);
        const data = await response.json();
        
        if (response.ok && data.auction) {
          const auctionData = data.auction;
          
          // Only update if there are changes
          if (auctionData.currentPlayerIndex !== currentPlayerIndex) {
            setCurrentPlayerIndex(auctionData.currentPlayerIndex);
            setTimer(15); // Reset timer on player change
          }
          
          // Update auction status
          setAuctionStarted(auctionData.status === 'active');
          setAuctionEnded(auctionData.status === 'ended');
          
          // Update auction data
          setAuction(auctionData);
        }
      } catch (err) {
        console.error('Error polling auction:', err);
      }
    };

    const interval = setInterval(pollAuction, 1000);
    return () => clearInterval(interval);
  }, [auction, id, currentPlayerIndex, auctionEnded]);

  // Poll for bid updates
  useEffect(() => {
    if (!auction || auctionEnded) return;
    
    const pollBids = async () => {
      try {
        const response = await fetch(`/api/bids?auctionId=${id}`);
        const data = await response.json();
        
        if (response.ok && data.bids) {
          setBids(data.bids);
          
          // Update bid amount if there's a new highest bid
          const currentPlayer = auction.players?.[currentPlayerIndex];
          if (currentPlayer) {
            const highestBid = data.bids
              .filter(bid => bid.playerId === currentPlayer._id)
              .sort((a, b) => b.amount - a.amount)[0];
            
            if (highestBid && highestBid._id !== lastHighestBid) {
              setBidAmount(highestBid.amount + 1);
              setLastHighestBid(highestBid._id);
              setTimer(15); // Reset timer on new bid
            }
          }
        }
      } catch (err) {
        console.error('Error polling bids:', err);
      }
    };

    const interval = setInterval(pollBids, 1000);
    return () => clearInterval(interval);
  }, [auction, id, currentPlayerIndex, auctionEnded, lastHighestBid]);

  // Poll for bidders updates (admin only)
  useEffect(() => {
    if (user?._id !== auction?.creatorId) return;
    let interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auctions/${id}/bidders`);
        const data = await res.json();
        if (res.ok && data.bidders) {
          setBidders(data.bidders);
        }
      } catch (err) {
        // Optionally handle error
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [id, user?._id, auction?.creatorId]);

  // Function to move to the next player
  const nextPlayer = async () => {
    if (!auction || !auction.players) return;
    
    if (currentPlayerIndex < auction.players.length - 1) {
      const nextIndex = currentPlayerIndex + 1;
      
      try {
        const response = await fetch(`/api/auctions/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ currentPlayerIndex: nextIndex })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update auction');
        }
        
        // Reset bid amount to the base price of the next player
        const nextPlayer = auction.players[nextIndex];
        setBidAmount(nextPlayer.basePrice || auction.baseValue);
        
        // Clear bid messages
        setBidError('');
        setBidSuccess('');
        
        // Update the auction object
        setAuction({
          ...auction,
          currentPlayerIndex: nextIndex
        });
        
        setCurrentPlayerIndex(nextIndex);
        setTimer(15); // Reset timer
      } catch (err) {
        setError('Failed to move to next player');
        console.error(err);
      }
    }
  };

  // Function to go back to the previous player
  const previousPlayer = async () => {
    if (!auction || !auction.players) return;
    
    if (currentPlayerIndex > 0) {
      const prevIndex = currentPlayerIndex - 1;
      
      try {
        const response = await fetch(`/api/auctions/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ currentPlayerIndex: prevIndex })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update auction');
        }
        
        // Reset bid amount to the base price of the previous player
        const prevPlayer = auction.players[prevIndex];
        setBidAmount(prevPlayer.basePrice || auction.baseValue);
        
        // Clear bid messages
        setBidError('');
        setBidSuccess('');
        
        // Update the auction object
        setAuction({
          ...auction,
          currentPlayerIndex: prevIndex
        });
        
        setCurrentPlayerIndex(prevIndex);
        setTimer(15); // Reset timer
      } catch (err) {
        setError('Failed to move to previous player');
        console.error(err);
      }
    }
  };

  // Function to place a bid
  const placeBid = async () => {
    if (!auction || !auction.players || !user) return;
    setBidError('');
    setBidSuccess('');
    setBidding(true);
    try {
      const currentPlayer = auction.players[currentPlayerIndex];
      if (!bidAmount || isNaN(parseFloat(bidAmount))) {
        setBidError('Please enter a valid bid amount');
        setBidding(false);
        return;
      }
      const bidAmountNum = parseFloat(bidAmount);
      if (bidAmountNum < (currentPlayer.basePrice || auction.baseValue)) {
        setBidError(`Bid must be at least ${currentPlayer.basePrice || auction.baseValue}`);
        setBidding(false);
        return;
      }
      // Find user's previous highest bid for this player
      const previousBid = bids
        .filter(bid => bid.playerId === currentPlayer._id && bid.userId === user._id)
        .sort((a, b) => b.amount - a.amount)[0];
      const previousAmount = previousBid ? previousBid.amount : 0;
      const deduction = bidAmountNum - previousAmount;
      if (isBidder() && deduction > user.funds) {
        setBidError(`Not enough funds. You have ${user.funds} available.`);
        setBidding(false);
        return;
      }
      const highestBidResponse = await fetch(`/api/bids?auctionId=${id}&playerId=${currentPlayer._id}&highest=true`);
      const highestBidData = await highestBidResponse.json();
      const highestBid = highestBidData.bid;
      if (highestBid && bidAmountNum <= highestBid.amount) {
        setBidError(`Bid must be higher than the current highest bid: ${highestBid.amount}`);
        setBidding(false);
        return;
      }
      const newBid = {
        auctionId: id,
        playerId: currentPlayer._id,
        playerName: currentPlayer.name,
        userId: user._id,
        userName: user.name,
        amount: bidAmountNum,
        timestamp: new Date().toISOString()
      };
      const bidResponse = await fetch('/api/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBid)
      });
      if (!bidResponse.ok) {
        throw new Error('Failed to place bid');
      }
      if (isBidder()) {
        const newFunds = user.funds - deduction;
        const updated = await updateFunds(newFunds);
        if (!updated || !updated.success) {
          throw new Error('Failed to update funds');
        }
        // Update the bidders list to reflect new balance
        const biddersResponse = await fetch(`/api/auctions/${id}/bidders`);
        const biddersData = await biddersResponse.json();
        setBidders(biddersData.bidders || []);
      }
      const updatedBidsResponse = await fetch(`/api/bids?auctionId=${id}`);
      const updatedBidsData = await updatedBidsResponse.json();
      setBids(updatedBidsData.bids || []);
      setBidSuccess(`Successfully placed bid of $${bidAmountNum}`);
      setTimer(15); // Reset timer to 15s after a bid (immediate feedback)
    } catch (err) {
      setBidError('Failed to place bid');
      console.error(err);
    } finally {
      setBidding(false);
    }
  };

  // Function to finalize a player (mark as sold to highest bidder)
  const finalizePlayer = async () => {
    if (!auction || !auction.players) return;
    
    try {
      const currentPlayer = auction.players[currentPlayerIndex];
      
      // Get highest bid for this player
      const highestBidResponse = await fetch(`/api/bids?auctionId=${id}&playerId=${currentPlayer._id}&highest=true`);
      const highestBidData = await highestBidResponse.json();
      const highestBid = highestBidData.bid;
      
      if (!highestBid) {
        setError('No bids found for this player');
        return;
      }
      
      // Update player status in the auction
      const updatedPlayer = {
        ...currentPlayer,
        status: 'sold',
        soldTo: highestBid.userId,
        soldToName: highestBid.userName,
        soldAmount: highestBid.amount
      };
      
      const updatedPlayers = [...auction.players];
      updatedPlayers[currentPlayerIndex] = updatedPlayer;
      
      const response = await fetch(`/api/auctions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ players: updatedPlayers })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update player status');
      }
      
      // Update local state
      setAuction({
        ...auction,
        players: updatedPlayers
      });
      
      // Add player to buyer's team
      if (user._id === highestBid.userId) {
        addPlayer({
          id: currentPlayer._id,
          name: currentPlayer.name,
          price: highestBid.amount,
          auctionId: id,
          auctionName: auction.name,
          image: currentPlayer.image
        });
      }
      
      setBidSuccess(`Player ${currentPlayer.name} sold to ${highestBid.userName} for $${highestBid.amount}`);
      
      // Move to next player automatically
      if (currentPlayerIndex < auction.players.length - 1) {
        setTimeout(nextPlayer, 2000);
      }
    } catch (err) {
      setError('Failed to finalize player');
      console.error(err);
    }
  };
  
  // Function to set bidder budget
  const handleSetBudget = async () => {
    if (!auction || !isAdmin()) return;
    
    try {
      const budget = parseFloat(budgetAmount);
      
      if (isNaN(budget) || budget <= 0) {
        setError('Please enter a valid budget amount');
        return;
      }
      
      const response = await fetch(`/api/auctions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bidderBudget: budget })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update bidder budget');
      }
      
      setAuction({
        ...auction,
        bidderBudget: budget
      });
      
      setBidSuccess(`Bidder budget set to $${budget}`);
    } catch (err) {
      setError('Failed to set bidder budget');
      console.error(err);
    }
  };
  
  // Function to toggle auction visibility
  const toggleVisibility = async () => {
    if (!auction || !isAdmin()) return;
    
    try {
      const newVisibility = !visibilityStatus;
      
      const response = await fetch(`/api/auctions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPublic: newVisibility })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update auction visibility');
      }
      
      setVisibilityStatus(newVisibility);
      setAuction({
        ...auction,
        isPublic: newVisibility
      });
      
      setBidSuccess(`Auction is now ${newVisibility ? 'public' : 'private'}`);
    } catch (err) {
      setError('Failed to toggle visibility');
      console.error(err);
    }
  };
  
  // Function to set budget for a specific bidder
  const setBidderBudgetForUser = async (userId, budget) => {
    if (!auction || !isAdmin()) return;
    
    try {
      const response = await fetch(`/api/users/${userId}/funds`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ funds: budget })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update bidder budget');
      }
      
      setBidSuccess(`Updated budget for user successfully`);
    } catch (err) {
      setError('Failed to set budget for user');
      console.error(err);
    }
  };

  // Function to start the auction
  const startAuction = async () => {
    if (!auction || !isAdmin()) return;
    
    try {
      // Update auction status in the database
      const response = await fetch(`/api/auctions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'active' })
      });

      if (!response.ok) {
        throw new Error('Failed to start auction');
      }

      setAuctionStarted(true);
      setCountdown(3);
      
      // Countdown from 3 to 1
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setTimer(15); // Start the 15-second timer after countdown
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError('Failed to start auction');
      console.error(err);
    }
  };

  // Function to end the auction (creator only)
  const endAuction = async () => {
    // Check if user is the creator of the auction
    if (!auction || !user || user._id !== auction.creatorId) {
      console.error('Cannot end auction: User is not the creator');
      setError('Only the auction creator can end the auction');
      return;
    }
    
    try {
      // Auto-finalize all players with a highest bid
      const updatedPlayers = await Promise.all(
        auction.players.map(async (player) => {
          if (player.status === 'sold') return player;
          // Fetch highest bid for this player
          const res = await fetch(`/api/bids?auctionId=${id}&playerId=${player._id}&highest=true`);
          const data = await res.json();
          const highestBid = data.bid;
          if (highestBid) {
            return {
              ...player,
              status: 'sold',
              soldTo: highestBid.userId,
              soldToName: highestBid.userName,
              soldAmount: highestBid.amount
            };
          } else {
            return player;
          }
        })
      );
      // Update auction with finalized players
      const updatePlayersResponse = await fetch(`/api/auctions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ players: updatedPlayers })
      });
      if (!updatePlayersResponse.ok) {
        throw new Error('Failed to finalize players');
      }
      // Now set auction status to 'ended'
      const updateStatusResponse = await fetch(`/api/auctions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'ended' })
      });
      if (!updateStatusResponse.ok) {
        throw new Error('Failed to update auction status');
      }
      // Update local state to show ended status and new players
      setAuctionEnded(true);
      setAuction(prev => ({ ...prev, status: 'ended', players: updatedPlayers }));
      setBidSuccess('Auction ended successfully. Teams are now visible below.');
    } catch (err) {
      console.error('Error ending auction:', err);
      setError(err.message || 'Failed to end auction');
    }
  };

  // Show balance for bidders only (not creator)
  let showBalance = false;
  let userBalance = 0;
  if (auction && user) {
    showBalance = isBidder() && user._id !== auction.creatorId;
    userBalance = user.funds || 0;
  }

  // If user is a bidder (not creator), ensure their funds are set to the auction's bidderBudget
  useEffect(() => {
    if (
      !hasSyncedFunds &&
      auction &&
      user &&
      isBidder() &&
      user._id !== auction.creatorId
    ) {
      const joinAuctionAndSyncFunds = async () => {
        try {
          const res = await fetch(`/api/auctions/${id}/bidders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user._id })
          });
          const data = await res.json();

          if (res.ok && data.funds !== undefined) {
            if (typeof updateFunds === 'function') {
              await updateFunds(data.funds);
              setHasSyncedFunds(true);
            }
          } else if (res.ok && data.message === "User already a bidder") {
            if (data.funds !== undefined && typeof updateFunds === 'function') {
              await updateFunds(data.funds);
            }
            setHasSyncedFunds(true);
          } else if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error('Failed to join auction or sync funds:', data.message || errorData.message || 'Unknown error');
          }
        } catch (err) {
          console.error('Error in joinAuctionAndSyncFunds:', err);
        }
      };
      joinAuctionAndSyncFunds();
    }
  }, [auction, user, isBidder, id, updateFunds, hasSyncedFunds]);

  if (loading) {
    return (
      <div>
        <AuthenticatedNavbar />
        <div className="container mx-auto py-24 text-center">
          <p>Loading auction data...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <AuthenticatedNavbar />
        <div className="container mx-auto py-24 text-center">
          <p className="text-red-500">{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!auction || !user) {
    return null;
  }

  const currentPlayer = auction.players[currentPlayerIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <AuthenticatedNavbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Countdown Display */}
        {countdown && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="text-white text-9xl font-bold animate-pulse">
              {countdown}
            </div>
          </div>
        )}

        {/* Show balance for bidders only */}
        {showBalance && (
          <div className="mb-6 max-w-md mx-auto bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="mb-2">
              <span className="text-green-800 font-medium">Auction Budget: </span>
              <span className="text-green-700 font-bold text-xl">${auction.bidderBudget}</span>
            </div>
            <div>
              <span className="text-green-800 font-medium">Your Balance: </span>
              <span className="text-green-700 font-bold text-xl">${user.funds}</span>
            </div>
          </div>
        )}
        {/* Auction Ended: Show Team List */}
        {auctionEnded ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center min-h-[60vh] flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-4">Auction Ended</h2>
              <h3 className="text-xl font-semibold mb-6">Teams</h3>
              {/* Teams grouped by winner name (soldToName) */}
              {(() => {
                // Build a map: winner name -> array of players
                const winnerMap = {};
                auction.players
                  .filter(player => player.status === 'sold' && player.soldToName)
                  .forEach(player => {
                    if (!winnerMap[player.soldToName]) winnerMap[player.soldToName] = [];
                    winnerMap[player.soldToName].push(player);
                  });
                const winnerNames = Object.keys(winnerMap);
                return (
                  <div className="flex flex-col gap-8 items-center">
                    {winnerNames.length > 0 ? (
                      winnerNames.map(winner => (
                        <div key={winner} className="border rounded-lg px-8 py-6 w-full max-w-md flex flex-col items-center min-h-[180px]">
                          <div className="w-full flex flex-col items-center mb-2">
                            <h4 className="font-semibold text-lg text-center tracking-wide py-3">{winner}</h4>
                            <hr className="w-full mb-4" />
                          </div>
                          <ul className="w-full mb-4 min-h-[40px] gap-2 flex flex-col pl-0">
                            {winnerMap[winner].map(player => (
                              <li key={player._id} className="flex items-center justify-between w-full" style={{ listStyle: 'none' }}>
                                <span className="flex items-center">
                                  <span className="inline-block w-2 h-2 rounded-full bg-black mr-3"></span>
                                  <span className="font-medium">{player.name}</span>
                                </span>
                                <span className="ml-4">(${player.soldAmount})</span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-auto text-sm text-gray-600 w-full text-right">
                            <span className="font-semibold">Total Spent:</span> ${winnerMap[winner].reduce((sum, player) => sum + (player.soldAmount || 0), 0)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No players were sold in this auction.</p>
                    )}
                  </div>
                );
              })()}
              {/* Unsold Players Section */}
              <div className="mt-12">
                <h3 className="text-lg font-semibold mb-2">Unsold Players</h3>
                {auction.players.filter(player => player.status !== 'sold').length > 0 ? (
                  <ul className="list-disc list-inside text-left inline-block">
                    {auction.players.filter(player => player.status !== 'sold').map(player => (
                      <li key={player._id} className="mb-2">
                        <span className="font-medium">{player.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No unsold players.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Side - Bidders List (Admin Only) */}
            {user._id === auction.creatorId && (
              <div className="col-span-3">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Bidders ({bidders.length})</h2>
                  {bidders.length > 0 ? (
                    <div className="space-y-4">
                      {bidders.map((bidder) => (
                        <div 
                          key={bidder._id} 
                          className="p-3 rounded-lg bg-gray-50"
                        >
                          <p className="font-medium">{bidder.name}</p>
                          <p className="text-sm text-gray-500">Balance: ${bidder.funds || 0}</p>
                          <p className="text-sm text-gray-500">Joined: {bidder.joinedAt ? new Date(bidder.joinedAt).toLocaleDateString() : ''}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>No bidders have joined yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Middle - Current Player and Bidding */}
            <div className={`${user._id === auction.creatorId ? 'col-span-6' : 'col-span-9'}`}>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">{auction.name}</h1>
                  {/* Only creator can see navigation and auction controls */}
                  {user._id === auction.creatorId && (
                    <div className="flex space-x-2">
                      <button
                        onClick={previousPlayer}
                        disabled={currentPlayerIndex === 0 || !auctionStarted}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={nextPlayer}
                        disabled={currentPlayerIndex === auction.players.length - 1 || !auctionStarted}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
                      >
                        Next
                      </button>
                      {!auctionStarted ? (
                        <button
                          onClick={startAuction}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Start Auction
                        </button>
                      ) : (
                        <button
                          onClick={endAuction}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          End Auction
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {/* Bidding Timer */}
                <div className="flex justify-center mb-4">
                  <div className="bg-indigo-100 text-indigo-800 px-6 py-2 rounded-full text-lg font-semibold">
                    Time left to bid: {timer}s
                  </div>
                </div>
                {/* Current Player Card */}
                <div className="bg-indigo-50 rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Current Player</h2>
                  {auction.players && auction.players[currentPlayerIndex] ? (
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{auction.players[currentPlayerIndex].name}</h3>
                      <p className="text-gray-600 mb-4">{auction.players[currentPlayerIndex].description}</p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Base Price</p>
                          <p className="font-semibold">${auction.players[currentPlayerIndex].basePrice || auction.baseValue}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Current Highest Bid</p>
                          <p className="font-semibold">
                            ${bids.find(b => b.playerId === auction.players[currentPlayerIndex]._id)?.amount || 
                              auction.players[currentPlayerIndex].basePrice || 
                              auction.baseValue}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">No player selected</p>
                  )}
                </div>

                {/* Bidding Form - Only show to bidders who are not the auction creator */}
                {isBidder() && user._id !== auction.creatorId && (
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Place Your Bid</h3>
                    {!auctionStarted ? (
                      <div className="text-center py-4">
                        <p className="text-gray-600">Waiting for auction to start...</p>
                      </div>
                    ) : (
                      <form onSubmit={(e) => { e.preventDefault(); placeBid(); }} className="space-y-4">
                        <div>
                          <p className="input-label">Bid Amount ($)</p>
                          <input
                            type="number"
                            id="bidAmount"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            min={auction.players[currentPlayerIndex]?.basePrice || auction.baseValue}
                            step="1"
                            disabled={timer === 0}
                          />
                        </div>
                        {bidError && <p className="text-red-500 text-sm">{bidError}</p>}
                        {bidSuccess && <p className="text-green-500 text-sm">{bidSuccess}</p>}
                        <button
                          type="submit"
                          disabled={bidding || timer === 0}
                          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {bidding ? 'Placing Bid...' : 'Place Bid'}
                        </button>
                        {timer === 0 && (
                          <p className="text-red-500 text-sm text-center mt-2">Bidding time is over for this player.</p>
                        )}
                      </form>
                    )}
                  </div>
                )}
                
                {/* Message for auction creator */}
                {user._id === auction.creatorId && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-yellow-800">As the auction creator, you cannot place bids.</p>
                  </div>
                )}
              </div>

              {/* Bid History */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Bid History</h2>
                <div className="space-y-2">
                  {bids
                    .filter(bid => bid.playerId === auction.players[currentPlayerIndex]?._id)
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .map((bid) => (
                      <div key={bid._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{bid.userName}</p>
                          <p className="text-sm text-gray-500">{new Date(bid.timestamp).toLocaleString()}</p>
                        </div>
                        <p className="font-semibold text-indigo-600">${bid.amount}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Right Side - Auction Code and Info */}
            <div className="col-span-3">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Auction Code</h2>
                <div className="bg-indigo-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-indigo-600">{auction.code}</p>
                  <p className="text-sm text-gray-500 mt-2">Share this code to invite bidders</p>
                </div>
              </div>

              {/* Auction Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Auction Info</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">{auction.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Base Value</p>
                    <p className="font-medium">${auction.baseValue}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Players Remaining</p>
                    <p className="font-medium">{auction.players?.length - currentPlayerIndex}</p>
                  </div>
                  {isAdmin() && (
                    <div className="pt-4 border-t">
                      <button
                        onClick={finalizePlayer}
                        className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Finalize Current Player
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}