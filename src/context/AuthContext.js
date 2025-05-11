'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Optionally refresh user data from the server
        if (parsedUser && parsedUser._id) {
          fetch(`/api/users/${parsedUser._id}`)
            .then(res => res.json())
            .then(freshUserData => {
              if (freshUserData && !freshUserData.error) {
                setUser(freshUserData);
                localStorage.setItem('user', JSON.stringify(freshUserData));
              }
            })
            .catch(err => console.error('Failed to refresh user data:', err));
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
        return { success: true, user: result.user };
      }
      
      return { success: false, error: result.error || 'Invalid credentials' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
        return { success: true, user: result.user };
      }
      
      return { success: false, error: result.error || 'Failed to create account' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/');
  };

  const isAuthenticated = () => {
    return !!user;
  };
  
  const isAdmin = () => {
    return user && user.role === 'admin';
  };
  
  const isBidder = () => {
    return user && user.role === 'bidder';
  };

  const updateFunds = async (newFunds) => {
    if (user && user._id) {
      try {
        const response = await fetch(`/api/users/${user._id}/funds`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ funds: newFunds })
        });
        
        const updatedUser = await response.json();
        
        if (response.ok && !updatedUser.error) {
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to update funds:', error);
        return false;
      }
    }
    return false;
  };

  const addPlayer = (player) => {
    if (user) {
      const updatedPlayers = [...(user.players || []), player];
      const updatedUser = { ...user, players: updatedPlayers };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Optionally update on server
      if (user._id) {
        fetch(`/api/users/${user._id}/players`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ player })
        }).catch(err => console.error('Failed to update player on server:', err));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      logout,
      isAuthenticated,
      isAdmin,
      isBidder,
      updateFunds,
      addPlayer
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 