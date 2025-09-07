import React, { createContext, useContext, useEffect, useState } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    console.log('📍 Fetching user');
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
        const res = await fetch(`${API_BASE_URL}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('📍 /me response status:', res.status);
        
        if (res.ok) {
            const data = await res.json();
            console.log('✅ User fetched:', data);
            setUser(data.user);
        } else {
            console.log('❌ No user found');
            setUser(null);
            localStorage.removeItem('token'); // Clear invalid token
        }
    } catch (error) {
        console.error('💥 Error fetching user:', error);
        setUser(null);
        localStorage.removeItem('token'); // Clear token on error
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  interface LoginResponse {
    token: string;
    user: User;
    message: string;
  }

  const login = async (email: string, password: string) => {
    console.log('📍 Login attempt started');
    setLoading(true);
    try {
        const res = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        console.log('📍 Login response status:', res.status);
        
        if (res.ok) {
            const data: LoginResponse = await res.json();
            localStorage.setItem('token', data.token);
            setUser(data.user);
            setLoading(false);
            return true;
        } else {
            const error = await res.json();
            console.log('❌ Login failed:', error);
            setLoading(false);
            return false;
        }
    } catch (error) {
        console.error('💥 Login error:', error);
        setLoading(false);
        return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    localStorage.removeItem('token'); // Remove token on logout
    setUser(null);
    setLoading(false);
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};