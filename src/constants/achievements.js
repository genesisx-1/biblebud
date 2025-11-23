// Achievement definitions and badge system

export const ACHIEVEMENT_TYPES = {
  // Streak achievements
  STREAK_3: 'streak_3',
  STREAK_7: 'streak_7',
  STREAK_30: 'streak_30',
  STREAK_100: 'streak_100',
  
  // Reading achievements
  FIRST_READING: 'first_reading',
  PLANS_COMPLETED_1: 'plans_completed_1',
  PLANS_COMPLETED_5: 'plans_completed_5',
  PLANS_COMPLETED_10: 'plans_completed_10',
  
  // Quiz achievements
  FIRST_QUIZ: 'first_quiz',
  QUIZ_PERFECT: 'quiz_perfect',
  QUIZ_10: 'quiz_10',
  QUIZ_50: 'quiz_50',
  QUIZ_100: 'quiz_100',
  
  // Chat achievements
  FIRST_CHAT: 'first_chat',
  CHAT_10: 'chat_10',
  CHAT_50: 'chat_50',
  
  // Special achievements
  EARLY_BIRD: 'early_bird', // Log in before 6 AM
  NIGHT_OWL: 'night_owl', // Log in after 10 PM
  WEEKLY_WARRIOR: 'weekly_warrior', // Active 7 days in a row
};

export const ACHIEVEMENTS = {
  [ACHIEVEMENT_TYPES.STREAK_3]: {
    id: ACHIEVEMENT_TYPES.STREAK_3,
    title: '3-Day Streak',
    description: 'Keep your faith journey going for 3 days',
    icon: 'flame',
    color: '#FFA500',
    requirement: 3,
  },
  [ACHIEVEMENT_TYPES.STREAK_7]: {
    id: ACHIEVEMENT_TYPES.STREAK_7,
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'flame',
    color: '#FF4500',
    requirement: 7,
  },
  [ACHIEVEMENT_TYPES.STREAK_30]: {
    id: ACHIEVEMENT_TYPES.STREAK_30,
    title: 'Month Master',
    description: 'Keep a 30-day streak alive',
    icon: 'flame',
    color: '#FF0000',
    requirement: 30,
  },
  [ACHIEVEMENT_TYPES.STREAK_100]: {
    id: ACHIEVEMENT_TYPES.STREAK_100,
    title: 'Century of Faith',
    description: 'Achieve a legendary 100-day streak',
    icon: 'flame',
    color: '#8B0000',
    requirement: 100,
  },
  
  [ACHIEVEMENT_TYPES.FIRST_READING]: {
    id: ACHIEVEMENT_TYPES.FIRST_READING,
    title: 'First Steps',
    description: 'Complete your first Bible reading',
    icon: 'book',
    color: '#2E4A8C',
    requirement: 1,
  },
  [ACHIEVEMENT_TYPES.PLANS_COMPLETED_1]: {
    id: ACHIEVEMENT_TYPES.PLANS_COMPLETED_1,
    title: 'Plan Pioneer',
    description: 'Complete your first reading plan',
    icon: 'checkmark-circle',
    color: '#2E4A8C',
    requirement: 1,
  },
  [ACHIEVEMENT_TYPES.PLANS_COMPLETED_5]: {
    id: ACHIEVEMENT_TYPES.PLANS_COMPLETED_5,
    title: 'Dedicated Reader',
    description: 'Complete 5 reading plans',
    icon: 'library',
    color: '#2E4A8C',
    requirement: 5,
  },
  [ACHIEVEMENT_TYPES.PLANS_COMPLETED_10]: {
    id: ACHIEVEMENT_TYPES.PLANS_COMPLETED_10,
    title: 'Bible Scholar',
    description: 'Complete 10 reading plans',
    icon: 'school',
    color: '#2E4A8C',
    requirement: 10,
  },
  
  [ACHIEVEMENT_TYPES.FIRST_QUIZ]: {
    id: ACHIEVEMENT_TYPES.FIRST_QUIZ,
    title: 'Quiz Novice',
    description: 'Take your first Bible quiz',
    icon: 'trophy',
    color: '#D4A574',
    requirement: 1,
  },
  [ACHIEVEMENT_TYPES.QUIZ_PERFECT]: {
    id: ACHIEVEMENT_TYPES.QUIZ_PERFECT,
    title: 'Perfect Score',
    description: 'Get 100% on a quiz',
    icon: 'star',
    color: '#FFD700',
    requirement: 1,
  },
  [ACHIEVEMENT_TYPES.QUIZ_10]: {
    id: ACHIEVEMENT_TYPES.QUIZ_10,
    title: 'Quiz Enthusiast',
    description: 'Complete 10 quizzes',
    icon: 'trophy',
    color: '#D4A574',
    requirement: 10,
  },
  [ACHIEVEMENT_TYPES.QUIZ_50]: {
    id: ACHIEVEMENT_TYPES.QUIZ_50,
    title: 'Quiz Expert',
    description: 'Complete 50 quizzes',
    icon: 'trophy',
    color: '#D4A574',
    requirement: 50,
  },
  [ACHIEVEMENT_TYPES.QUIZ_100]: {
    id: ACHIEVEMENT_TYPES.QUIZ_100,
    title: 'Quiz Master',
    description: 'Complete 100 quizzes',
    icon: 'trophy',
    color: '#D4A574',
    requirement: 100,
  },
  
  [ACHIEVEMENT_TYPES.FIRST_CHAT]: {
    id: ACHIEVEMENT_TYPES.FIRST_CHAT,
    title: 'Faithful Friend',
    description: 'Start your first chat with Bible Bro',
    icon: 'chatbubbles',
    color: '#7CB342',
    requirement: 1,
  },
  [ACHIEVEMENT_TYPES.CHAT_10]: {
    id: ACHIEVEMENT_TYPES.CHAT_10,
    title: 'Conversation Starter',
    description: 'Have 10 conversations',
    icon: 'chatbubbles',
    color: '#7CB342',
    requirement: 10,
  },
  [ACHIEVEMENT_TYPES.CHAT_50]: {
    id: ACHIEVEMENT_TYPES.CHAT_50,
    title: 'Wisdom Seeker',
    description: 'Have 50 conversations',
    icon: 'chatbubbles',
    color: '#7CB342',
    requirement: 50,
  },
  
  [ACHIEVEMENT_TYPES.EARLY_BIRD]: {
    id: ACHIEVEMENT_TYPES.EARLY_BIRD,
    title: 'Early Bird',
    description: 'Read scripture before 6 AM',
    icon: 'sunny',
    color: '#FFA500',
    requirement: 1,
  },
  [ACHIEVEMENT_TYPES.NIGHT_OWL]: {
    id: ACHIEVEMENT_TYPES.NIGHT_OWL,
    title: 'Night Owl',
    description: 'Read scripture after 10 PM',
    icon: 'moon',
    color: '#4169E1',
    requirement: 1,
  },
  [ACHIEVEMENT_TYPES.WEEKLY_WARRIOR]: {
    id: ACHIEVEMENT_TYPES.WEEKLY_WARRIOR,
    title: 'Weekly Warrior',
    description: 'Active every day for a week',
    icon: 'shield',
    color: '#8B4513',
    requirement: 7,
  },
};

// Helper to get achievement details
export const getAchievement = (type) => {
  return ACHIEVEMENTS[type];
};

// Helper to check if achievement should be awarded
export const shouldAwardAchievement = (type, currentValue) => {
  const achievement = ACHIEVEMENTS[type];
  return achievement && currentValue >= achievement.requirement;
};

