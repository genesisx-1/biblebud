-- Add additional quiz questions to existing database
-- Run this if you've already run the main schema.sql

-- First, delete any existing questions to avoid duplicates (optional - comment out if you want to keep existing)
-- DELETE FROM quiz_questions;

-- Insert additional quiz questions
INSERT INTO quiz_questions (question, options, correct_answer, reference, difficulty, category) VALUES
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

