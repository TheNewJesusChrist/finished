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
          if (session?.user) {
            await fetchUserProfile(session.user.id);
          } else {
            setUser(null);
            setLoading(false);
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
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.session?.user) {
        console.log('Login successful:', data.session.user.id);
        await fetchUserProfile(data.session.user.id);
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
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      if (data.user) {
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
          throw profileError;
        }

        console.log('Sign up + profile creation successful');
        await fetchUserProfile(data.user.id);
        return { success: true };
      }
      return { success: false, error: 'No user returned' };
    } catch (error: any) {
      console.error('Sign up error:', error);
      setUser(null);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setLoading(false);
      console.log('Sign out successful');
      
      // Force a page reload to clear any cached state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
};