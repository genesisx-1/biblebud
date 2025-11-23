-- Comprehensive Bible Quiz Questions
-- Run this AFTER migrate_quiz_questions.sql
-- Focus on popular books: Gospels, Genesis, Psalms, Proverbs, Acts

-- Insert comprehensive quiz questions
INSERT INTO quiz_questions (question, options, correct_answer, reference, difficulty, category, book, chapter, question_type)
VALUES
  -- GENESIS Questions (Book and Chapter-specific)
  ('Who wrote the book of Genesis?', '["Moses", "David", "Solomon", "Abraham"]', 'Moses', 'Genesis', 'medium', 'Old Testament', 'Genesis', NULL, 'book'),
  ('How many days did God take to create the world?', '["5", "6", "7", "8"]', '6', 'Genesis 1', 'easy', 'Old Testament', 'Genesis', 1, 'chapter'),
  ('What did God create on the sixth day?', '["Fish and birds", "Land animals and humans", "Sun and moon", "Plants"]', 'Land animals and humans', 'Genesis 1:24-31', 'easy', 'Old Testament', 'Genesis', 1, 'chapter'),
  ('What was the name of the first woman?', '["Sarah", "Eve", "Rachel", "Leah"]', 'Eve', 'Genesis 2:23', 'easy', 'Old Testament', 'Genesis', 2, 'chapter'),
  ('Which son of Adam and Eve killed his brother?', '["Seth", "Cain", "Abel", "Enoch"]', 'Cain', 'Genesis 4:8', 'easy', 'Old Testament', 'Genesis', 4, 'chapter'),
  ('How old was Noah when the flood came?', '["500 years", "600 years", "700 years", "800 years"]', '600 years', 'Genesis 7:6', 'medium', 'Old Testament', 'Genesis', 7, 'chapter'),
  ('What sign did God give as a promise never to flood the earth again?', '["A dove", "A rainbow", "The sun", "A star"]', 'A rainbow', 'Genesis 9:13', 'easy', 'Old Testament', 'Genesis', 9, 'chapter'),
  ('What did the people try to build in Babel?', '["A palace", "A tower", "A temple", "A wall"]', 'A tower', 'Genesis 11:4', 'easy', 'Old Testament', 'Genesis', 11, 'chapter'),
  ('What was Abraham''s original name?', '["Abram", "Isaac", "Jacob", "Joseph"]', 'Abram', 'Genesis 17:5', 'medium', 'Old Testament', 'Genesis', 17, 'chapter'),
  ('What city did God destroy because of its wickedness?', '["Babylon", "Sodom", "Jericho", "Nineveh"]', 'Sodom', 'Genesis 19', 'easy', 'Old Testament', 'Genesis', 19, 'chapter'),
  ('Who was Abraham asked to sacrifice?', '["Ishmael", "Isaac", "Jacob", "Joseph"]', 'Isaac', 'Genesis 22:2', 'easy', 'Old Testament', 'Genesis', 22, 'chapter'),
  ('Who sold his birthright for a bowl of stew?', '["Jacob", "Esau", "Joseph", "Benjamin"]', 'Esau', 'Genesis 25:33', 'medium', 'Old Testament', 'Genesis', 25, 'chapter'),
  ('What did Jacob use as a pillow when he dreamed of a ladder?', '["A rock", "A bag", "Wood", "His cloak"]', 'A rock', 'Genesis 28:11', 'medium', 'Old Testament', 'Genesis', 28, 'chapter'),
  ('How many sons did Jacob have?', '["10", "11", "12", "13"]', '12', 'Genesis 35:22', 'easy', 'Old Testament', 'Genesis', 35, 'chapter'),
  ('Who was Joseph''s favorite brother?', '["Reuben", "Judah", "Benjamin", "Simeon"]', 'Benjamin', 'Genesis 42:4', 'medium', 'Old Testament', 'Genesis', 42, 'chapter'),
  
  -- MATTHEW Questions
  ('Who wrote the Gospel of Matthew?', '["Mark", "Matthew", "Luke", "John"]', 'Matthew', 'Matthew', 'easy', 'New Testament', 'Matthew', NULL, 'book'),
  ('What is the first book of the New Testament?', '["Mark", "Matthew", "Luke", "Acts"]', 'Matthew', 'Matthew 1:1', 'easy', 'New Testament', 'Matthew', 1, 'chapter'),
  ('Who were Jesus'' earthly parents?', '["Abraham and Sarah", "Joseph and Mary", "Zechariah and Elizabeth", "David and Ruth"]', 'Joseph and Mary', 'Matthew 1:18', 'easy', 'New Testament', 'Matthew', 1, 'chapter'),
  ('How many wise men came to see baby Jesus?', '["The Bible doesn''t specify", "2", "3", "4"]', 'The Bible doesn''t specify', 'Matthew 2', 'medium', 'New Testament', 'Matthew', 2, 'chapter'),
  ('Who baptized Jesus?', '["Peter", "John the Baptist", "Paul", "Andrew"]', 'John the Baptist', 'Matthew 3:13', 'easy', 'New Testament', 'Matthew', 3, 'chapter'),
  ('How many temptations did Satan present to Jesus in the wilderness?', '["2", "3", "4", "5"]', '3', 'Matthew 4:1-11', 'medium', 'New Testament', 'Matthew', 4, 'chapter'),
  ('Where did Jesus deliver the Sermon on the Mount?', '["On a mountain", "In the temple", "By the sea", "In Nazareth"]', 'On a mountain', 'Matthew 5:1', 'easy', 'New Testament', 'Matthew', 5, 'chapter'),
  ('What is the first Beatitude?', '["Blessed are the meek", "Blessed are the poor in spirit", "Blessed are the merciful", "Blessed are the pure"]', 'Blessed are the poor in spirit', 'Matthew 5:3', 'medium', 'New Testament', 'Matthew', 5, 'chapter'),
  ('What prayer did Jesus teach his disciples?', '["The Apostle''s Creed", "The Lord''s Prayer", "The Serenity Prayer", "The Psalm 23"]', 'The Lord''s Prayer', 'Matthew 6:9-13', 'easy', 'New Testament', 'Matthew', 6, 'chapter'),
  ('What does Jesus say about worrying?', '["Worry about tomorrow", "Don''t worry about tomorrow", "Worry is good", "Worry helps"]', 'Don''t worry about tomorrow', 'Matthew 6:34', 'easy', 'New Testament', 'Matthew', 6, 'chapter'),
  ('On what should we build our house?', '["Sand", "Rock", "Wood", "Stone"]', 'Rock', 'Matthew 7:24', 'easy', 'New Testament', 'Matthew', 7, 'chapter'),
  ('What did Jesus heal the centurion''s servant from?', '["Leprosy", "Paralysis", "Blindness", "Demon possession"]', 'Paralysis', 'Matthew 8:6', 'medium', 'New Testament', 'Matthew', 8, 'chapter'),
  ('What did Jesus say about the workers in the harvest?', '["They are many", "They are few", "They are lazy", "They are strong"]', 'They are few', 'Matthew 9:37', 'medium', 'New Testament', 'Matthew', 9, 'chapter'),
  ('How many apostles did Jesus send out?', '["10", "11", "12", "13"]', '12', 'Matthew 10:1', 'easy', 'New Testament', 'Matthew', 10, 'chapter'),
  ('What did Jesus say his yoke is?', '["Heavy", "Light", "Easy", "Both light and easy"]', 'Both light and easy', 'Matthew 11:30', 'medium', 'New Testament', 'Matthew', 11, 'chapter'),
  
  -- MARK Questions
  ('Who wrote the Gospel of Mark?', '["Matthew", "Mark", "Luke", "Peter"]', 'Mark', 'Mark', 'easy', 'New Testament', 'Mark', NULL, 'book'),
  ('What was Jesus doing when he calmed the storm?', '["Praying", "Sleeping", "Teaching", "Eating"]', 'Sleeping', 'Mark 4:38', 'easy', 'New Testament', 'Mark', 4, 'chapter'),
  ('How many loaves did Jesus use to feed the 5000?', '["3", "5", "7", "12"]', '5', 'Mark 6:38', 'easy', 'New Testament', 'Mark', 6, 'chapter'),
  ('What did Jesus say defiles a person?', '["Unclean food", "What comes from the heart", "Touching unclean things", "Not washing hands"]', 'What comes from the heart', 'Mark 7:20-23', 'medium', 'New Testament', 'Mark', 7, 'chapter'),
  ('Who appeared with Jesus at the Transfiguration?', '["Abraham and Moses", "Moses and Elijah", "David and Solomon", "Peter and John"]', 'Moses and Elijah', 'Mark 9:4', 'medium', 'New Testament', 'Mark', 9, 'chapter'),
  ('What did Jesus say about children?', '["Let them come to me", "Keep them away", "They are too young", "They can''t understand"]', 'Let them come to me', 'Mark 10:14', 'easy', 'New Testament', 'Mark', 10, 'chapter'),
  
  -- LUKE Questions
  ('Who wrote the Gospel of Luke?', '["Mark", "Luke", "John", "Paul"]', 'Luke', 'Luke', 'easy', 'New Testament', 'Luke', NULL, 'book'),
  ('To whom was the Gospel of Luke written?', '["Timothy", "Theophilus", "Titus", "Peter"]', 'Theophilus', 'Luke 1:3', 'medium', 'New Testament', 'Luke', 1, 'chapter'),
  ('Who was Jesus'' cousin?', '["James", "John", "John the Baptist", "Peter"]', 'John the Baptist', 'Luke 1:36', 'medium', 'New Testament', 'Luke', 1, 'chapter'),
  ('What did Mary say when the angel told her she would have a baby?', '["I am the Lord''s servant", "This is impossible", "Leave me alone", "I don''t understand"]', 'I am the Lord''s servant', 'Luke 1:38', 'easy', 'New Testament', 'Luke', 1, 'chapter'),
  ('Where was Jesus born?', '["Nazareth", "Bethlehem", "Jerusalem", "Capernaum"]', 'Bethlehem', 'Luke 2:4-7', 'easy', 'New Testament', 'Luke', 2, 'chapter'),
  ('Who announced Jesus'' birth to the shepherds?', '["A prophet", "An angel", "Mary", "Joseph"]', 'An angel', 'Luke 2:9', 'easy', 'New Testament', 'Luke', 2, 'chapter'),
  ('How old was Jesus when he stayed behind in the temple?', '["10", "12", "15", "18"]', '12', 'Luke 2:42', 'easy', 'New Testament', 'Luke', 2, 'chapter'),
  ('What is the most famous parable in Luke 15?', '["The Good Samaritan", "The Prodigal Son", "The Sower", "The Mustard Seed"]', 'The Prodigal Son', 'Luke 15:11-32', 'easy', 'New Testament', 'Luke', 15, 'chapter'),
  
  -- JOHN Questions
  ('Who wrote the Gospel of John?', '["Matthew", "Mark", "Luke", "John"]', 'John', 'John', 'easy', 'New Testament', 'John', NULL, 'book'),
  ('What does John 1:1 say about the Word?', '["The Word was God", "The Word was good", "The Word was holy", "The Word was true"]', 'The Word was God', 'John 1:1', 'easy', 'New Testament', 'John', 1, 'chapter'),
  ('Who did Jesus visit at night?', '["Peter", "Nicodemus", "Zacchaeus", "Matthew"]', 'Nicodemus', 'John 3:1-2', 'medium', 'New Testament', 'John', 3, 'chapter'),
  ('What is the most famous verse in the Bible?', '["John 1:1", "John 3:16", "John 14:6", "Psalm 23:1"]', 'John 3:16', 'John 3:16', 'easy', 'New Testament', 'John', 3, 'chapter'),
  ('Who did Jesus meet at the well?', '["Mary Magdalene", "The Samaritan woman", "Martha", "Mary"]', 'The Samaritan woman', 'John 4:7', 'easy', 'New Testament', 'John', 4, 'chapter'),
  ('What did Jesus claim to be in John 6?', '["The light of the world", "The bread of life", "The good shepherd", "The way"]', 'The bread of life', 'John 6:35', 'medium', 'New Testament', 'John', 6, 'chapter'),
  ('What did Jesus say when the woman was caught in adultery?', '["Stone her", "Let him without sin cast the first stone", "She is guilty", "Punish her"]', 'Let him without sin cast the first stone', 'John 8:7', 'medium', 'New Testament', 'John', 8, 'chapter'),
  ('What did Jesus claim to be in John 10?', '["The bread of life", "The light", "The good shepherd", "The vine"]', 'The good shepherd', 'John 10:11', 'easy', 'New Testament', 'John', 10, 'chapter'),
  ('Who did Jesus raise from the dead in John 11?', '["Jairus'' daughter", "Lazarus", "The widow''s son", "A young man"]', 'Lazarus', 'John 11:43-44', 'easy', 'New Testament', 'John', 11, 'chapter'),
  ('What did Jesus say he is in John 14:6?', '["The light", "The way, truth, and life", "The bread", "The shepherd"]', 'The way, truth, and life', 'John 14:6', 'easy', 'New Testament', 'John', 14, 'chapter'),
  ('What did Jesus command his disciples in John 15?', '["Preach the gospel", "Love one another", "Go to Jerusalem", "Wait for him"]', 'Love one another', 'John 15:12', 'easy', 'New Testament', 'John', 15, 'chapter'),
  
  -- ACTS Questions
  ('Who wrote the book of Acts?', '["Paul", "Luke", "Peter", "John"]', 'Luke', 'Acts', 'medium', 'New Testament', 'Acts', NULL, 'book'),
  ('What happened on the day of Pentecost?', '["Jesus was crucified", "The Holy Spirit came", "Jesus ascended", "The temple was destroyed"]', 'The Holy Spirit came', 'Acts 2:1-4', 'easy', 'New Testament', 'Acts', 2, 'chapter'),
  ('How many people were baptized after Peter''s sermon?', '["1000", "2000", "3000", "5000"]', '3000', 'Acts 2:41', 'medium', 'New Testament', 'Acts', 2, 'chapter'),
  ('Who was the first Christian martyr?', '["Peter", "Paul", "Stephen", "James"]', 'Stephen', 'Acts 7:59-60', 'easy', 'New Testament', 'Acts', 7, 'chapter'),
  ('What was Saul''s name changed to?', '["Peter", "Paul", "Philip", "Timothy"]', 'Paul', 'Acts 13:9', 'easy', 'New Testament', 'Acts', 9, 'chapter'),
  ('Who was Paul''s missionary companion?', '["Peter", "John", "Barnabas", "Timothy"]', 'Barnabas', 'Acts 13:2', 'medium', 'New Testament', 'Acts', 13, 'chapter'),
  
  -- PSALMS Questions
  ('Who wrote most of the Psalms?', '["Solomon", "David", "Moses", "Asaph"]', 'David', 'Psalms', 'easy', 'Old Testament', 'Psalms', NULL, 'book'),
  ('What does Psalm 1 say the blessed man is like?', '["A tree", "A rock", "A river", "A mountain"]', 'A tree', 'Psalm 1:3', 'easy', 'Old Testament', 'Psalms', 1, 'chapter'),
  ('Complete this verse: "The Lord is my shepherd..."', '["I shall be satisfied", "I shall not want", "I shall be happy", "I shall be blessed"]', 'I shall not want', 'Psalm 23:1', 'easy', 'Old Testament', 'Psalms', 23, 'chapter'),
  ('In Psalm 23, where does God make us lie down?', '["Green pastures", "Still waters", "High mountains", "Deep valleys"]', 'Green pastures', 'Psalm 23:2', 'easy', 'Old Testament', 'Psalms', 23, 'chapter'),
  ('What does Psalm 46:10 tell us to do?', '["Be strong", "Be still", "Be brave", "Be wise"]', 'Be still', 'Psalm 46:10', 'easy', 'Old Testament', 'Psalms', 46, 'chapter'),
  ('What does Psalm 100 say to make before the Lord?', '["A vow", "A joyful noise", "An offering", "A sacrifice"]', 'A joyful noise', 'Psalm 100:1', 'easy', 'Old Testament', 'Psalms', 100, 'chapter'),
  ('What is God''s Word according to Psalm 119:105?', '["A shield", "A lamp", "A sword", "A rock"]', 'A lamp', 'Psalm 119:105', 'easy', 'Old Testament', 'Psalms', 119, 'chapter'),
  
  -- PROVERBS Questions
  ('Who wrote most of the Proverbs?', '["David", "Solomon", "Moses", "Isaiah"]', 'Solomon', 'Proverbs', 'easy', 'Old Testament', 'Proverbs', NULL, 'book'),
  ('What is the beginning of knowledge according to Proverbs 1:7?', '["Wisdom", "Fear of the Lord", "Understanding", "Education"]', 'Fear of the Lord', 'Proverbs 1:7', 'easy', 'Old Testament', 'Proverbs', 1, 'chapter'),
  ('Complete: "Trust in the Lord with all your heart and lean not on..."', '["Your strength", "Your own understanding", "Your wisdom", "Others"]', 'Your own understanding', 'Proverbs 3:5', 'easy', 'Old Testament', 'Proverbs', 3, 'chapter'),
  ('What does Proverbs 3:6 say to do in all your ways?', '["Trust him", "Acknowledge him", "Praise him", "Follow him"]', 'Acknowledge him', 'Proverbs 3:6', 'easy', 'Old Testament', 'Proverbs', 3, 'chapter'),
  ('What should we guard above all else?', '["Our possessions", "Our heart", "Our reputation", "Our family"]', 'Our heart', 'Proverbs 4:23', 'easy', 'Old Testament', 'Proverbs', 4, 'chapter'),
  ('What does Proverbs 16:18 say comes before a fall?', '["Fear", "Pride", "Anger", "Greed"]', 'Pride', 'Proverbs 16:18', 'easy', 'Old Testament', 'Proverbs', 16, 'chapter'),
  ('What does Proverbs 22:6 say about training a child?', '["Train them strictly", "Train them in the way they should go", "Train them to obey", "Train them to work"]', 'Train them in the way they should go', 'Proverbs 22:6', 'easy', 'Old Testament', 'Proverbs', 22, 'chapter'),
  
  -- ROMANS Questions  
  ('Who wrote the book of Romans?', '["Peter", "Paul", "James", "John"]', 'Paul', 'Romans', 'easy', 'New Testament', 'Romans', NULL, 'book'),
  ('What is the main theme of Romans?', '["Love", "Salvation by faith", "Prayer", "The church"]', 'Salvation by faith', 'Romans', 'medium', 'New Testament', 'Romans', NULL, 'book'),
  ('What does Romans 3:23 say all have done?', '["Lied", "Sinned", "Failed", "Fallen"]', 'Sinned', 'Romans 3:23', 'easy', 'New Testament', 'Romans', 3, 'chapter'),
  ('How are we justified according to Romans 5:1?', '["By works", "By faith", "By love", "By obedience"]', 'By faith', 'Romans 5:1', 'easy', 'New Testament', 'Romans', 5, 'chapter'),
  ('What does Romans 6:23 say is the wages of sin?', '["Punishment", "Death", "Separation", "Suffering"]', 'Death', 'Romans 6:23', 'easy', 'New Testament', 'Romans', 6, 'chapter'),
  ('According to Romans 8:28, for whom do all things work together for good?', '["Everyone", "Those who love God", "The righteous", "Believers"]', 'Those who love God', 'Romans 8:28', 'easy', 'New Testament', 'Romans', 8, 'chapter'),
  ('What can separate us from the love of God?', '["Sin", "Death", "Nothing", "Unbelief"]', 'Nothing', 'Romans 8:38-39', 'easy', 'New Testament', 'Romans', 8, 'chapter'),
  ('How does faith come according to Romans 10:17?', '["By prayer", "By hearing", "By reading", "By believing"]', 'By hearing', 'Romans 10:17', 'medium', 'New Testament', 'Romans', 10, 'chapter'),
  ('What does Romans 12:2 warn us not to be conformed to?', '["The world", "Sin", "Others", "The past"]', 'The world', 'Romans 12:2', 'easy', 'New Testament', 'Romans', 12, 'chapter'),
  
  -- 1 CORINTHIANS Questions
  ('Who wrote 1 Corinthians?', '["Peter", "Paul", "James", "John"]', 'Paul', '1 Corinthians', 'easy', 'New Testament', '1 Corinthians', NULL, 'book'),
  ('What is the main theme of 1 Corinthians 13?', '["Faith", "Hope", "Love", "Peace"]', 'Love', '1 Corinthians 13', 'easy', 'New Testament', '1 Corinthians', 13, 'chapter'),
  ('What does 1 Corinthians 13:13 say is the greatest?', '["Faith", "Hope", "Love", "All equal"]', 'Love', '1 Corinthians 13:13', 'easy', 'New Testament', '1 Corinthians', 13, 'chapter'),
  ('What happened on the third day according to 1 Corinthians 15:4?', '["Jesus was buried", "Jesus rose again", "Jesus ascended", "Jesus appeared"]', 'Jesus rose again', '1 Corinthians 15:4', 'easy', 'New Testament', '1 Corinthians', 15, 'chapter'),
  
  -- EPHESIANS Questions
  ('Who wrote Ephesians?', '["Peter", "Paul", "James", "John"]', 'Paul', 'Ephesians', 'easy', 'New Testament', 'Ephesians', NULL, 'book'),
  ('How are we saved according to Ephesians 2:8?', '["By works", "By grace through faith", "By obedience", "By baptism"]', 'By grace through faith', 'Ephesians 2:8', 'easy', 'New Testament', 'Ephesians', 2, 'chapter'),
  ('What are the pieces of the armor of God in Ephesians 6?', '["Helmet, breastplate, shield, sword, belt, shoes", "Crown, robe, staff", "Sword and shield only", "Faith and love"]', 'Helmet, breastplate, shield, sword, belt, shoes', 'Ephesians 6:14-17', 'medium', 'New Testament', 'Ephesians', 6, 'chapter'),
  
  -- PHILIPPIANS Questions
  ('Who wrote Philippians?', '["Peter", "Paul", "Philip", "John"]', 'Paul', 'Philippians', 'easy', 'New Testament', 'Philippians', NULL, 'book'),
  ('What can we do through Christ according to Philippians 4:13?', '["Some things", "All things", "Most things", "Good things"]', 'All things', 'Philippians 4:13', 'easy', 'New Testament', 'Philippians', 4, 'chapter'),
  ('What should we not be anxious about in Philippians 4:6?', '["The future", "Money", "Anything", "Tomorrow"]', 'Anything', 'Philippians 4:6', 'easy', 'New Testament', 'Philippians', 4, 'chapter'),
  
  -- REVELATION Questions
  ('Who wrote Revelation?', '["Peter", "Paul", "John", "James"]', 'John', 'Revelation', 'easy', 'New Testament', 'Revelation', NULL, 'book'),
  ('To how many churches did John write in Revelation?', '["5", "6", "7", "8"]', '7', 'Revelation 2-3', 'medium', 'New Testament', 'Revelation', NULL, 'book'),
  ('What is the last book of the Bible?', '["Jude", "3 John", "Revelation", "Malachi"]', 'Revelation', 'Revelation', 'easy', 'Bible Facts', 'Revelation', NULL, 'book')

ON CONFLICT (id) DO NOTHING;

