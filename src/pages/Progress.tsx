import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Calendar, TrendingUp, Award, Star, Zap, BookOpen, Brain, Dumbbell, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface ProgressStats {
  totalCourses: number;
  completedCourses: number;
  totalQuizzes: number;
  averageScore: number;
  currentStreak: number;
  totalPoints: number;
  skillsCompleted: {
    meditation: number;
    workout: number;
    reading: number;
  };
  weeklyProgress: Array<{
    date: string;
    points: number;
    skillsCompleted: number;
  }>;
}

const Progress: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProgressStats>({
    totalCourses: 0,
    completedCourses: 0,
    totalQuizzes: 0,
    averageScore: 0,
    currentStreak: 0,
    totalPoints: 0,
    skillsCompleted: { meditation: 0, workout: 0, reading: 0 },
    weeklyProgress: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      if (user.isGuest) {
        loadGuestStats();
      } else {
        fetchProgressStats();
      }
    }
  }, [user]);

  const loadGuestStats = () => {
    // Mock data for guest users
    setStats({
      totalCourses: 3,
      completedCourses: 1,
      totalQuizzes: 5,
      averageScore: 78,
      currentStreak: 3,
      totalPoints: 150,
      skillsCompleted: { meditation: 5, workout: 3, reading: 4 },
      weeklyProgress: [
        { date: '2024-01-01', points: 20, skillsCompleted: 2 },
        { date: '2024-01-02', points: 30, skillsCompleted: 3 },
        { date: '2024-01-03', points: 25, skillsCompleted: 1 },
        { date: '2024-01-04', points: 40, skillsCompleted: 3 },
        { date: '2024-01-05', points: 35, skillsCompleted: 2 },
      ]
    });
    setLoading(false);
  };

  const fetchProgressStats = async () => {
    if (!user || user.isGuest) return;

    try {
      // Fetch course stats
      const { data: courses } = await supabase
        .from('courses')
        .select('progress')
        .eq('user_id', user.id);

      const totalCourses = courses?.length || 0;
      const completedCourses = courses?.filter(c => c.progress >= 100).length || 0;

      // Fetch daily skills stats
      const { data: skills } = await supabase
        .from('daily_skills')
        .select('skill_type, completed')
        .eq('user_id', user.id)
        .eq('completed', true);

      const skillsCompleted = {
        meditation: skills?.filter(s => s.skill_type === 'meditation').length || 0,
        workout: skills?.filter(s => s.skill_type === 'workout').length || 0,
        reading: skills?.filter(s => s.skill_type === 'reading').length || 0,
      };

      setStats({
        totalCourses,
        completedCourses,
        totalQuizzes: totalCourses * 2, // Estimate
        averageScore: 85, // Mock for now
        currentStreak: user.streak_days,
        totalPoints: user.total_points,
        skillsCompleted,
        weeklyProgress: [] // Mock for now
      });
    } catch (error) {
      console.error('Error fetching progress stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankProgress = () => {
    const ranks = ['Youngling', 'Padawan', 'Knight', 'Master'];
    const currentIndex = ranks.indexOf(user?.jedi_rank || 'Youngling');
    const nextRank = ranks[currentIndex + 1];
    const progress = Math.min((stats.totalPoints / (1000 * (currentIndex + 1))) * 100, 100);
    
    return { nextRank, progress };
  };

  const getAchievements = () => {
    const achievements = [];
    
    if (stats.currentStreak >= 7) {
      achievements.push({ name: 'Week Warrior', icon: Calendar, color: '#10B981' });
    }
    if (stats.completedCourses >= 1) {
      achievements.push({ name: 'First Steps', icon: BookOpen, color: '#3CA7E0' });
    }
    if (stats.skillsCompleted.meditation >= 5) {
      achievements.push({ name: 'Mindful Master', icon: Brain, color: '#8B5CF6' });
    }
    if (stats.skillsCompleted.workout >= 5) {
      achievements.push({ name: 'Force Strong', icon: Dumbbell, color: '#F59E0B' });
    }
    if (stats.totalPoints >= 100) {
      achievements.push({ name: 'Point Collector', icon: Star, color: '#EF4444' });
    }
    
    return achievements;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E1E8F0] pl-64 pt-16">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3CA7E0]"></div>
        </div>
      </div>
    );
  }

  const { nextRank, progress } = getRankProgress();
  const achievements = getAchievements();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E1E8F0] pl-64 pt-16">
      <div className="max-w-7xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#2E3A59] mb-4 flex items-center space-x-3">
            <Trophy className="h-8 w-8 text-[#3CA7E0]" />
            <span>Your Jedi Progress</span>
            {user?.isGuest && (
              <span className="text-sm bg-[#5ED3F3] text-white px-3 py-1 rounded-full">
                Demo Mode
              </span>
            )}
          </h1>
          <p className="text-[#BFC9D9] text-lg">
            Track your journey from Youngling to Jedi Master
          </p>
          
          {user?.isGuest && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-700 font-medium">Demo Progress Tracking</p>
                <p className="text-sm text-blue-600 mt-1">
                  You're viewing demo progress data. Create an account to track your real achievements and progress.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Rank Progress */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 border border-[#CBD5E1]"
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-[#2E3A59] mb-4">Jedi Rank</h3>
              <div className="w-32 h-32 mx-auto mb-4">
                <CircularProgressbar
                  value={progress}
                  text={`${Math.round(progress)}%`}
                  styles={buildStyles({
                    pathColor: '#3CA7E0',
                    textColor: '#2E3A59',
                    trailColor: '#F3F4F6',
                    strokeLinecap: 'round',
                  })}
                />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-[#3CA7E0]">{user?.jedi_rank}</p>
                {nextRank && (
                  <p className="text-sm text-[#BFC9D9]">
                    Next: {nextRank}
                  </p>
                )}
                <p className="text-xs text-[#BFC9D9]">
                  {stats.totalPoints} / {1000 * ((['Youngling', 'Padawan', 'Knight', 'Master'].indexOf(user?.jedi_rank || 'Youngling') + 1))} points
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-[#CBD5E1]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#2E3A59]">Learning Progress</h3>
                <BookOpen className="h-6 w-6 text-[#3CA7E0]" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-[#BFC9D9]">Courses Completed</span>
                  <span className="text-sm font-semibold text-[#2E3A59]">
                    {stats.completedCourses}/{stats.totalCourses}
                  </span>
                </div>
                <div className="w-full bg-[#F3F4F6] rounded-full h-2">
                  <div 
                    className="bg-[#3CA7E0] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.totalCourses > 0 ? (stats.completedCourses / stats.totalCourses) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[#BFC9D9]">
                  <span>Quizzes Taken: {stats.totalQuizzes}</span>
                  <span>Avg Score: {stats.averageScore}%</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-[#CBD5E1]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#2E3A59]">Daily Skills</h3>
                <Target className="h-6 w-6 text-[#10B981]" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#BFC9D9]">Meditation</span>
                  <span className="text-sm font-semibold text-[#2E3A59]">{stats.skillsCompleted.meditation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#BFC9D9]">Workout</span>
                  <span className="text-sm font-semibold text-[#2E3A59]">{stats.skillsCompleted.workout}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#BFC9D9]">Reading</span>
                  <span className="text-sm font-semibold text-[#2E3A59]">{stats.skillsCompleted.reading}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-[#CBD5E1]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#2E3A59]">Current Streak</h3>
                <Zap className="h-6 w-6 text-[#F59E0B]" />
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#F59E0B] mb-2">{stats.currentStreak}</p>
                <p className="text-sm text-[#BFC9D9]">days in a row</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-[#CBD5E1]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#2E3A59]">Total Points</h3>
                <Star className="h-6 w-6 text-[#8B5CF6]" />
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-[#8B5CF6] mb-2">{stats.totalPoints}</p>
                <p className="text-sm text-[#BFC9D9]">Force points earned</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-[#CBD5E1] mb-8"
        >
          <h3 className="text-lg font-semibold text-[#2E3A59] mb-6 flex items-center space-x-2">
            <Award className="h-6 w-6 text-[#3CA7E0]" />
            <span>Achievements Unlocked</span>
          </h3>
          
          {achievements.length > 0 ? (
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="text-center p-4 rounded-lg border-2 border-dashed"
                  style={{ borderColor: achievement.color + '40', backgroundColor: achievement.color + '10' }}
                >
                  <achievement.icon 
                    className="h-8 w-8 mx-auto mb-2" 
                    style={{ color: achievement.color }}
                  />
                  <p className="text-sm font-medium text-[#2E3A59]">{achievement.name}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-[#BFC9D9] mx-auto mb-4" />
              <p className="text-[#BFC9D9]">Complete more activities to unlock achievements!</p>
            </div>
          )}
        </motion.div>

        {/* Motivational Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gradient-to-r from-[#3CA7E0] to-[#5ED3F3] rounded-xl shadow-lg p-8 text-white text-center"
        >
          <blockquote className="text-lg italic mb-4">
            "Do or do not, there is no try. Your focus determines your reality."
          </blockquote>
          <p className="text-sm opacity-80">- Master Yoda</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Progress;