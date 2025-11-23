import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Supabase credentials missing!');
  console.error('URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auth helpers
export const signUp = async (email, password, fullName) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    // Create profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            full_name: fullName,
            username: email.split('@')[0],
          },
        ]);

      if (profileError) console.error('Profile creation error:', profileError);
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

// Profile helpers
export const getProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', userId);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Chat with AI via Edge Function
export const chatWithAI = async (message, conversationId, userName = null) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.functions.invoke('chat-with-openai', {
      body: {
        message,
        conversationId,
        userId: user.id,
        userName,
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Conversations
export const getConversations = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const createConversation = async (userId, title = 'New Conversation') => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        {
          user_id: userId,
          title,
          last_message_at: new Date(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getMessages = async (conversationId) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(50); // Limit to last 50 messages for performance

    if (error) throw error;
    // Reverse to show oldest first
    return { data: data ? data.reverse() : null, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Reading Plans
export const getReadingPlans = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('reading_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const createReadingPlan = async (userId, plan) => {
  try {
    const { data, error } = await supabase
      .from('reading_plans')
      .insert([
        {
          user_id: userId,
          ...plan,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateReadingPlanProgress = async (planId, currentDay) => {
  try {
    const { data, error } = await supabase
      .from('reading_plans')
      .update({ current_day: currentDay })
      .eq('id', planId);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Daily Progress
export const getDailyProgress = async (userId, date) => {
  try {
    const { data, error } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateDailyProgress = async (userId, date, progress) => {
  try {
    const { data, error } = await supabase
      .from('daily_progress')
      .upsert({
        user_id: userId,
        date,
        ...progress,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Daily Verse
export const getDailyVerse = async (date) => {
  try {
    const { data, error } = await supabase
      .from('daily_verses')
      .select('*')
      .eq('date', date)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Achievements
export const getUserAchievements = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const addAchievement = async (userId, achievementType) => {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .insert([
        {
          user_id: userId,
          achievement_type: achievementType,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Quiz Questions - Random (General)
export const getQuizQuestions = async (limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .limit(50); // Get more for better randomization

    if (error) {
      console.error('Supabase quiz error:', error);
      return { data: null, error };
    }
    
    if (!data || data.length === 0) {
      console.log('No quiz questions in database');
      return { data: null, error: null };
    }
    
    // Shuffle and take limit
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, limit);
    
    // Shuffle options for each question
    const questionsWithShuffledOptions = selected.map(q => {
      try {
        const parsedOptions = typeof q.options === 'string' 
          ? JSON.parse(q.options) 
          : q.options;
        return {
          ...q,
          options: Array.isArray(parsedOptions) 
            ? parsedOptions.sort(() => Math.random() - 0.5)
            : parsedOptions,
        };
      } catch (e) {
        console.error('Error parsing options:', e);
        return q;
      }
    });
    
    return { data: questionsWithShuffledOptions, error: null };
  } catch (error) {
    console.error('Error in getQuizQuestions:', error);
    return { data: null, error };
  }
};

// Quiz Questions - By Book (fallback to random if book column doesn't exist)
export const getQuizQuestionsByBook = async (book, limit = 5) => {
  try {
    // For now, just return random questions since the migration hasn't been run yet
    // This will work until you run the database migration
    return await getQuizQuestions(limit);
  } catch (error) {
    console.error('Error in getQuizQuestionsByBook:', error);
    return { data: null, error };
  }
};

// Quiz Questions - By Chapter (fallback to random if chapter column doesn't exist)
export const getQuizQuestionsByChapter = async (book, chapter, limit = 5) => {
  try {
    // For now, just return random questions since the migration hasn't been run yet
    // This will work until you run the database migration
    return await getQuizQuestions(limit);
  } catch (error) {
    console.error('Error in getQuizQuestionsByChapter:', error);
    return { data: null, error };
  }
};

// Bible Reading - Fetch verse from API
export const getBibleVerse = async (book, chapter, verse, version = 'NIV') => {
  try {
    // Using bible-api.com (free, no key required)
    // Format: book+chapter:verse (e.g., john+3:16)
    let bookName = book.toLowerCase();
    
    // Handle special cases for book names
    const bookMap = {
      '1 corinthians': '1corinthians',
      '2 corinthians': '2corinthians',
      '1 peter': '1peter',
      '2 peter': '2peter',
      '1 john': '1john',
      '2 john': '2john',
      '3 john': '3john',
      '1 timothy': '1timothy',
      '2 timothy': '2timothy',
      '1 thessalonians': '1thessalonians',
      '2 thessalonians': '2thessalonians',
      'psalm': 'psalms', // API uses 'psalms' not 'psalm'
    };
    
    if (bookMap[bookName]) {
      bookName = bookMap[bookName];
    } else {
      bookName = bookName.replace(/\s+/g, '');
    }
    
    // Try without version first (defaults to KJV which is most reliable)
    let url = `https://bible-api.com/${bookName}+${chapter}:${verse}`;
    
    // Only add version if it's not KJV (KJV is the default and most reliable)
    if (version !== 'KJV') {
      // Map version codes - bible-api.com supports: kjv, asv, web, ylt, darby, webbe, douayrheims, kjv
      // For other versions, we'll use KJV as fallback
      const versionMap = {
        'KJV': '',
        'NIV': '', // Not directly supported, will use KJV
        'ESV': '', // Not directly supported, will use KJV
        'NLT': '', // Not directly supported, will use KJV
        'NASB': '', // Not directly supported, will use KJV
      };
      
      // For now, use KJV as it's the most reliable
      // In the future, we could integrate with another API for other versions
    }
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.text) {
        // Clean up the text (remove extra newlines)
        const cleanText = data.text.trim().replace(/\n+/g, ' ').trim();
        return {
          data: {
            text: cleanText,
            reference: data.reference || `${book} ${chapter}:${verse}`,
          },
          error: null,
        };
      }
    }
    
    // Fallback: Return a well-known verse text if API fails
    const fallbackVerses = {
      'Jeremiah 29:11': "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.",
      'Proverbs 3:5': "Trust in the Lord with all your heart, and do not lean on your own understanding.",
      'Philippians 4:13': "I can do all things through him who strengthens me.",
      'Isaiah 40:31': "But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.",
      'Romans 8:28': "And we know that for those who love God all things work together for good, for those who are called according to his purpose.",
      'Joshua 1:9': "Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.",
      'Matthew 6:33': "But seek first the kingdom of God and his righteousness, and all these things will be added to you.",
      'Psalm 23:1': "The Lord is my shepherd; I shall not want.",
      'John 3:16': "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
      '1 Corinthians 13:4': "Love is patient and kind; love does not envy or boast; it is not arrogant",
    };
    
    const reference = `${book} ${chapter}:${verse}`;
    const fallbackText = fallbackVerses[reference] || `Read ${reference} in your Bible or Bible app.`;
    
    return {
      data: {
        text: fallbackText,
        reference: reference,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error fetching Bible verse:', error);
    // Fallback response with actual verse text
    const reference = `${book} ${chapter}:${verse}`;
    const fallbackVerses = {
      'Jeremiah 29:11': "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.",
      'Proverbs 3:5': "Trust in the Lord with all your heart, and do not lean on your own understanding.",
      'Philippians 4:13': "I can do all things through him who strengthens me.",
    };
    
    return {
      data: {
        text: fallbackVerses[reference] || `Read ${reference} in your Bible or Bible app.`,
        reference: reference,
      },
      error: null,
    };
  }
};

// Get reading plan verse based on plan type and day
export const getReadingPlanVerse = (planType, day, version = 'NIV') => {
  // Map plan types to Bible verses
  const planVerses = {
    'gospel_of_john': [
      { book: 'John', chapter: 1, verses: '1-18', title: 'The Word Became Flesh' },
      { book: 'John', chapter: 1, verses: '19-51', title: 'John the Baptist' },
      { book: 'John', chapter: 2, verses: '1-25', title: 'The Wedding at Cana' },
      { book: 'John', chapter: 3, verses: '1-21', title: 'Jesus and Nicodemus' },
      { book: 'John', chapter: 3, verses: '22-36', title: 'John Testifies About Jesus' },
      { book: 'John', chapter: 4, verses: '1-42', title: 'Jesus and the Samaritan Woman' },
      { book: 'John', chapter: 4, verses: '43-54', title: 'Jesus Heals an Official\'s Son' },
      { book: 'John', chapter: 5, verses: '1-18', title: 'Jesus Heals on the Sabbath' },
      { book: 'John', chapter: 5, verses: '19-47', title: 'The Authority of the Son' },
      { book: 'John', chapter: 6, verses: '1-21', title: 'Jesus Feeds the Five Thousand' },
    ],
    'overcoming_anxiety': [
      { book: 'Philippians', chapter: 4, verses: '4-9', title: 'Peace of God' },
      { book: 'Matthew', chapter: 6, verses: '25-34', title: 'Do Not Worry' },
      { book: '1 Peter', chapter: 5, verses: '6-11', title: 'Cast Your Anxieties' },
      { book: 'Isaiah', chapter: 41, verses: '10-13', title: 'Fear Not' },
      { book: 'Psalm', chapter: 23, verses: '1-6', title: 'The Lord is My Shepherd' },
      { book: 'Psalm', chapter: 46, verses: '1-11', title: 'God is Our Refuge' },
      { book: '2 Timothy', chapter: 1, verses: '7-10', title: 'Power, Love, and Self-Discipline' },
    ],
    'proverbs_wisdom': [
      { book: 'Proverbs', chapter: 1, verses: '1-7', title: 'Purpose and Theme' },
      { book: 'Proverbs', chapter: 3, verses: '1-12', title: 'Trust in the Lord' },
      { book: 'Proverbs', chapter: 3, verses: '13-26', title: 'Wisdom\'s Benefits' },
      { book: 'Proverbs', chapter: 4, verses: '1-13', title: 'Get Wisdom' },
      { book: 'Proverbs', chapter: 10, verses: '1-12', title: 'Proverbs of Solomon' },
      { book: 'Proverbs', chapter: 16, verses: '1-9', title: 'Commit to the Lord' },
      { book: 'Proverbs', chapter: 22, verses: '1-6', title: 'A Good Name' },
      { book: 'Proverbs', chapter: 31, verses: '10-31', title: 'A Wife of Noble Character' },
    ],
    'new_believer_basics': [
      { book: 'John', chapter: 3, verses: '1-21', title: 'Born Again' },
      { book: 'Romans', chapter: 3, verses: '21-31', title: 'Righteousness Through Faith' },
      { book: 'Ephesians', chapter: 2, verses: '1-10', title: 'Made Alive in Christ' },
      { book: '1 John', chapter: 1, verses: '1-10', title: 'The Word of Life' },
      { book: 'Romans', chapter: 8, verses: '1-17', title: 'Life Through the Spirit' },
      { book: 'Galatians', chapter: 5, verses: '16-26', title: 'Life by the Spirit' },
      { book: 'Matthew', chapter: 28, verses: '16-20', title: 'The Great Commission' },
    ],
  };

  const plan = planVerses[planType];
  if (!plan || day < 0 || day >= plan.length) {
    return null;
  }

  return plan[day];
};

// Get daily verse based on date (different each day)
export const getDailyReadingVerse = async (version = 'NIV') => {
  try {
    // Generate a verse based on the day of year (1-365)
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((today - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
    
    // Expanded list of popular verses for daily reading
    const dailyVerses = [
      { book: 'Jeremiah', chapter: 29, verse: 11 },
      { book: 'Proverbs', chapter: 3, verse: 5 },
      { book: 'Philippians', chapter: 4, verse: 13 },
      { book: 'Isaiah', chapter: 40, verse: 31 },
      { book: 'Romans', chapter: 8, verse: 28 },
      { book: 'Joshua', chapter: 1, verse: 9 },
      { book: 'Matthew', chapter: 6, verse: 33 },
      { book: 'Psalm', chapter: 23, verse: 1 },
      { book: 'John', chapter: 3, verse: 16 },
      { book: '1 Corinthians', chapter: 13, verse: 4 },
      { book: 'Psalm', chapter: 46, verse: 10 },
      { book: 'Matthew', chapter: 11, verse: 28 },
      { book: 'Romans', chapter: 12, verse: 2 },
      { book: 'Ephesians', chapter: 2, verse: 8 },
      { book: 'Galatians', chapter: 2, verse: 20 },
      { book: 'Psalm', chapter: 119, verse: 105 },
      { book: 'Isaiah', chapter: 41, verse: 10 },
      { book: '2 Timothy', chapter: 1, verse: 7 },
      { book: '1 John', chapter: 4, verse: 19 },
      { book: 'Proverbs', chapter: 16, verse: 9 },
      { book: 'Psalm', chapter: 37, verse: 4 },
      { book: 'Matthew', chapter: 28, verse: 20 },
      { book: 'John', chapter: 14, verse: 6 },
      { book: 'Romans', chapter: 15, verse: 13 },
      { book: '1 Peter', chapter: 5, verse: 7 },
      { book: 'Psalm', chapter: 34, verse: 8 },
      { book: 'Hebrews', chapter: 11, verse: 1 },
      { book: 'James', chapter: 1, verse: 2 },
      { book: 'Psalm', chapter: 27, verse: 1 },
      { book: 'Isaiah', chapter: 26, verse: 3 },
    ];
    
    // Use day of year to select verse (ensures different verse each day)
    const verseIndex = (dayOfYear - 1) % dailyVerses.length;
    const selectedVerse = dailyVerses[verseIndex] || dailyVerses[0];
    
    const { data } = await getBibleVerse(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse, version);
    
    return {
      data: {
        ...data,
        book: selectedVerse.book,
        chapter: selectedVerse.chapter,
        verse: selectedVerse.verse,
        reference: `${selectedVerse.book} ${selectedVerse.chapter}:${selectedVerse.verse}`,
      },
      error: null,
    };
  } catch (error) {
    return {
      data: {
        text: 'Read your daily Bible verse in your Bible or Bible app.',
        reference: 'Daily Reading',
      },
      error: null,
    };
  }
};

export default supabase;
