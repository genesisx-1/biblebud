-- Migration: Add book, chapter, and question_type columns to quiz_questions
-- Run this in your Supabase SQL Editor AFTER the main schema.sql

-- Add new columns to quiz_questions table
ALTER TABLE quiz_questions 
  ADD COLUMN IF NOT EXISTS book TEXT,
  ADD COLUMN IF NOT EXISTS chapter INTEGER,
  ADD COLUMN IF NOT EXISTS question_type TEXT DEFAULT 'general' CHECK (question_type IN ('general', 'book', 'chapter'));

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_book ON quiz_questions(book);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_chapter ON quiz_questions(book, chapter);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_type ON quiz_questions(question_type);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON quiz_questions(difficulty);

-- Update existing questions to have question_type = 'general'
UPDATE quiz_questions SET question_type = 'general' WHERE question_type IS NULL;

-- Add comment to table
COMMENT ON COLUMN quiz_questions.book IS 'Bible book name (e.g., Genesis, Matthew) - NULL for general questions';
COMMENT ON COLUMN quiz_questions.chapter IS 'Chapter number - NULL for book-level or general questions';
COMMENT ON COLUMN quiz_questions.question_type IS 'Type of question: general (any topic), book (specific book), or chapter (specific chapter)';

