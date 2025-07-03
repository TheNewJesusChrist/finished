import React from 'react';
import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Brain, Dumbbell, BookOpen, Flame, CheckCircle } from 'lucide-react';

interface SkillRingsProps {
  meditationStreak: number;
  workoutStreak: number;
  readingStreak: number;
  onSkillComplete: (skill: string) => void;
  todayCompleted?: {
    meditation: boolean;
    workout: boolean;
    reading: boolean;
  };
}

const SkillRings: React.FC<SkillRingsProps> = ({
  meditationStreak,
  workoutStreak,
  readingStreak,
  onSkillComplete,
  todayCompleted = { meditation: false, workout: false, reading: false },
}) => {
  const skills = [
    {
      name: 'Mindfulness',
      type: 'meditation',
      streak: meditationStreak,
      icon: Brain,
      color: '#3CA7E0',
      lightColor: '#5ED3F3',
      completed: todayCompleted.meditation,
    },
    {
      name: 'Strength',
      type: 'workout',
      streak: workoutStreak,
      icon: Dumbbell,
      color: '#10B981',
      lightColor: '#34D399',
      completed: todayCompleted.workout,
    },
    {
      name: 'Wisdom',
      type: 'reading',
      streak: readingStreak,
      icon: BookOpen,
      color: '#8B5CF6',
      lightColor: '#A78BFA',
      completed: todayCompleted.reading,
    },
  ];

  const getProgressPercentage = (streak: number) => {
    return Math.min((streak / 30) * 100, 100); // 30 days for full circle
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-[#CBD5E1]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#2E3A59]">Daily Jedi Skills</h3>
        <Flame className="h-5 w-5 text-orange-500" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {skills.map((skill, index) => (
          <motion.div
            key={skill.type}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="text-center"
          >
            <div className="relative mb-4">
              <div className="w-20 h-20 mx-auto">
                <CircularProgressbar
                  value={getProgressPercentage(skill.streak)}
                  styles={buildStyles({
                    pathColor: skill.color,
                    trailColor: '#F3F4F6',
                    strokeLinecap: 'round',
                    pathTransitionDuration: 1,
                  })}
                />
              </div>
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center relative`}
                     style={{ backgroundColor: skill.lightColor + '20' }}>
                  <skill.icon className="h-6 w-6" style={{ color: skill.color }} />
                  {skill.completed && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            <h4 className="text-sm font-medium text-[#2E3A59] mb-1">{skill.name}</h4>
            <p className="text-xs text-[#BFC9D9] mb-3">{skill.streak} day streak</p>

            <motion.button
              onClick={() => onSkillComplete(skill.type)}
              disabled={skill.completed}
              className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                skill.completed
                  ? 'bg-green-100 text-green-600 border border-green-200 cursor-not-allowed'
                  : 'hover:scale-105'
              }`}
              style={!skill.completed ? { 
                backgroundColor: skill.color + '10',
                color: skill.color,
                border: `1px solid ${skill.color}30`
              } : {}}
              whileHover={!skill.completed ? { 
                scale: 1.05,
                boxShadow: `0 0 10px ${skill.lightColor}50`
              } : {}}
              whileTap={!skill.completed ? { scale: 0.95 } : {}}
            >
              {skill.completed ? 'Completed Today' : 'Complete Today'}
            </motion.button>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-[#CBD5E1]">
        <div className="text-center">
          <p className="text-sm text-[#BFC9D9] mb-2">
            Complete all three skills daily to maximize your Force connection
          </p>
          <div className="flex justify-center space-x-2">
            {skills.map((skill) => (
              <div
                key={skill.type}
                className={`w-2 h-2 rounded-full ${
                  skill.completed ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillRings;