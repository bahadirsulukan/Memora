import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase, API_BASE_URL, publicAnonKey } from '../utils/supabase-client';
import { toast } from 'sonner';

// ============================================
// TYPES
// ============================================
interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signup: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ============================================
// CONTEXT
// ============================================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// ============================================
// PROVIDER
// ============================================
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ============================================
  // CHECK SESSION ON MOUNT
  // ============================================
  useEffect(() => {
    checkSession();
  }, []);

  // Debug: Log user state changes
  useEffect(() => {
    console.log('🔄 User state changed:', user ? `${user.name} (${user.email})` : 'null');
    console.log('🔑 isAuthenticated:', !!user);
  }, [user]);

  async function checkSession() {
    try {
      console.log('🔍 Checking session...');
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('✅ Session found:', session.user.email);
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'User',
        });
      } else {
        console.log('ℹ️ No session found');
      }
    } catch (error) {
      console.error('❌ Session check error:', error);
    } finally {
      setLoading(false);
    }
  }

  // ============================================
  // SIGNUP
  // ============================================
  async function signup(email: string, password: string, name: string) {
    try {
      console.log('📝 Signup:', email);

      // Call backend to create user with email_confirm: true
      const response = await fetch(
        `${API_BASE_URL}/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password, name }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      console.log('✅ User created, now logging in...');

      // Now login with the credentials
      const { data: loginData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!loginData.user) {
        throw new Error('Login after signup failed');
      }

      console.log('✅ Login successful after signup');

      // Set user state
      const newUser = {
        id: loginData.user.id,
        email: loginData.user.email || '',
        name: loginData.user.user_metadata?.name || 'User',
      };
      
      console.log('👤 Setting user state:', newUser);
      setUser(newUser);
      
      toast.success(`Welcome to ROUTES, ${name}!`);

    } catch (error: any) {
      console.error('❌ Signup error:', error);
      toast.error(error.message || 'Signup failed');
      throw error;
    }
  }

  // ============================================
  // LOGIN
  // ============================================
  async function login(email: string, password: string) {
    try {
      console.log('🔐 Login:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Login failed');
      }

      console.log('✅ Login successful');

      const newUser = {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || 'User',
      };
      
      console.log('👤 Setting user state:', newUser);
      setUser(newUser);

      toast.success('Welcome back!');

    } catch (error: any) {
      console.error('❌ Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    }
  }

  // ============================================
  // LOGOUT
  // ============================================
  async function logout() {
    try {
      console.log('👋 Logging out...');
      
      await supabase.auth.signOut();
      setUser(null);
      
      toast.success('Logged out');
      navigate('/login');

    } catch (error: any) {
      console.error('❌ Logout error:', error);
      toast.error('Logout failed');
    }
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}