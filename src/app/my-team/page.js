"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthenticatedNavbar from "@/components/AuthenticatedNavbar";
import Footer from "@/components/Footer";

export default function MyTeamPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teamByAuction, setTeamByAuction] = useState({});
  const [expandedAuction, setExpandedAuction] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) return;
    const fetchTeam = async () => {
      setLoading(true);
      try {
        // Fetch all auctions
        const res = await fetch("/api/auctions");
        const data = await res.json();
        if (!res.ok || !data.auctions) {
          setError("Failed to fetch auctions");
          setLoading(false);
          return;
        }
        // Group players by auction
        const grouped = {};
        data.auctions.forEach((auction) => {
          const myPlayers = (auction.players || []).filter(
            (player) => player.soldTo === user._id
          );
          if (myPlayers.length > 0) {
            grouped[auction._id] = {
              auctionName: auction.name,
              players: myPlayers,
            };
          }
        });
        setTeamByAuction(grouped);
      } catch (err) {
        setError("Failed to load your team");
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [user, isAuthenticated]);

  if (!isAuthenticated()) {
    return (
      <div>
        <AuthenticatedNavbar />
        <div className="container mx-auto py-24 text-center">
          <p>Please log in to view your team.</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <AuthenticatedNavbar />
        <div className="container mx-auto py-24 text-center">
          <p>Loading your team...</p>
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

  const auctionIds = Object.keys(teamByAuction);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <AuthenticatedNavbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Auction History</h1>
        {auctionIds.length === 0 ? (
          <div className="text-center text-gray-500">You have not won any players yet.</div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {auctionIds.map((auctionId) => {
              const auction = teamByAuction[auctionId];
              return (
                <div key={auctionId} className="bg-white rounded-lg shadow-md">
                  <button
                    className="w-full text-left px-6 py-4 font-semibold text-lg border-b rounded-t-lg focus:outline-none flex justify-between items-center"
                    onClick={() => setExpandedAuction(expandedAuction === auctionId ? null : auctionId)}
                  >
                    <span>{auction.auctionName}</span>
                    <span className="text-sm text-gray-500">{expandedAuction === auctionId ? "▲" : "▼"}</span>
                  </button>
                  {expandedAuction === auctionId && (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {auction.players.map((player, idx) => (
                          <div key={player._id + '-' + idx} className="bg-gray-50 rounded-lg p-4 flex flex-col items-center border">
                            {player.image && (
                              <img src={player.image} alt={player.name} className="w-20 h-20 object-cover rounded-full mb-2" />
                            )}
                            <h2 className="text-lg font-semibold mb-1">{player.name}</h2>
                            <p className="text-gray-600 mb-1">Price: <span className="font-bold">${player.soldAmount}</span></p>
                            {player.description && <p className="text-gray-500 text-sm mb-1 text-center">{player.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
} 