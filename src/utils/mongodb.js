// This file would normally contain actual MongoDB connection code
// For this demo, we'll simulate MongoDB functionality

import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import User from '@/models/User';
import Auction from '@/models/Auction';
import Bid from '@/models/Bid';
import bcrypt from 'bcryptjs';

// Check if we're on the server side
const isServer = typeof window === 'undefined';

// Mock database in memory
const db = {
  auctions: [],
  bids: [],
  users: []
};

// Generate a random ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Generate a random auction code (6 characters)
const generateAuctionCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Server-side wrapper function
const serverOnly = async (operation) => {
  if (!isServer) {
    console.warn('Attempting to run server-only MongoDB operation from browser. Operation skipped.');
    return null;
  }
  return operation();
};

// Auction functions
export const createAuction = async (auctionData) => {
  return serverOnly(async () => {
    await connectToDatabase();
    
    const newAuction = new Auction({
      code: generateAuctionCode(),
      ...auctionData,
      status: 'active',
      currentPlayerIndex: 0
    });
    
    await newAuction.save();
    return newAuction;
  });
};

export const getAuctions = async (publicOnly = false) => {
  return serverOnly(async () => {
    await connectToDatabase();
    
    const query = publicOnly ? { isPublic: true } : {};
    return await Auction.find(query).sort({ createdAt: -1 });
  });
};

export const getAuctionById = async (id) => {
  return serverOnly(async () => {
    await connectToDatabase();
    
    try {
      const auction = await Auction.findById(id);
      return auction;
    } catch (error) {
      console.error('Error getting auction by ID:', error);
      return null;
    }
  });
};

export const updateAuction = async (id, updateData) => {
  return serverOnly(async () => {
    await connectToDatabase();
    
    try {
      const auction = await Auction.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );
      return auction;
    } catch (error) {
      console.error('Error updating auction:', error);
      return null;
    }
  });
};

export const deleteAuction = async (id) => {
  return serverOnly(async () => {
    await connectToDatabase();
    
    try {
      const auction = await Auction.findByIdAndDelete(id);
      return auction;
    } catch (error) {
      console.error('Error deleting auction:', error);
      return null;
    }
  });
};

// Get auction by code
export const getAuctionByCode = async (code) => {
  return serverOnly(async () => {
    await connectToDatabase();
    
    try {
      const auction = await Auction.findOne({ code });
      return auction;
    } catch (error) {
      console.error('Error getting auction by code:', error);
      return null;
    }
  });
};

// Bid functions
export const createBid = async (bidData) => {
  return serverOnly(async () => {
    await connectToDatabase();
    
    const newBid = new Bid(bidData);
    await newBid.save();
    return newBid;
  });
};

export const getBidsByAuctionId = async (auctionId) => {
  return serverOnly(async () => {
    await connectToDatabase();
    
    try {
      const bids = await Bid.find({ auctionId }).sort({ timestamp: -1 });
      return bids;
    } catch (error) {
      console.error('Error getting bids by auction ID:', error);
      return [];
    }
  });
};

export const getBidsByPlayer = async (auctionId, playerId) => {
  return serverOnly(async () => {
    await connectToDatabase();
    
    try {
      const bids = await Bid.find({ auctionId, playerId }).sort({ amount: -1 });
      return bids;
    } catch (error) {
      console.error('Error getting bids by player:', error);
      return [];
    }
  });
};

export const getHighestBidForPlayer = async (auctionId, playerId) => {
  return serverOnly(async () => {
    await connectToDatabase();
    
    try {
      const highestBid = await Bid.findOne({ auctionId, playerId }).sort({ amount: -1 });
      return highestBid;
    } catch (error) {
      console.error('Error getting highest bid for player:', error);
      return null;
    }
  });
};

// User functions
export const createUser = async (userData) => {
  return serverOnly(async () => {
    await connectToDatabase();
    
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      const newUser = new User(userData);
      await newUser.save();
      
      // Return user without password
      const user = newUser.toObject();
      delete user.password;
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  });
};

export const getUserById = async (id) => {
  return serverOnly(async () => {
    await connectToDatabase();
    
    try {
      const user = await User.findById(id);
      if (!user) return null;
      
      // Return user without password
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  });
};

export const getUserByEmail = async (email) => {
  return serverOnly(async () => {
    await connectToDatabase();
    
    try {
      return await User.findOne({ email });
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  });
};

export const authenticateUser = async (email, password) => {
  return serverOnly(async () => {
    await connectToDatabase();
    
    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      // Block login if not verified
      if (!user.verified) {
        return { success: false, message: 'Email not verified. Please check your inbox.' };
      }
      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return { success: false, message: 'Invalid password' };
      }
      
      // Return user without password
      const userObj = user.toObject();
      delete userObj.password;
      
      return { 
        success: true, 
        user: userObj
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, message: 'Authentication failed' };
    }
  });
};

export const updateUser = async (id, updateData) => {
  return serverOnly(async () => {
    await connectToDatabase();
    
    try {
      // If updating password, hash it
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      }
      
      const user = await User.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );
      
      // Return user without password
      if (user) {
        const userObj = user.toObject();
        delete userObj.password;
        return userObj;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  });
};

export const updateUserFunds = async (id, newFunds) => {
  return serverOnly(async () => {
    await connectToDatabase();
    
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { $set: { funds: newFunds } },
        { new: true }
      );
      
      // Return user without password
      if (user) {
        const userObj = user.toObject();
        delete userObj.password;
        return userObj;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating user funds:', error);
      return null;
    }
  });
};

export const setBidderBudget = async (auctionId, userId, budget) => {
  return serverOnly(async () => {
    await connectToDatabase();
    
    try {
      // First update the auction's bidderBudget field
      const auction = await Auction.findByIdAndUpdate(
        auctionId,
        { $set: { bidderBudget: budget } },
        { new: true }
      );
      
      // Then set the user's funds to the specified budget
      if (auction) {
        const user = await User.findByIdAndUpdate(
          userId,
          { $set: { funds: budget } },
          { new: true }
        );
        
        if (user) {
          const userObj = user.toObject();
          delete userObj.password;
          return { success: true, auction, user: userObj };
        }
      }
      
      return { success: false, message: 'Failed to update budget' };
    } catch (error) {
      console.error('Error setting bidder budget:', error);
      return { success: false, message: error.message };
    }
  });
};

// Initialize with some sample data
const initializeDb = () => {
  // Add sample users
  if (db.users.length === 0) {
    db.users.push({
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      funds: 5000,
      players: [],
      createdAt: new Date().toISOString()
    });
    
    db.users.push({
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      funds: 5000,
      players: [],
      createdAt: new Date().toISOString()
    });
  }
};

// Call initialization
initializeDb();

export default db; 