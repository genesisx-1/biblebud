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

// Seeded random function - same seed = same result
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Get user's personalized daily verse (different per user, changes daily)
export const getUserDailyVerse = async (userId, version = 'NIV') => {
  try {
    // Get today's date as YYYY-MM-DD
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    
    // Create a unique seed from user ID + date
    // Convert UUID to number for seeding
    const userIdHash = userId.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    const dateHash = dateString.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    const seed = userIdHash + dateHash;
    
    // Large pool of popular Bible verses
    const dailyVerses = [
      { book: 'Jeremiah', chapter: 29, verse: 11, theme: 'Hope & Purpose' },
      { book: 'Proverbs', chapter: 3, verse: 5, theme: 'Trust & Faith' },
      { book: 'Philippians', chapter: 4, verse: 13, theme: 'Strength & Courage' },
      { book: 'Isaiah', chapter: 40, verse: 31, theme: 'Renewal & Strength' },
      { book: 'Romans', chapter: 8, verse: 28, theme: 'God\'s Plan' },
      { book: 'Joshua', chapter: 1, verse: 9, theme: 'Courage & Strength' },
      { book: 'Matthew', chapter: 6, verse: 33, theme: 'Priorities' },
      { book: 'Psalm', chapter: 23, verse: 1, theme: 'God\'s Provision' },
      { book: 'John', chapter: 3, verse: 16, theme: 'God\'s Love' },
      { book: '1 Corinthians', chapter: 13, verse: 4, theme: 'Love' },
      { book: 'Psalm', chapter: 46, verse: 10, theme: 'Peace' },
      { book: 'Matthew', chapter: 11, verse: 28, theme: 'Rest' },
      { book: 'Romans', chapter: 12, verse: 2, theme: 'Transformation' },
      { book: 'Ephesians', chapter: 2, verse: 8, theme: 'Salvation' },
      { book: 'Galatians', chapter: 2, verse: 20, theme: 'New Life' },
      { book: 'Psalm', chapter: 119, verse: 105, theme: 'God\'s Word' },
      { book: 'Isaiah', chapter: 41, verse: 10, theme: 'Fear Not' },
      { book: '2 Timothy', chapter: 1, verse: 7, theme: 'Power & Love' },
      { book: '1 John', chapter: 4, verse: 19, theme: 'Love' },
      { book: 'Proverbs', chapter: 16, verse: 9, theme: 'God\'s Plan' },
      { book: 'Psalm', chapter: 37, verse: 4, theme: 'Delight in God' },
      { book: 'Matthew', chapter: 28, verse: 20, theme: 'God\'s Presence' },
      { book: 'John', chapter: 14, verse: 6, theme: 'The Way' },
      { book: 'Romans', chapter: 15, verse: 13, theme: 'Hope & Joy' },
      { book: '1 Peter', chapter: 5, verse: 7, theme: 'Cast Your Cares' },
      { book: 'Psalm', chapter: 34, verse: 8, theme: 'Taste & See' },
      { book: 'Hebrews', chapter: 11, verse: 1, theme: 'Faith' },
      { book: 'James', chapter: 1, verse: 2, theme: 'Joy in Trials' },
      { book: 'Psalm', chapter: 27, verse: 1, theme: 'Light & Salvation' },
      { book: 'Isaiah', chapter: 26, verse: 3, theme: 'Perfect Peace' },
      { book: 'Psalm', chapter: 91, verse: 1, theme: 'God\'s Protection' },
      { book: 'Proverbs', chapter: 4, verse: 23, theme: 'Guard Your Heart' },
      { book: 'Colossians', chapter: 3, verse: 2, theme: 'Set Your Mind' },
      { book: '1 Thessalonians', chapter: 5, verse: 16, theme: 'Rejoice Always' },
      { book: 'Psalm', chapter: 16, verse: 11, theme: 'Fullness of Joy' },
      { book: 'Isaiah', chapter: 55, verse: 8, theme: 'God\'s Thoughts' },
      { book: 'Psalm', chapter: 139, verse: 14, theme: 'Wonderfully Made' },
      { book: 'Romans', chapter: 5, verse: 8, theme: 'God\'s Love' },
      { book: 'Ephesians', chapter: 3, verse: 20, theme: 'More Than We Ask' },
      { book: 'Psalm', chapter: 103, verse: 12, theme: 'Forgiveness' },
      { book: 'Isaiah', chapter: 43, verse: 2, theme: 'God is With You' },
      { book: 'Psalm', chapter: 18, verse: 2, theme: 'My Rock' },
      { book: 'Proverbs', chapter: 18, verse: 10, theme: 'Strong Tower' },
      { book: 'Psalm', chapter: 32, verse: 8, theme: 'God\'s Guidance' },
      { book: 'Isaiah', chapter: 30, verse: 21, theme: 'Your Ears Will Hear' },
      { book: 'Psalm', chapter: 25, verse: 9, theme: 'God\'s Ways' },
      { book: 'Proverbs', chapter: 3, verse: 6, theme: 'Acknowledge Him' },
      { book: 'Psalm', chapter: 55, verse: 22, theme: 'Cast Your Burden' },
      { book: 'Matthew', chapter: 5, verse: 16, theme: 'Let Your Light Shine' },
      { book: 'Galatians', chapter: 5, verse: 22, theme: 'Fruit of the Spirit' },
      { book: 'Psalm', chapter: 84, verse: 11, theme: 'No Good Thing Withheld' },
      { book: 'Isaiah', chapter: 54, verse: 10, theme: 'Unfailing Love' },
      { book: 'Psalm', chapter: 30, verse: 5, theme: 'Weeping May Endure' },
      { book: 'Romans', chapter: 6, verse: 23, theme: 'Gift of God' },
      { book: 'John', chapter: 10, verse: 10, theme: 'Abundant Life' },
      { book: 'Psalm', chapter: 9, verse: 10, theme: 'Those Who Know Your Name' },
      { book: 'Isaiah', chapter: 9, verse: 6, theme: 'Wonderful Counselor' },
      { book: 'Psalm', chapter: 20, verse: 4, theme: 'Grant Your Heart\'s Desire' },
      { book: 'Proverbs', chapter: 19, verse: 21, theme: 'Many Plans' },
      { book: 'Psalm', chapter: 31, verse: 24, theme: 'Be Strong' },
      { book: 'Isaiah', chapter: 12, verse: 2, theme: 'My Strength' },
      { book: 'Psalm', chapter: 62, verse: 1, theme: 'My Soul Waits' },
      { book: 'Proverbs', chapter: 14, verse: 12, theme: 'A Way That Seems Right' },
      { book: 'Psalm', chapter: 40, verse: 1, theme: 'I Waited Patiently' },
      { book: 'Isaiah', chapter: 26, verse: 4, theme: 'Trust Forever' },
      { book: 'Psalm', chapter: 28, verse: 7, theme: 'My Strength' },
      { book: 'Proverbs', chapter: 22, verse: 6, theme: 'Train Up a Child' },
      { book: 'Psalm', chapter: 121, verse: 1, theme: 'Lift Up My Eyes' },
      { book: 'Isaiah', chapter: 53, verse: 5, theme: 'He Was Wounded' },
      { book: 'Psalm', chapter: 100, verse: 4, theme: 'Enter His Gates' },
      { book: 'Proverbs', chapter: 15, verse: 1, theme: 'A Soft Answer' },
      { book: 'Psalm', chapter: 51, verse: 10, theme: 'Create in Me' },
      { book: 'Isaiah', chapter: 40, verse: 8, theme: 'Word of God Stands' },
      { book: 'Psalm', chapter: 19, verse: 1, theme: 'Heavens Declare' },
      { book: 'Proverbs', chapter: 17, verse: 17, theme: 'A Friend Loves' },
      { book: 'Psalm', chapter: 73, verse: 26, theme: 'My Portion Forever' },
      { book: 'Isaiah', chapter: 55, verse: 6, theme: 'Seek the Lord' },
      { book: 'Psalm', chapter: 56, verse: 3, theme: 'When I Am Afraid' },
      { book: 'Proverbs', chapter: 20, verse: 24, theme: 'Man\'s Steps' },
      { book: 'Psalm', chapter: 145, verse: 18, theme: 'Near to All' },
      { book: 'Isaiah', chapter: 58, verse: 11, theme: 'Guide You Always' },
      { book: 'Psalm', chapter: 147, verse: 3, theme: 'Heals the Brokenhearted' },
      { book: 'Proverbs', chapter: 21, verse: 21, theme: 'Pursue Righteousness' },
      { book: 'Psalm', chapter: 150, verse: 6, theme: 'Let Everything Praise' },
      { book: 'Isaiah', chapter: 61, verse: 1, theme: 'Good News' },
      { book: 'Psalm', chapter: 1, verse: 1, theme: 'Blessed is the Man' },
      { book: 'Proverbs', chapter: 8, verse: 17, theme: 'Those Who Seek' },
      { book: 'Psalm', chapter: 4, verse: 8, theme: 'In Peace I Will Lie Down' },
      { book: 'Isaiah', chapter: 64, verse: 8, theme: 'We Are the Clay' },
      { book: 'Psalm', chapter: 5, verse: 3, theme: 'Morning Prayer' },
      { book: 'Proverbs', chapter: 11, verse: 25, theme: 'Generous Person' },
      { book: 'Psalm', chapter: 8, verse: 3, theme: 'When I Consider' },
      { book: 'Isaiah', chapter: 66, verse: 13, theme: 'As a Mother Comforts' },
      { book: 'Psalm', chapter: 10, verse: 17, theme: 'You Hear' },
      { book: 'Proverbs', chapter: 12, verse: 15, theme: 'Wise Listens' },
      { book: 'Psalm', chapter: 13, verse: 5, theme: 'I Trust' },
      { book: 'Isaiah', chapter: 65, verse: 24, theme: 'Before They Call' },
      { book: 'Psalm', chapter: 14, verse: 1, theme: 'The Fool Says' },
      { book: 'Proverbs', chapter: 13, verse: 20, theme: 'Walk with the Wise' },
      { book: 'Psalm', chapter: 15, verse: 1, theme: 'Who May Dwell' },
      { book: 'Isaiah', chapter: 57, verse: 15, theme: 'With the Contrite' },
      { book: 'Psalm', chapter: 17, verse: 8, theme: 'Keep Me as the Apple' },
      { book: 'Proverbs', chapter: 6, verse: 20, theme: 'Keep Your Father\'s Command' },
      { book: 'Psalm', chapter: 21, verse: 6, theme: 'Made Him Glad' },
      { book: 'Isaiah', chapter: 59, verse: 1, theme: 'Hand is Not Shortened' },
      { book: 'Psalm', chapter: 24, verse: 1, theme: 'The Earth is the Lord\'s' },
      { book: 'Proverbs', chapter: 7, verse: 2, theme: 'Keep My Commands' },
      { book: 'Psalm', chapter: 26, verse: 1, theme: 'I Have Trusted' },
      { book: 'Isaiah', chapter: 60, verse: 1, theme: 'Arise, Shine' },
      { book: 'Psalm', chapter: 29, verse: 11, theme: 'Strength to His People' },
      { book: 'Proverbs', chapter: 9, verse: 10, theme: 'Fear of the Lord' },
      { book: 'Psalm', chapter: 33, verse: 4, theme: 'Word of the Lord' },
      { book: 'Isaiah', chapter: 62, verse: 1, theme: 'For Zion\'s Sake' },
      { book: 'Psalm', chapter: 35, verse: 9, theme: 'My Soul Will Rejoice' },
      { book: 'Proverbs', chapter: 10, verse: 9, theme: 'Walks Securely' },
      { book: 'Psalm', chapter: 36, verse: 5, theme: 'Your Love Reaches' },
      { book: 'Isaiah', chapter: 63, verse: 9, theme: 'In All Their Distress' },
      { book: 'Psalm', chapter: 38, verse: 9, theme: 'All My Longing' },
      { book: 'Proverbs', chapter: 5, verse: 21, theme: 'A Man\'s Ways' },
      { book: 'Psalm', chapter: 39, verse: 4, theme: 'Show Me My Life\'s End' },
      { book: 'Isaiah', chapter: 64, verse: 4, theme: 'No Eye Has Seen' },
      { book: 'Psalm', chapter: 41, verse: 1, theme: 'Blessed is He' },
      { book: 'Proverbs', chapter: 2, verse: 6, theme: 'The Lord Gives Wisdom' },
      { book: 'Psalm', chapter: 42, verse: 1, theme: 'As the Deer' },
      { book: 'Isaiah', chapter: 65, verse: 17, theme: 'New Heavens' },
      { book: 'Psalm', chapter: 43, verse: 3, theme: 'Send Your Light' },
      { book: 'Proverbs', chapter: 1, verse: 7, theme: 'Beginning of Knowledge' },
      { book: 'Psalm', chapter: 44, verse: 3, theme: 'Not by Their Sword' },
      { book: 'Isaiah', chapter: 66, verse: 2, theme: 'This is the One' },
      { book: 'Psalm', chapter: 45, verse: 1, theme: 'My Heart is Stirred' },
      { book: 'Proverbs', chapter: 4, verse: 7, theme: 'Get Wisdom' },
      { book: 'Psalm', chapter: 47, verse: 1, theme: 'Clap Your Hands' },
      { book: 'Isaiah', chapter: 55, verse: 11, theme: 'My Word Will Not Return' },
      { book: 'Psalm', chapter: 48, verse: 1, theme: 'Great is the Lord' },
      { book: 'Proverbs', chapter: 6, verse: 16, theme: 'Six Things the Lord Hates' },
      { book: 'Psalm', chapter: 49, verse: 15, theme: 'God Will Redeem' },
      { book: 'Isaiah', chapter: 57, verse: 19, theme: 'Peace, Peace' },
      { book: 'Psalm', chapter: 50, verse: 15, theme: 'Call on Me' },
      { book: 'Proverbs', chapter: 8, verse: 11, theme: 'Wisdom is Better' },
      { book: 'Psalm', chapter: 52, verse: 8, theme: 'I Am Like an Olive Tree' },
      { book: 'Isaiah', chapter: 58, verse: 8, theme: 'Your Light Will Break Forth' },
      { book: 'Psalm', chapter: 53, verse: 1, theme: 'The Fool Says' },
      { book: 'Proverbs', chapter: 9, verse: 9, theme: 'Instruct a Wise Man' },
      { book: 'Psalm', chapter: 54, verse: 4, theme: 'God is My Helper' },
      { book: 'Isaiah', chapter: 59, verse: 21, theme: 'My Spirit' },
      { book: 'Psalm', chapter: 57, verse: 1, theme: 'Have Mercy on Me' },
      { book: 'Proverbs', chapter: 10, verse: 12, theme: 'Love Covers' },
      { book: 'Psalm', chapter: 58, verse: 11, theme: 'Surely There is a Reward' },
      { book: 'Isaiah', chapter: 60, verse: 19, theme: 'The Lord Will Be Your Light' },
      { book: 'Psalm', chapter: 59, verse: 16, theme: 'I Will Sing' },
      { book: 'Proverbs', chapter: 11, verse: 2, theme: 'With Humility' },
      { book: 'Psalm', chapter: 60, verse: 12, theme: 'With God We Will Gain' },
      { book: 'Isaiah', chapter: 61, verse: 3, theme: 'A Crown of Beauty' },
      { book: 'Psalm', chapter: 61, verse: 2, theme: 'From the Ends of the Earth' },
      { book: 'Proverbs', chapter: 12, verse: 18, theme: 'Reckless Words' },
      { book: 'Psalm', chapter: 63, verse: 1, theme: 'My Soul Thirsts' },
      { book: 'Isaiah', chapter: 62, verse: 5, theme: 'As a Bridegroom' },
      { book: 'Psalm', chapter: 64, verse: 10, theme: 'The Righteous Will Rejoice' },
      { book: 'Proverbs', chapter: 13, verse: 3, theme: 'Those Who Guard Their Lips' },
      { book: 'Psalm', chapter: 65, verse: 2, theme: 'You Who Answer Prayer' },
      { book: 'Isaiah', chapter: 63, verse: 16, theme: 'You Are Our Father' },
      { book: 'Psalm', chapter: 66, verse: 1, theme: 'Shout for Joy' },
      { book: 'Proverbs', chapter: 14, verse: 1, theme: 'The Wise Woman' },
      { book: 'Psalm', chapter: 67, verse: 1, theme: 'May God Be Gracious' },
      { book: 'Isaiah', chapter: 64, verse: 8, theme: 'We Are the Clay' },
      { book: 'Psalm', chapter: 68, verse: 19, theme: 'Praise Be to the Lord' },
      { book: 'Proverbs', chapter: 15, verse: 13, theme: 'A Happy Heart' },
      { book: 'Psalm', chapter: 69, verse: 30, theme: 'I Will Praise' },
      { book: 'Isaiah', chapter: 65, verse: 23, theme: 'They Will Not Labor in Vain' },
      { book: 'Psalm', chapter: 70, verse: 4, theme: 'May All Who Seek' },
      { book: 'Proverbs', chapter: 16, verse: 3, theme: 'Commit to the Lord' },
      { book: 'Psalm', chapter: 71, verse: 5, theme: 'You Have Been My Hope' },
      { book: 'Isaiah', chapter: 66, verse: 13, theme: 'As a Mother Comforts' },
      { book: 'Psalm', chapter: 72, verse: 18, theme: 'Praise Be to the Lord' },
      { book: 'Proverbs', chapter: 17, verse: 22, theme: 'A Cheerful Heart' },
      { book: 'Psalm', chapter: 74, verse: 12, theme: 'God is My King' },
      { book: 'Isaiah', chapter: 55, verse: 9, theme: 'As the Heavens' },
      { book: 'Psalm', chapter: 75, verse: 1, theme: 'We Give Thanks' },
      { book: 'Proverbs', chapter: 18, verse: 22, theme: 'He Who Finds a Wife' },
      { book: 'Psalm', chapter: 76, verse: 1, theme: 'God is Known' },
      { book: 'Isaiah', chapter: 57, verse: 15, theme: 'With the Contrite' },
      { book: 'Psalm', chapter: 77, verse: 11, theme: 'I Will Remember' },
      { book: 'Proverbs', chapter: 19, verse: 23, theme: 'Fear of the Lord' },
      { book: 'Psalm', chapter: 78, verse: 4, theme: 'Tell the Next Generation' },
      { book: 'Isaiah', chapter: 58, verse: 11, theme: 'Guide You Always' },
      { book: 'Psalm', chapter: 79, verse: 9, theme: 'Help Us, O God' },
      { book: 'Proverbs', chapter: 20, verse: 7, theme: 'The Righteous' },
      { book: 'Psalm', chapter: 80, verse: 3, theme: 'Restore Us' },
      { book: 'Isaiah', chapter: 59, verse: 1, theme: 'Hand is Not Shortened' },
      { book: 'Psalm', chapter: 81, verse: 1, theme: 'Sing for Joy' },
      { book: 'Proverbs', chapter: 21, verse: 3, theme: 'To Do Right' },
      { book: 'Psalm', chapter: 82, verse: 3, theme: 'Defend the Weak' },
      { book: 'Isaiah', chapter: 60, verse: 1, theme: 'Arise, Shine' },
      { book: 'Psalm', chapter: 83, verse: 18, theme: 'May They Know' },
      { book: 'Proverbs', chapter: 22, verse: 1, theme: 'A Good Name' },
      { book: 'Psalm', chapter: 85, verse: 10, theme: 'Love and Faithfulness' },
      { book: 'Isaiah', chapter: 61, verse: 1, theme: 'Good News' },
      { book: 'Psalm', chapter: 86, verse: 5, theme: 'You Are Forgiving' },
      { book: 'Proverbs', chapter: 23, verse: 18, theme: 'There is Surely a Future' },
      { book: 'Psalm', chapter: 87, verse: 3, theme: 'Glorious Things' },
      { book: 'Isaiah', chapter: 62, verse: 1, theme: 'For Zion\'s Sake' },
      { book: 'Psalm', chapter: 88, verse: 1, theme: 'O Lord, God of My Salvation' },
      { book: 'Proverbs', chapter: 24, verse: 16, theme: 'Though the Righteous Fall' },
      { book: 'Psalm', chapter: 89, verse: 1, theme: 'I Will Sing' },
      { book: 'Isaiah', chapter: 63, verse: 9, theme: 'In All Their Distress' },
      { book: 'Psalm', chapter: 90, verse: 12, theme: 'Teach Us to Number' },
      { book: 'Proverbs', chapter: 25, verse: 11, theme: 'A Word Fitly Spoken' },
      { book: 'Psalm', chapter: 92, verse: 1, theme: 'It is Good' },
      { book: 'Isaiah', chapter: 64, verse: 4, theme: 'No Eye Has Seen' },
      { book: 'Psalm', chapter: 93, verse: 1, theme: 'The Lord Reigns' },
      { book: 'Proverbs', chapter: 26, verse: 4, theme: 'Answer a Fool' },
      { book: 'Psalm', chapter: 94, verse: 19, theme: 'When Anxiety Was Great' },
      { book: 'Isaiah', chapter: 65, verse: 17, theme: 'New Heavens' },
      { book: 'Psalm', chapter: 95, verse: 1, theme: 'Come, Let Us Sing' },
      { book: 'Proverbs', chapter: 27, verse: 1, theme: 'Do Not Boast' },
      { book: 'Psalm', chapter: 96, verse: 1, theme: 'Sing to the Lord' },
      { book: 'Isaiah', chapter: 66, verse: 2, theme: 'This is the One' },
      { book: 'Psalm', chapter: 97, verse: 1, theme: 'The Lord Reigns' },
      { book: 'Proverbs', chapter: 28, verse: 1, theme: 'The Wicked Flee' },
      { book: 'Psalm', chapter: 98, verse: 1, theme: 'Sing to the Lord' },
      { book: 'Isaiah', chapter: 55, verse: 11, theme: 'My Word Will Not Return' },
      { book: 'Psalm', chapter: 99, verse: 1, theme: 'The Lord Reigns' },
      { book: 'Proverbs', chapter: 29, verse: 18, theme: 'Where There is No Vision' },
      { book: 'Psalm', chapter: 101, verse: 2, theme: 'I Will Be Careful' },
      { book: 'Isaiah', chapter: 57, verse: 19, theme: 'Peace, Peace' },
      { book: 'Psalm', chapter: 102, verse: 1, theme: 'Hear My Prayer' },
      { book: 'Proverbs', chapter: 30, verse: 5, theme: 'Every Word of God' },
      { book: 'Psalm', chapter: 104, verse: 1, theme: 'Praise the Lord' },
      { book: 'Isaiah', chapter: 58, verse: 8, theme: 'Your Light Will Break Forth' },
      { book: 'Psalm', chapter: 105, verse: 1, theme: 'Give Thanks' },
      { book: 'Proverbs', chapter: 31, verse: 10, theme: 'A Wife of Noble Character' },
      { book: 'Psalm', chapter: 106, verse: 1, theme: 'Praise the Lord' },
      { book: 'Isaiah', chapter: 59, verse: 21, theme: 'My Spirit' },
      { book: 'Psalm', chapter: 107, verse: 1, theme: 'Give Thanks' },
      { book: 'Isaiah', chapter: 60, verse: 19, theme: 'The Lord Will Be Your Light' },
      { book: 'Psalm', chapter: 108, verse: 1, theme: 'My Heart is Steadfast' },
      { book: 'Isaiah', chapter: 61, verse: 3, theme: 'A Crown of Beauty' },
      { book: 'Psalm', chapter: 109, verse: 26, theme: 'Help Me' },
      { book: 'Isaiah', chapter: 62, verse: 5, theme: 'As a Bridegroom' },
      { book: 'Psalm', chapter: 110, verse: 1, theme: 'The Lord Says' },
      { book: 'Isaiah', chapter: 63, verse: 16, theme: 'You Are Our Father' },
      { book: 'Psalm', chapter: 111, verse: 1, theme: 'Praise the Lord' },
      { book: 'Isaiah', chapter: 64, verse: 8, theme: 'We Are the Clay' },
      { book: 'Psalm', chapter: 112, verse: 1, theme: 'Praise the Lord' },
      { book: 'Isaiah', chapter: 65, verse: 23, theme: 'They Will Not Labor in Vain' },
      { book: 'Psalm', chapter: 113, verse: 1, theme: 'Praise the Lord' },
      { book: 'Isaiah', chapter: 66, verse: 13, theme: 'As a Mother Comforts' },
      { book: 'Psalm', chapter: 114, verse: 1, theme: 'When Israel Came Out' },
      { book: 'Isaiah', chapter: 55, verse: 9, theme: 'As the Heavens' },
      { book: 'Psalm', chapter: 115, verse: 1, theme: 'Not to Us' },
      { book: 'Isaiah', chapter: 57, verse: 15, theme: 'With the Contrite' },
      { book: 'Psalm', chapter: 116, verse: 1, theme: 'I Love the Lord' },
      { book: 'Isaiah', chapter: 58, verse: 11, theme: 'Guide You Always' },
      { book: 'Psalm', chapter: 117, verse: 1, theme: 'Praise the Lord' },
      { book: 'Isaiah', chapter: 59, verse: 1, theme: 'Hand is Not Shortened' },
      { book: 'Psalm', chapter: 118, verse: 24, theme: 'This is the Day' },
      { book: 'Isaiah', chapter: 60, verse: 1, theme: 'Arise, Shine' },
      { book: 'Psalm', chapter: 120, verse: 1, theme: 'I Call on the Lord' },
      { book: 'Isaiah', chapter: 61, verse: 1, theme: 'Good News' },
      { book: 'Psalm', chapter: 122, verse: 1, theme: 'I Rejoiced' },
      { book: 'Isaiah', chapter: 62, verse: 1, theme: 'For Zion\'s Sake' },
      { book: 'Psalm', chapter: 123, verse: 1, theme: 'I Lift My Eyes' },
      { book: 'Isaiah', chapter: 63, verse: 9, theme: 'In All Their Distress' },
      { book: 'Psalm', chapter: 124, verse: 1, theme: 'If the Lord Had Not Been' },
      { book: 'Isaiah', chapter: 64, verse: 4, theme: 'No Eye Has Seen' },
      { book: 'Psalm', chapter: 125, verse: 1, theme: 'Those Who Trust' },
      { book: 'Isaiah', chapter: 65, verse: 17, theme: 'New Heavens' },
      { book: 'Psalm', chapter: 126, verse: 3, theme: 'The Lord Has Done' },
      { book: 'Isaiah', chapter: 66, verse: 2, theme: 'This is the One' },
      { book: 'Psalm', chapter: 127, verse: 1, theme: 'Unless the Lord Builds' },
      { book: 'Isaiah', chapter: 55, verse: 11, theme: 'My Word Will Not Return' },
      { book: 'Psalm', chapter: 128, verse: 1, theme: 'Blessed Are All' },
      { book: 'Isaiah', chapter: 57, verse: 19, theme: 'Peace, Peace' },
      { book: 'Psalm', chapter: 129, verse: 2, theme: 'They Have Greatly Oppressed' },
      { book: 'Isaiah', chapter: 58, verse: 8, theme: 'Your Light Will Break Forth' },
      { book: 'Psalm', chapter: 130, verse: 1, theme: 'Out of the Depths' },
      { book: 'Isaiah', chapter: 59, verse: 1, theme: 'Hand is Not Shortened' },
      { book: 'Psalm', chapter: 131, verse: 1, theme: 'My Heart is Not Proud' },
      { book: 'Isaiah', chapter: 60, verse: 19, theme: 'The Lord Will Be Your Light' },
      { book: 'Psalm', chapter: 132, verse: 1, theme: 'Remember, O Lord' },
      { book: 'Isaiah', chapter: 61, verse: 3, theme: 'A Crown of Beauty' },
      { book: 'Psalm', chapter: 133, verse: 1, theme: 'How Good and Pleasant' },
      { book: 'Isaiah', chapter: 62, verse: 5, theme: 'As a Bridegroom' },
      { book: 'Psalm', chapter: 134, verse: 1, theme: 'Praise the Lord' },
      { book: 'Isaiah', chapter: 63, verse: 16, theme: 'You Are Our Father' },
      { book: 'Psalm', chapter: 135, verse: 1, theme: 'Praise the Lord' },
      { book: 'Isaiah', chapter: 64, verse: 8, theme: 'We Are the Clay' },
      { book: 'Psalm', chapter: 136, verse: 1, theme: 'Give Thanks' },
      { book: 'Isaiah', chapter: 65, verse: 23, theme: 'They Will Not Labor in Vain' },
      { book: 'Psalm', chapter: 137, verse: 1, theme: 'By the Rivers of Babylon' },
      { book: 'Isaiah', chapter: 66, verse: 13, theme: 'As a Mother Comforts' },
      { book: 'Psalm', chapter: 138, verse: 1, theme: 'I Will Praise You' },
      { book: 'Isaiah', chapter: 55, verse: 9, theme: 'As the Heavens' },
      { book: 'Psalm', chapter: 140, verse: 1, theme: 'Rescue Me' },
      { book: 'Isaiah', chapter: 57, verse: 15, theme: 'With the Contrite' },
      { book: 'Psalm', chapter: 141, verse: 1, theme: 'O Lord, I Call' },
      { book: 'Isaiah', chapter: 58, verse: 11, theme: 'Guide You Always' },
      { book: 'Psalm', chapter: 142, verse: 1, theme: 'I Cry Aloud' },
      { book: 'Isaiah', chapter: 59, verse: 1, theme: 'Hand is Not Shortened' },
      { book: 'Psalm', chapter: 143, verse: 1, theme: 'O Lord, Hear My Prayer' },
      { book: 'Isaiah', chapter: 60, verse: 1, theme: 'Arise, Shine' },
      { book: 'Psalm', chapter: 144, verse: 1, theme: 'Praise Be to the Lord' },
      { book: 'Isaiah', chapter: 61, verse: 1, theme: 'Good News' },
      { book: 'Psalm', chapter: 146, verse: 1, theme: 'Praise the Lord' },
      { book: 'Isaiah', chapter: 62, verse: 1, theme: 'For Zion\'s Sake' },
      { book: 'Psalm', chapter: 148, verse: 1, theme: 'Praise the Lord' },
      { book: 'Isaiah', chapter: 63, verse: 9, theme: 'In All Their Distress' },
      { book: 'Psalm', chapter: 149, verse: 1, theme: 'Sing to the Lord' },
      { book: 'Isaiah', chapter: 64, verse: 4, theme: 'No Eye Has Seen' },
      { book: 'Psalm', chapter: 150, verse: 6, theme: 'Let Everything Praise' },
      { book: 'Isaiah', chapter: 65, verse: 17, theme: 'New Heavens' },
      { book: 'Matthew', chapter: 5, verse: 4, theme: 'Blessed Are Those Who Mourn' },
      { book: 'Mark', chapter: 10, verse: 27, theme: 'All Things Are Possible' },
      { book: 'Luke', chapter: 1, verse: 37, theme: 'Nothing is Impossible' },
      { book: 'John', chapter: 1, verse: 1, theme: 'In the Beginning' },
      { book: 'Acts', chapter: 1, verse: 8, theme: 'You Will Receive Power' },
      { book: 'Romans', chapter: 1, verse: 16, theme: 'I Am Not Ashamed' },
      { book: '1 Corinthians', chapter: 1, verse: 18, theme: 'The Message of the Cross' },
      { book: '2 Corinthians', chapter: 1, verse: 3, theme: 'God of All Comfort' },
      { book: 'Galatians', chapter: 1, verse: 3, theme: 'Grace and Peace' },
      { book: 'Ephesians', chapter: 1, verse: 3, theme: 'Every Spiritual Blessing' },
      { book: 'Philippians', chapter: 1, verse: 6, theme: 'He Who Began' },
      { book: 'Colossians', chapter: 1, verse: 15, theme: 'Image of the Invisible' },
      { book: '1 Thessalonians', chapter: 1, verse: 2, theme: 'We Always Thank God' },
      { book: '2 Thessalonians', chapter: 1, verse: 3, theme: 'We Ought Always' },
      { book: '1 Timothy', chapter: 1, verse: 15, theme: 'Christ Jesus Came' },
      { book: '2 Timothy', chapter: 2, verse: 15, theme: 'Do Your Best' },
      { book: 'Titus', chapter: 1, verse: 2, theme: 'Hope of Eternal Life' },
      { book: 'Philemon', chapter: 1, verse: 3, theme: 'Grace and Peace' },
      { book: 'Hebrews', chapter: 1, verse: 1, theme: 'In the Past' },
      { book: 'James', chapter: 1, verse: 17, theme: 'Every Good Gift' },
      { book: '1 Peter', chapter: 1, verse: 3, theme: 'New Birth' },
      { book: '2 Peter', chapter: 1, verse: 3, theme: 'Everything We Need' },
      { book: '1 John', chapter: 1, verse: 9, theme: 'If We Confess' },
      { book: '2 John', chapter: 1, verse: 3, theme: 'Grace, Mercy and Peace' },
      { book: '3 John', chapter: 1, verse: 2, theme: 'I Pray That You' },
      { book: 'Jude', chapter: 1, verse: 3, theme: 'Contend for the Faith' },
      { book: 'Revelation', chapter: 1, verse: 3, theme: 'Blessed is the One' },
      { book: 'Genesis', chapter: 1, verse: 1, theme: 'In the Beginning' },
      { book: 'Exodus', chapter: 3, verse: 14, theme: 'I Am Who I Am' },
      { book: 'Leviticus', chapter: 19, verse: 18, theme: 'Love Your Neighbor' },
      { book: 'Numbers', chapter: 6, verse: 24, theme: 'The Lord Bless You' },
      { book: 'Deuteronomy', chapter: 6, verse: 5, theme: 'Love the Lord' },
      { book: 'Joshua', chapter: 1, verse: 8, theme: 'Meditate on It' },
      { book: 'Judges', chapter: 6, verse: 12, theme: 'The Lord is With You' },
      { book: 'Ruth', chapter: 1, verse: 16, theme: 'Where You Go' },
      { book: '1 Samuel', chapter: 16, verse: 7, theme: 'Man Looks at the Outward' },
      { book: '2 Samuel', chapter: 22, verse: 2, theme: 'The Lord is My Rock' },
      { book: '1 Kings', chapter: 8, verse: 23, theme: 'There is No God Like You' },
      { book: '2 Kings', chapter: 6, verse: 16, theme: 'Those Who Are With Us' },
      { book: '1 Chronicles', chapter: 16, verse: 34, theme: 'Give Thanks' },
      { book: '2 Chronicles', chapter: 7, verse: 14, theme: 'If My People' },
      { book: 'Ezra', chapter: 3, verse: 11, theme: 'Give Thanks' },
      { book: 'Nehemiah', chapter: 8, verse: 10, theme: 'The Joy of the Lord' },
      { book: 'Esther', chapter: 4, verse: 14, theme: 'For Such a Time' },
      { book: 'Job', chapter: 1, verse: 21, theme: 'The Lord Gave' },
      { book: 'Ecclesiastes', chapter: 3, verse: 1, theme: 'A Time for Everything' },
      { book: 'Song of Solomon', chapter: 2, verse: 16, theme: 'My Beloved is Mine' },
      { book: 'Lamentations', chapter: 3, verse: 22, theme: 'Great is Your Faithfulness' },
      { book: 'Ezekiel', chapter: 36, verse: 26, theme: 'A New Heart' },
      { book: 'Daniel', chapter: 3, verse: 17, theme: 'Our God is Able' },
      { book: 'Hosea', chapter: 6, verse: 6, theme: 'I Desire Mercy' },
      { book: 'Joel', chapter: 2, verse: 13, theme: 'Return to the Lord' },
      { book: 'Amos', chapter: 5, verse: 24, theme: 'Let Justice Roll' },
      { book: 'Obadiah', chapter: 1, verse: 4, theme: 'Though You Soar' },
      { book: 'Jonah', chapter: 2, verse: 2, theme: 'I Called' },
      { book: 'Micah', chapter: 6, verse: 8, theme: 'What Does the Lord Require' },
      { book: 'Nahum', chapter: 1, verse: 7, theme: 'The Lord is Good' },
      { book: 'Habakkuk', chapter: 2, verse: 4, theme: 'The Righteous Will Live' },
      { book: 'Zephaniah', chapter: 3, verse: 17, theme: 'He Will Rejoice' },
      { book: 'Haggai', chapter: 2, verse: 4, theme: 'Be Strong' },
      { book: 'Zechariah', chapter: 4, verse: 6, theme: 'Not by Might' },
      { book: 'Malachi', chapter: 3, verse: 10, theme: 'Bring the Whole Tithe' },
    ];
    
    // Use seeded random to pick a verse (same user + same date = same verse)
    const randomValue = seededRandom(seed);
    const verseIndex = Math.floor(randomValue * dailyVerses.length);
    const selectedVerse = dailyVerses[verseIndex] || dailyVerses[0];
    
    // Fetch the actual verse text
    const { data: verseData } = await getBibleVerse(selectedVerse.book, selectedVerse.chapter, selectedVerse.verse, version);
    
    return {
      data: {
        verse_text: verseData?.text || `Read ${selectedVerse.book} ${selectedVerse.chapter}:${selectedVerse.verse}`,
        verse_reference: `${selectedVerse.book} ${selectedVerse.chapter}:${selectedVerse.verse}`,
        theme: selectedVerse.theme,
        book: selectedVerse.book,
        chapter: selectedVerse.chapter,
        verse: selectedVerse.verse,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error getting user daily verse:', error);
    // Fallback verse
    return {
      data: {
        verse_text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.",
        verse_reference: "Jeremiah 29:11",
        theme: "Hope & Purpose",
      },
      error: null,
    };
  }
};

// Daily Verse (legacy - kept for compatibility)
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

export const addAchievement = async (userId, achievementType, title, description) => {
  try {
    // Check if achievement already exists
    const { data: existing } = await supabase
      .from('achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_type', achievementType)
      .single();
    
    if (existing) {
      // Already earned
      return { data: existing, error: null, alreadyEarned: true };
    }
    
    const { data, error } = await supabase
      .from('achievements')
      .insert([
        {
          user_id: userId,
          achievement_type: achievementType,
          title,
          description,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null, alreadyEarned: false };
  } catch (error) {
    return { data: null, error };
  }
};

// Quiz Results
export const saveQuizResult = async (userId, score, totalQuestions) => {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .insert([
        {
          user_id: userId,
          score,
          total_questions: totalQuestions,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data, null, error };
  }
};

export const getUserQuizResults = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getUserQuizStats = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return {
        data: {
          totalQuizzes: 0,
          averageScore: 0,
          bestScore: 0,
          perfectScores: 0,
        },
        error: null,
      };
    }
    
    const totalQuizzes = data.length;
    const averageScore = Math.round(
      data.reduce((sum, result) => sum + (result.score / result.total_questions) * 100, 0) / totalQuizzes
    );
    const bestScore = Math.max(
      ...data.map(result => (result.score / result.total_questions) * 100)
    );
    const perfectScores = data.filter(
      result => result.score === result.total_questions
    ).length;
    
    return {
      data: {
        totalQuizzes,
        averageScore,
        bestScore: Math.round(bestScore),
        perfectScores,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
};

// Daily Progress Tracking
export const updateDailyProgress = async (userId, date, updates) => {
  try {
    // Try to update existing record
    const { data: existing } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();
    
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('daily_progress')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('daily_progress')
        .insert([
          {
            user_id: userId,
            date,
            ...updates,
          },
        ])
        .select()
        .single();
      
      if (error) throw error;
      return { data, error: null };
    }
  } catch (error) {
    return { data: null, error };
  }
};

// Get user stats (for profile)
export const getUserStats = async (userId) => {
  try {
    // Get reading plans count
    const { data: plans } = await supabase
      .from('reading_plans')
      .select('*')
      .eq('user_id', userId)
      .not('completed_at', 'is', null);
    
    // Get conversations count
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId);
    
    // Get quiz stats
    const { data: quizStats } = await getUserQuizStats(userId);
    
    return {
      data: {
        plansCompleted: plans?.length || 0,
        conversationsCount: conversations?.length || 0,
        quizzesTaken: quizStats?.totalQuizzes || 0,
        quizAverageScore: quizStats?.averageScore || 0,
      },
      error: null,
    };
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

// Quiz Questions - By Book
export const getQuizQuestionsByBook = async (book, limit = 5) => {
  try {
    // Get questions for this book, or general questions if none found
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .or(`book.eq.${book},question_type.eq.general`)
      .limit(50);

    if (error) {
      console.error('Supabase quiz by book error:', error);
      // Fallback to random
      return await getQuizQuestions(limit);
    }
    
    if (!data || data.length === 0) {
      console.log(`No quiz questions for book: ${book}`);
      return await getQuizQuestions(limit);
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
    console.error('Error in getQuizQuestionsByBook:', error);
    // Fallback to random
    return await getQuizQuestions(limit);
  }
};

// Quiz Questions - By Chapter
export const getQuizQuestionsByChapter = async (book, chapter, limit = 5) => {
  try {
    // Get questions for this chapter, then book, then general
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .or(`and(book.eq.${book},chapter.eq.${chapter}),book.eq.${book},question_type.eq.general`)
      .limit(50);

    if (error) {
      console.error('Supabase quiz by chapter error:', error);
      // Fallback to random
      return await getQuizQuestions(limit);
    }
    
    if (!data || data.length === 0) {
      console.log(`No quiz questions for ${book} chapter ${chapter}`);
      return await getQuizQuestions(limit);
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
    console.error('Error in getQuizQuestionsByChapter:', error);
    // Fallback to random
    return await getQuizQuestions(limit);
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
