import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          jedi_rank: string;
          total_points: number;
          streak_days: number;
          last_activity: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          jedi_rank?: string;
          total_points?: number;
          streak_days?: number;
          last_activity?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          jedi_rank?: string;
          total_points?: number;
          streak_days?: number;
          last_activity?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          file_url: string;
          file_type: string;
          progress: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          file_url: string;
          file_type: string;
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          file_url?: string;
          file_type?: string;
          progress?: number;
          updated_at?: string;
        };
      };
      daily_skills: {
        Row: {
          id: string;
          user_id: string;
          skill_type: string;
          completed: boolean;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          skill_type: string;
          completed?: boolean;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          skill_type?: string;
          completed?: boolean;
          date?: string;
        };
      };
    };
  };
};