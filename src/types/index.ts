export interface User {
  id: string;
  email: string;
  name: string;
  jedi_rank: JediRank;
  total_points: number;
  streak_days: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
  isGuest?: boolean;
}

export type JediRank = 'Youngling' | 'Padawan' | 'Knight' | 'Master';

export interface Course {
  id: string;
  user_id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface DailySkill {
  id: string;
  user_id: string;
  skill_type: SkillType;
  completed: boolean;
  date: string;
  created_at: string;
}

export type SkillType = 'meditation' | 'workout' | 'reading';

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface JediMascotMessage {
  text: string;
  type: 'encouragement' | 'achievement' | 'reminder' | 'wisdom';
}