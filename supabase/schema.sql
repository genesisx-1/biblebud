-- Bible Bro Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bible_translation TEXT DEFAULT 'NIV',
  daily_reminder_time TIME DEFAULT '09:00:00',
  streak_count INTEGER DEFAULT 0,
  last_active_date DATE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Chat conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- Chat messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  scripture_references JSONB,
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    user_id = auth.uid() OR
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages"
  ON messages FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

-- Reading plans
CREATE TABLE IF NOT EXISTS reading_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_type TEXT,
  title TEXT,
  description TEXT,
  total_days INTEGER,
  current_day INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE reading_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reading plans"
  ON reading_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reading plans"
  ON reading_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading plans"
  ON reading_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- Daily progress
CREATE TABLE IF NOT EXISTS daily_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  verses_read TEXT[],
  reading_completed BOOLEAN DEFAULT FALSE,
  chat_messages_count INTEGER DEFAULT 0,
  quiz_score INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily progress"
  ON daily_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily progress"
  ON daily_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily progress"
  ON daily_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Daily verses (global)
CREATE TABLE IF NOT EXISTS daily_verses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  verse_text TEXT NOT NULL,
  verse_reference TEXT NOT NULL,
  theme TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE daily_verses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view daily verses"
  ON daily_verses FOR SELECT
  USING (true);

-- User achievements/badges
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_type TEXT,
  title TEXT,
  description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
  ON achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Quiz questions (global)
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  reference TEXT,
  difficulty TEXT DEFAULT 'easy',
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quiz questions"
  ON quiz_questions FOR SELECT
  USING (true);

-- Quiz results
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz results"
  ON quiz_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz results"
  ON quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample daily verses
INSERT INTO daily_verses (date, verse_text, verse_reference, theme) VALUES
  ('2025-01-01', 'For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.', 'Jeremiah 29:11', 'Hope & Purpose'),
  ('2025-01-02', 'Trust in the Lord with all your heart, and do not lean on your own understanding.', 'Proverbs 3:5', 'Trust & Faith'),
  ('2025-01-03', 'I can do all things through him who strengthens me.', 'Philippians 4:13', 'Strength & Courage');

-- Insert some sample quiz questions (only if they don't exist)
INSERT INTO quiz_questions (question, options, correct_answer, reference, difficulty, category)
SELECT * FROM (VALUES
  ('Who parted the Red Sea?', '["Noah", "Moses", "Abraham", "David"]', 'Moses', 'Exodus 14:21', 'easy', 'Old Testament'),
  ('How many disciples did Jesus have?', '["10", "11", "12", "13"]', '12', 'Matthew 10:1-4', 'easy', 'New Testament'),
  ('What is the shortest verse in the Bible?', '["Jesus wept.", "God is love.", "Pray always.", "Be still."]', 'Jesus wept.', 'John 11:35', 'medium', 'Bible Facts'),
  ('Who built the ark?', '["Moses", "Noah", "Abraham", "Solomon"]', 'Noah', 'Genesis 6-9', 'easy', 'Old Testament'),
  ('What was the first book of the Bible?', '["Exodus", "Matthew", "Genesis", "Psalms"]', 'Genesis', 'Genesis 1:1', 'easy', 'Bible Facts'),
  ('Who was thrown into the lions'' den?', '["Daniel", "David", "Joseph", "Moses"]', 'Daniel', 'Daniel 6:16-23', 'easy', 'Old Testament'),
  ('What was the name of Jesus'' mother?', '["Mary", "Elizabeth", "Sarah", "Ruth"]', 'Mary', 'Matthew 1:18', 'easy', 'New Testament'),
  ('How many days was Jesus in the tomb?', '["1", "2", "3", "4"]', '3', 'Matthew 12:40', 'easy', 'New Testament'),
  ('Who denied Jesus three times?', '["John", "Peter", "Judas", "Thomas"]', 'Peter', 'Matthew 26:69-75', 'medium', 'New Testament'),
  ('What is the last book of the Bible?', '["Jude", "Revelation", "3 John", "Malachi"]', 'Revelation', 'Revelation 22:21', 'easy', 'Bible Facts'),
  ('Who was the first man?', '["Noah", "Adam", "Abraham", "Moses"]', 'Adam', 'Genesis 2:7', 'easy', 'Old Testament'),
  ('What did God create on the first day?', '["Light", "Animals", "Man", "Plants"]', 'Light', 'Genesis 1:3-5', 'easy', 'Old Testament'),
  ('Who was known as the "father of many nations"?', '["Moses", "Noah", "Abraham", "David"]', 'Abraham', 'Genesis 17:5', 'medium', 'Old Testament'),
  ('What is the longest book in the Bible?', '["Genesis", "Psalms", "Isaiah", "Jeremiah"]', 'Psalms', 'Psalms', 'medium', 'Bible Facts'),
  ('Who wrote most of the New Testament letters?', '["Peter", "John", "Paul", "James"]', 'Paul', 'Various', 'medium', 'New Testament'),
  ('What was the name of the garden where Adam and Eve lived?', '["Garden of Gethsemane", "Garden of Eden", "Garden of Babylon", "Garden of Paradise"]', 'Garden of Eden', 'Genesis 2:8', 'easy', 'Old Testament'),
  ('Who was the wisest king of Israel?', '["David", "Saul", "Solomon", "Rehoboam"]', 'Solomon', '1 Kings 3:12', 'medium', 'Old Testament'),
  ('What is the first commandment?', '["Love your neighbor", "Honor your parents", "You shall have no other gods", "Remember the Sabbath"]', 'You shall have no other gods', 'Exodus 20:3', 'medium', 'Old Testament'),
  ('Who was the first martyr in the New Testament?', '["Peter", "Stephen", "Paul", "James"]', 'Stephen', 'Acts 7:59-60', 'medium', 'New Testament'),
  ('What city was Jesus born in?', '["Nazareth", "Jerusalem", "Bethlehem", "Capernaum"]', 'Bethlehem', 'Matthew 2:1', 'easy', 'New Testament'),
  ('How many books are in the New Testament?', '["25", "26", "27", "28"]', '27', 'Bible Facts', 'easy', 'Bible Facts'),
  ('Who baptized Jesus?', '["John the Baptist", "Peter", "Paul", "Philip"]', 'John the Baptist', 'Matthew 3:13-17', 'easy', 'New Testament'),
  ('What is the Great Commission?', '["Love one another", "Go and make disciples", "Pray without ceasing", "Give to the poor"]', 'Go and make disciples', 'Matthew 28:19-20', 'medium', 'New Testament'),
  ('Who was the first king of Israel?', '["David", "Saul", "Solomon", "Samuel"]', 'Saul', '1 Samuel 10:1', 'medium', 'Old Testament'),
  ('What is the theme of 1 Corinthians 13?', '["Faith", "Hope", "Love", "Joy"]', 'Love', '1 Corinthians 13:1-13', 'medium', 'New Testament')
) AS v(question, options, correct_answer, reference, difficulty, category)
WHERE NOT EXISTS (
  SELECT 1 FROM quiz_questions WHERE quiz_questions.question = v.question
);
