import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

  useEffect(() => {
    if (user) {
      fetchSkillStats();
      checkTodayCompletion();
    }
  }, [user]);

  const fetchSkillStats = async () => {
    if (!user) return;

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
        
        for (let i = 0; i < skillData.length; i++) {
          const skillDate = new Date(skillData[i].date);
          const diffTime = Math.abs(currentDate.getTime() - skillDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 1) {
            currentStreak++;
            currentDate = skillDate;
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
    if (!user) return;

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

  const handleSkillComplete = async (skillType: string) => {
    if (!user) return;

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

      // Refresh skill stats
      fetchSkillStats();
      
      toast.success(`${skillType.charAt(0).toUpperCase() + skillType.slice(1)} completed! The Force grows stronger.`);
    } catch (error) {
      console.error('Error completing skill:', error);
      toast.error('Failed to complete skill');
    }
  };

  if (!user) {
    return <div>Please sign in to view your skills.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E1E8F0] pl-64 pt-16">
      <div className="max-w-6xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#2E3A59] mb-4">
            Daily Jedi Skills
          </h1>
          <p className="text-[#BFC9D9] text-lg">
            Master your daily habits and strengthen your connection to the Force.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SkillRings
              meditationStreak={skillStats.meditation}
              workoutStreak={skillStats.workout}
              readingStreak={skillStats.reading}
              onSkillComplete={handleSkillComplete}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 border border-[#CBD5E1]">
              <h3 className="text-lg font-semibold text-[#2E3A59] mb-4">
                Today's Progress
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
            </div>

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