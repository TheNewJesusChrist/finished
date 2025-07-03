import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Info, Calendar, TrendingUp, Award } from 'lucide-react';
import SkillRings from '../components/Skills/SkillRings';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const Skills: React.FC = () => {
  const { user } = useAuth();
  const [skillStats, setSkillStats] = useState({
    meditation: 0,
    workout: 0,
    reading: 0,
  });
  const [todayCompleted, setTodayCompleted] = useState({
    meditation: false,
    workout: false,
    reading: false,
  });
  const [weeklyStats, setWeeklyStats] = useState({
    thisWeek: 0,
    lastWeek: 0,
    totalThisMonth: 0,
  });

  useEffect(() => {
    if (user) {
      if (user.isGuest) {
        loadGuestSkillData();
      } else {
        fetchSkillStats();
        checkTodayCompletion();
        fetchWeeklyStats();
      }
    }
  }, [user]);

  const loadGuestSkillData = () => {
    // Mock data for guest users
    setSkillStats({
      meditation: 3,
      workout: 5,
      reading: 2,
    });
    
    setTodayCompleted({
      meditation: true,
      workout: false,
      reading: true,
    });

    setWeeklyStats({
      thisWeek: 12,
      lastWeek: 8,
      totalThisMonth: 45,
    });
  };

  const fetchSkillStats = async () => {
    if (!user || user.isGuest) return;

    try {
      const { data, error } = await supabase
        .from('daily_skills')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('date', { ascending: false });

      if (error) throw error;

      // Calculate streaks
      const streaks = {
        meditation: 0,
        workout: 0,
        reading: 0,
      };

      ['meditation', 'workout', 'reading'].forEach(skill => {
        const skillData = data.filter(d => d.skill_type === skill);
        let currentStreak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < skillData.length; i++) {
          const skillDate = new Date(skillData[i].date);
          skillDate.setHours(0, 0, 0, 0);
          
          const diffTime = currentDate.getTime() - skillDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === currentStreak) {
            currentStreak++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else if (diffDays === currentStreak + 1) {
            // Allow for today not being completed yet
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            break;
          }
        }
        
        streaks[skill as keyof typeof streaks] = currentStreak;
      });

      setSkillStats(streaks);
    } catch (error) {
      console.error('Error fetching skill stats:', error);
    }
  };

  const checkTodayCompletion = async () => {
    if (!user || user.isGuest) return;

    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { data, error } = await supabase
        .from('daily_skills')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .eq('completed', true);

      if (error) throw error;

      const completed = {
        meditation: false,
        workout: false,
        reading: false,
      };

      data.forEach(skill => {
        completed[skill.skill_type as keyof typeof completed] = true;
      });

      setTodayCompleted(completed);
    } catch (error) {
      console.error('Error checking today completion:', error);
    }
  };

  const fetchWeeklyStats = async () => {
    if (!user || user.isGuest) return;

    try {
      const today = new Date();
      const thisWeekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const { data, error } = await supabase
        .from('daily_skills')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true)
        .gte('date', monthStart.toISOString().split('T')[0]);

      if (error) throw error;

      const thisWeekCount = data.filter(skill => 
        new Date(skill.date) >= thisWeekStart
      ).length;

      const lastWeekCount = data.filter(skill => {
        const skillDate = new Date(skill.date);
        return skillDate >= lastWeekStart && skillDate < thisWeekStart;
      }).length;

      setWeeklyStats({
        thisWeek: thisWeekCount,
        lastWeek: lastWeekCount,
        totalThisMonth: data.length,
      });
    } catch (error) {
      console.error('Error fetching weekly stats:', error);
    }
  };

  const handleSkillComplete = async (skillType: string) => {
    if (!user) return;

    if (user.isGuest) {
      // For guest users, just update local state
      setTodayCompleted(prev => ({
        ...prev,
        [skillType]: true,
      }));
      
      setSkillStats(prev => ({
        ...prev,
        [skillType]: prev[skillType as keyof typeof prev] + 1,
      }));
      
      toast.success(`${skillType.charAt(0).toUpperCase() + skillType.slice(1)} completed! (Demo mode - create an account to save progress)`);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { error } = await supabase
        .from('daily_skills')
        .upsert([
          {
            user_id: user.id,
            skill_type: skillType,
            date: today,
            completed: true,
          },
        ], {
          onConflict: 'user_id,skill_type,date'
        });

      if (error) throw error;

      // Update local state
      setTodayCompleted(prev => ({
        ...prev,
        [skillType]: true,
      }));

      // Update user points
      const pointsEarned = 10;
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          total_points: user.total_points + pointsEarned,
          last_activity: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Refresh skill stats
      fetchSkillStats();
      fetchWeeklyStats();
      
      toast.success(`${skillType.charAt(0).toUpperCase() + skillType.slice(1)} completed! +${pointsEarned} Force points earned.`);
    } catch (error) {
      console.error('Error completing skill:', error);
      toast.error('Failed to complete skill');
    }
  };

  if (!user) {
    return <div>Please sign in to view your skills.</div>;
  }

  const completedToday = Object.values(todayCompleted).filter(Boolean).length;
  const weeklyGrowth = weeklyStats.lastWeek > 0 
    ? ((weeklyStats.thisWeek - weeklyStats.lastWeek) / weeklyStats.lastWeek) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E1E8F0] pl-64 pt-16">
      <div className="max-w-6xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#2E3A59] mb-4 flex items-center space-x-3">
            <span>Daily Jedi Skills</span>
            {user.isGuest && (
              <span className="text-sm bg-[#5ED3F3] text-white px-3 py-1 rounded-full">
                Demo Mode
              </span>
            )}
          </h1>
          <p className="text-[#BFC9D9] text-lg">
            Master your daily habits and strengthen your connection to the Force.
          </p>
          
          {user.isGuest && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-700 font-medium">Demo Skills Tracking</p>
                <p className="text-sm text-blue-600 mt-1">
                  You're viewing demo skill data. Create an account to track your real progress and build lasting habits.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SkillRings
              meditationStreak={skillStats.meditation}
              workoutStreak={skillStats.workout}
              readingStreak={skillStats.reading}
              todayCompleted={todayCompleted}
              onSkillComplete={handleSkillComplete}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Today's Progress */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-[#CBD5E1]">
              <h3 className="text-lg font-semibold text-[#2E3A59] mb-4 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-[#3CA7E0]" />
                <span>Today's Progress</span>
              </h3>
              <div className="space-y-3">
                {Object.entries(todayCompleted).map(([skill, completed]) => (
                  <div key={skill} className="flex items-center justify-between">
                    <span className="text-sm text-[#2E3A59] capitalize">{skill}</span>
                    <div className={`w-4 h-4 rounded-full ${
                      completed ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-[#CBD5E1]">
                <p className="text-sm text-[#BFC9D9]">
                  Completed: {completedToday}/3 skills today
                </p>
                <div className="w-full bg-[#F3F4F6] rounded-full h-2 mt-2">
                  <div 
                    className="bg-[#3CA7E0] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(completedToday / 3) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Weekly Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-[#CBD5E1]">
              <h3 className="text-lg font-semibold text-[#2E3A59] mb-4 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-[#10B981]" />
                <span>Weekly Stats</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-[#BFC9D9]">This Week</span>
                  <span className="text-sm font-semibold text-[#2E3A59]">{weeklyStats.thisWeek}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#BFC9D9]">Last Week</span>
                  <span className="text-sm font-semibold text-[#2E3A59]">{weeklyStats.lastWeek}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#BFC9D9]">This Month</span>
                  <span className="text-sm font-semibold text-[#2E3A59]">{weeklyStats.totalThisMonth}</span>
                </div>
                {weeklyGrowth !== 0 && (
                  <div className="pt-2 border-t border-[#CBD5E1]">
                    <p className={`text-xs ${weeklyGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {weeklyGrowth > 0 ? '↗' : '↘'} {Math.abs(weeklyGrowth).toFixed(1)}% vs last week
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Achievement */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-[#CBD5E1]">
              <h3 className="text-lg font-semibold text-[#2E3A59] mb-4 flex items-center space-x-2">
                <Award className="h-5 w-5 text-[#F59E0B]" />
                <span>Next Milestone</span>
              </h3>
              <div className="text-center">
                <p className="text-sm text-[#BFC9D9] mb-2">
                  Complete 7 days in a row to unlock
                </p>
                <p className="text-lg font-semibold text-[#F59E0B]">Week Warrior</p>
                <p className="text-xs text-[#BFC9D9] mt-1">
                  Current best: {Math.max(skillStats.meditation, skillStats.workout, skillStats.reading)} days
                </p>
              </div>
            </div>

            {/* Jedi Wisdom */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-[#CBD5E1]">
              <h3 className="text-lg font-semibold text-[#2E3A59] mb-4">
                Jedi Wisdom
              </h3>
              <blockquote className="text-sm text-[#BFC9D9] italic">
                "A Jedi's strength flows from the Force. But beware of the dark side. 
                Anger, fear, aggression; the dark side of the Force are they. 
                Easily they flow, quick to join you in a fight."
              </blockquote>
              <p className="text-xs text-[#2E3A59] mt-2">- Master Yoda</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Skills;