import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const getSession = async () => {
      try {
        console.log('Getting initial session...');

        timeoutId = setTimeout(() => {
          if (mounted) {
            console.log('Session check timeout - proceeding without session');
            setUser(null);
            setLoading(false);
          }
        }, 10000); // 10 seconds fallback

        const { data: { session }, error } = await supabase.auth.getSession();

        clearTimeout(timeoutId);

        if (!mounted) return;

        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('Session found, fetching profile...');
          await fetchUserProfile(session.user.id);
        } else {
          console.log('No session found');
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Session error:', error);
        clearTimeout(timeoutId);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, session?.user?.id);

        try {
          if (event === 'SIGNED_OUT' || !session?.user) {
            console.log('User signed out or session ended');
            setUser(null);
            setLoading(false);
            return;
          }

          if (event === 'SIGNED_IN' && session?.user) {
            console.log('User signed in, fetching profile...');
            await fetchUserProfile(session.user.id);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);

        if (error.code === 'PGRST116') {
          console.log('Profile not found, user needs to complete registration');
        }

        setUser(null);
        setLoading(false);
        return;
      }

      console.log('Profile fetched successfully:', data);
      setUser(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting sign in process...');
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        setLoading(false);
        
        // Provide more user-friendly error messages
        let userFriendlyMessage = error.message;
        
        if (error.message === 'Invalid login credentials') {
          userFriendlyMessage = 'The email or password you entered is incorrect. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          userFriendlyMessage = 'Please check your email and confirm your account before signing in.';
        } else if (error.message.includes('Too many requests')) {
          userFriendlyMessage = 'Too many login attempts. Please wait a moment before trying again.';
        }
        
        const enhancedError = new Error(userFriendlyMessage);
        enhancedError.name = error.name;
        throw enhancedError;
      }

      if (data?.session?.user) {
        console.log('Login successful, session created:', data.session.user.id);
        // Don't manually fetch profile here - let the auth state change handler do it
        // This prevents race conditions and duplicate loading states
        return { success: true };
      } else {
        console.log('Login returned no session');
        setUser(null);
        setLoading(false);
        return { success: false, error: 'No session returned' };
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      setUser(null);
      setLoading(false);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log('Starting sign up process...');
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign up error:', error);
        setLoading(false);
        
        // Provide more user-friendly error messages for sign up
        let userFriendlyMessage = error.message;
        
        if (error.message.includes('User already registered')) {
          userFriendlyMessage = 'An account with this email already exists. Please try signing in instead.';
        } else if (error.message.includes('Password should be at least')) {
          userFriendlyMessage = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('Invalid email')) {
          userFriendlyMessage = 'Please enter a valid email address.';
        }
        
        const enhancedError = new Error(userFriendlyMessage);
        enhancedError.name = error.name;
        throw enhancedError;
      }

      if (data.user) {
        console.log('Sign up successful, creating profile...');
        
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email,
              name,
              jedi_rank: 'Youngling',
              total_points: 0,
              streak_days: 0,
              last_activity: new Date().toISOString(),
            },
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          setLoading(false);
          
          let userFriendlyMessage = 'Failed to create user profile. Please try again.';
          
          if (profileError.message.includes('duplicate key')) {
            userFriendlyMessage = 'Account already exists. Please try signing in instead.';
          }
          
          const enhancedError = new Error(userFriendlyMessage);
          throw enhancedError;
        }

        console.log('Sign up + profile creation successful');
        // Don't manually fetch profile here - let the auth state change handler do it
        return { success: true };
      }
      
      setLoading(false);
      return { success: false, error: 'No user returned' };
    } catch (error: any) {
      console.error('Sign up error:', error);
      setUser(null);
      setLoading(false);
      throw error;
    }
  };

  const continueAsGuest = () => {
    console.log('Continuing as guest...');
    const guestUser: User = {
      id: 'guest-user',
      email: 'guest@example.com',
      name: 'Guest Jedi',
      jedi_rank: 'Padawan',
      total_points: 150,
      streak_days: 3,
      last_activity: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isGuest: true,
    };
    
    setUser(guestUser);
    setLoading(false);
    return { success: true };
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      
      // If it's a guest user, just clear the state
      if (user?.isGuest) {
        console.log('Guest sign out - clearing state');
        setUser(null);
        setLoading(false);
        
        // Use window.location for immediate redirect
        setTimeout(() => {
          window.location.href = '/auth';
        }, 100);
        return;
      }
      
      // For regular users, sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase sign out error:', error);
        throw error;
      }
      
      // Clear user state immediately
      setUser(null);
      setLoading(false);
      
      console.log('Sign out successful');
      
      // Clear any cached data
      localStorage.removeItem('supabase.auth.token');
      
      // Force redirect to auth page
      setTimeout(() => {
        window.location.href = '/auth';
      }, 100);
      
    } catch (error) {
      console.error('Sign out error:', error);
      
      // Even if there's an error, clear the user state and redirect
      setUser(null);
      setLoading(false);
      
      setTimeout(() => {
        window.location.href = '/auth';
      }, 100);
      
      throw error;
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    continueAsGuest,
  };
};