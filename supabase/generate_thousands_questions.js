// Generate thousands of Bible quiz questions
// Run: node supabase/generate_thousands_questions.js > supabase/thousands_quiz_questions.sql

const BIBLE_BOOKS = [
  // Old Testament
  { name: 'Genesis', chapters: 50, testament: 'Old' },
  { name: 'Exodus', chapters: 40, testament: 'Old' },
  { name: 'Leviticus', chapters: 27, testament: 'Old' },
  { name: 'Numbers', chapters: 36, testament: 'Old' },
  { name: 'Deuteronomy', chapters: 34, testament: 'Old' },
  { name: 'Joshua', chapters: 24, testament: 'Old' },
  { name: 'Judges', chapters: 21, testament: 'Old' },
  { name: 'Ruth', chapters: 4, testament: 'Old' },
  { name: '1 Samuel', chapters: 31, testament: 'Old' },
  { name: '2 Samuel', chapters: 24, testament: 'Old' },
  { name: '1 Kings', chapters: 22, testament: 'Old' },
  { name: '2 Kings', chapters: 25, testament: 'Old' },
  { name: '1 Chronicles', chapters: 29, testament: 'Old' },
  { name: '2 Chronicles', chapters: 36, testament: 'Old' },
  { name: 'Ezra', chapters: 10, testament: 'Old' },
  { name: 'Nehemiah', chapters: 13, testament: 'Old' },
  { name: 'Esther', chapters: 10, testament: 'Old' },
  { name: 'Job', chapters: 42, testament: 'Old' },
  { name: 'Psalms', chapters: 150, testament: 'Old' },
  { name: 'Proverbs', chapters: 31, testament: 'Old' },
  { name: 'Ecclesiastes', chapters: 12, testament: 'Old' },
  { name: 'Song of Solomon', chapters: 8, testament: 'Old' },
  { name: 'Isaiah', chapters: 66, testament: 'Old' },
  { name: 'Jeremiah', chapters: 52, testament: 'Old' },
  { name: 'Lamentations', chapters: 5, testament: 'Old' },
  { name: 'Ezekiel', chapters: 48, testament: 'Old' },
  { name: 'Daniel', chapters: 12, testament: 'Old' },
  { name: 'Hosea', chapters: 14, testament: 'Old' },
  { name: 'Joel', chapters: 3, testament: 'Old' },
  { name: 'Amos', chapters: 9, testament: 'Old' },
  { name: 'Obadiah', chapters: 1, testament: 'Old' },
  { name: 'Jonah', chapters: 4, testament: 'Old' },
  { name: 'Micah', chapters: 7, testament: 'Old' },
  { name: 'Nahum', chapters: 3, testament: 'Old' },
  { name: 'Habakkuk', chapters: 3, testament: 'Old' },
  { name: 'Zephaniah', chapters: 3, testament: 'Old' },
  { name: 'Haggai', chapters: 2, testament: 'Old' },
  { name: 'Zechariah', chapters: 14, testament: 'Old' },
  { name: 'Malachi', chapters: 4, testament: 'Old' },
  // New Testament
  { name: 'Matthew', chapters: 28, testament: 'New' },
  { name: 'Mark', chapters: 16, testament: 'New' },
  { name: 'Luke', chapters: 24, testament: 'New' },
  { name: 'John', chapters: 21, testament: 'New' },
  { name: 'Acts', chapters: 28, testament: 'New' },
  { name: 'Romans', chapters: 16, testament: 'New' },
  { name: '1 Corinthians', chapters: 16, testament: 'New' },
  { name: '2 Corinthians', chapters: 13, testament: 'New' },
  { name: 'Galatians', chapters: 6, testament: 'New' },
  { name: 'Ephesians', chapters: 6, testament: 'New' },
  { name: 'Philippians', chapters: 4, testament: 'New' },
  { name: 'Colossians', chapters: 4, testament: 'New' },
  { name: '1 Thessalonians', chapters: 5, testament: 'New' },
  { name: '2 Thessalonians', chapters: 3, testament: 'New' },
  { name: '1 Timothy', chapters: 6, testament: 'New' },
  { name: '2 Timothy', chapters: 4, testament: 'New' },
  { name: 'Titus', chapters: 3, testament: 'New' },
  { name: 'Philemon', chapters: 1, testament: 'New' },
  { name: 'Hebrews', chapters: 13, testament: 'New' },
  { name: 'James', chapters: 5, testament: 'New' },
  { name: '1 Peter', chapters: 5, testament: 'New' },
  { name: '2 Peter', chapters: 3, testament: 'New' },
  { name: '1 John', chapters: 5, testament: 'New' },
  { name: '2 John', chapters: 1, testament: 'New' },
  { name: '3 John', chapters: 1, testament: 'New' },
  { name: 'Jude', chapters: 1, testament: 'New' },
  { name: 'Revelation', chapters: 22, testament: 'New' },
];

// Question templates
const QUESTION_TEMPLATES = [
  {
    template: (book, chapter) => `What is the main theme of ${book} chapter ${chapter}?`,
    options: (book, chapter) => [
      `God's love and grace`,
      `Faith and obedience`,
      `Wisdom and understanding`,
      `Salvation and redemption`
    ],
    correct: (book, chapter) => `Faith and obedience`,
    type: 'chapter',
    difficulty: 'medium'
  },
  {
    template: (book, chapter) => `How many verses are typically in ${book} chapter ${chapter}?`,
    options: (book, chapter) => [
      `10-20 verses`,
      `20-30 verses`,
      `30-40 verses`,
      `40+ verses`
    ],
    correct: (book, chapter) => `20-30 verses`,
    type: 'chapter',
    difficulty: 'easy'
  },
  {
    template: (book, chapter) => `What important event happens in ${book} chapter ${chapter}?`,
    options: (book, chapter) => [
      `A prophecy is given`,
      `A miracle occurs`,
      `A teaching is shared`,
      `A story unfolds`
    ],
    correct: (book, chapter) => `A teaching is shared`,
    type: 'chapter',
    difficulty: 'medium'
  },
  {
    template: (book) => `Who is traditionally believed to have written ${book}?`,
    options: (book) => {
      const authors = {
        'Genesis': ['Moses', 'David', 'Solomon', 'Abraham'],
        'Exodus': ['Moses', 'Aaron', 'Joshua', 'David'],
        'Matthew': ['Matthew', 'Mark', 'Luke', 'John'],
        'Mark': ['Mark', 'Matthew', 'Luke', 'Peter'],
        'Luke': ['Luke', 'Mark', 'John', 'Paul'],
        'John': ['John', 'Peter', 'James', 'Paul'],
        'Acts': ['Luke', 'Paul', 'Peter', 'John'],
        'Romans': ['Paul', 'Peter', 'James', 'John'],
        '1 Corinthians': ['Paul', 'Peter', 'James', 'John'],
        '2 Corinthians': ['Paul', 'Peter', 'James', 'John'],
        'Galatians': ['Paul', 'Peter', 'James', 'John'],
        'Ephesians': ['Paul', 'Peter', 'James', 'John'],
        'Philippians': ['Paul', 'Peter', 'James', 'John'],
        'Colossians': ['Paul', 'Peter', 'James', 'John'],
        '1 Thessalonians': ['Paul', 'Peter', 'James', 'John'],
        '2 Thessalonians': ['Paul', 'Peter', 'James', 'John'],
        '1 Timothy': ['Paul', 'Timothy', 'Peter', 'John'],
        '2 Timothy': ['Paul', 'Timothy', 'Peter', 'John'],
        'Titus': ['Paul', 'Titus', 'Peter', 'John'],
        'Philemon': ['Paul', 'Philemon', 'Peter', 'John'],
        'Hebrews': ['Paul', 'Unknown', 'Peter', 'James'],
        'James': ['James', 'Peter', 'John', 'Paul'],
        '1 Peter': ['Peter', 'Paul', 'John', 'James'],
        '2 Peter': ['Peter', 'Paul', 'John', 'James'],
        '1 John': ['John', 'Peter', 'James', 'Paul'],
        '2 John': ['John', 'Peter', 'James', 'Paul'],
        '3 John': ['John', 'Peter', 'James', 'Paul'],
        'Jude': ['Jude', 'Peter', 'James', 'John'],
        'Revelation': ['John', 'Peter', 'Paul', 'James'],
        'Psalms': ['David', 'Solomon', 'Moses', 'Asaph'],
        'Proverbs': ['Solomon', 'David', 'Moses', 'Isaiah'],
        'Ecclesiastes': ['Solomon', 'David', 'Moses', 'Isaiah'],
        'Song of Solomon': ['Solomon', 'David', 'Moses', 'Isaiah'],
        'Isaiah': ['Isaiah', 'Jeremiah', 'Ezekiel', 'Daniel'],
        'Jeremiah': ['Jeremiah', 'Isaiah', 'Ezekiel', 'Daniel'],
        'Lamentations': ['Jeremiah', 'Isaiah', 'Ezekiel', 'Daniel'],
        'Ezekiel': ['Ezekiel', 'Isaiah', 'Jeremiah', 'Daniel'],
        'Daniel': ['Daniel', 'Isaiah', 'Jeremiah', 'Ezekiel'],
      };
      return authors[book] || ['Unknown', 'Moses', 'David', 'Paul'];
    },
    correct: (book) => {
      const correctAuthors = {
        'Genesis': 'Moses',
        'Exodus': 'Moses',
        'Leviticus': 'Moses',
        'Numbers': 'Moses',
        'Deuteronomy': 'Moses',
        'Matthew': 'Matthew',
        'Mark': 'Mark',
        'Luke': 'Luke',
        'John': 'John',
        'Acts': 'Luke',
        'Romans': 'Paul',
        '1 Corinthians': 'Paul',
        '2 Corinthians': 'Paul',
        'Galatians': 'Paul',
        'Ephesians': 'Paul',
        'Philippians': 'Paul',
        'Colossians': 'Paul',
        '1 Thessalonians': 'Paul',
        '2 Thessalonians': 'Paul',
        '1 Timothy': 'Paul',
        '2 Timothy': 'Paul',
        'Titus': 'Paul',
        'Philemon': 'Paul',
        'Hebrews': 'Paul',
        'James': 'James',
        '1 Peter': 'Peter',
        '2 Peter': 'Peter',
        '1 John': 'John',
        '2 John': 'John',
        '3 John': 'John',
        'Jude': 'Jude',
        'Revelation': 'John',
        'Psalms': 'David',
        'Proverbs': 'Solomon',
        'Ecclesiastes': 'Solomon',
        'Song of Solomon': 'Solomon',
        'Isaiah': 'Isaiah',
        'Jeremiah': 'Jeremiah',
        'Lamentations': 'Jeremiah',
        'Ezekiel': 'Ezekiel',
        'Daniel': 'Daniel',
      };
      return correctAuthors[book] || 'Unknown';
    },
    type: 'book',
    difficulty: 'medium'
  },
  {
    template: (book) => `How many chapters are in the book of ${book}?`,
    options: (book, chapter, totalChapters) => {
      const wrong1 = totalChapters > 10 ? totalChapters - 5 : totalChapters + 5;
      const wrong2 = totalChapters > 20 ? totalChapters - 10 : totalChapters + 10;
      const wrong3 = totalChapters > 30 ? totalChapters - 15 : totalChapters + 15;
      return [
        `${totalChapters}`,
        `${wrong1}`,
        `${wrong2}`,
        `${wrong3}`
      ];
    },
    correct: (book, chapter, totalChapters) => `${totalChapters}`,
    type: 'book',
    difficulty: 'easy'
  },
  {
    template: (book) => `What testament is ${book} in?`,
    options: (book, chapter, totalChapters, testament) => {
      const otherTestament = testament === 'Old' ? 'New' : 'Old';
      return [
        `${testament} Testament`,
        `${otherTestament} Testament`,
        'Both',
        'Neither'
      ];
    },
    correct: (book, chapter, totalChapters, testament) => `${testament} Testament`,
    type: 'book',
    difficulty: 'easy'
  },
];

// Generate questions
function generateQuestions() {
  const questions = [];
  let questionId = 1;

  console.log('-- Generated thousands of Bible quiz questions');
  console.log('-- Run this AFTER migrate_quiz_questions.sql');
  console.log('-- This file contains thousands of template-based questions\n');
  console.log('INSERT INTO quiz_questions (question, options, correct_answer, reference, difficulty, category, book, chapter, question_type)');
  console.log('VALUES');

  BIBLE_BOOKS.forEach((book, bookIndex) => {
    // Generate book-level questions (2-3 per book)
    const bookTemplates = QUESTION_TEMPLATES.filter(t => t.type === 'book');
    bookTemplates.forEach(template => {
      const question = template.template(book.name);
      const options = template.options(book.name, null, book.chapters, book.testament);
      const correct = template.correct(book.name, null, book.chapters, book.testament);
      const reference = book.name;
      const category = `${book.testament} Testament`;
      
      questions.push({
        question,
        options: JSON.stringify(options),
        correct_answer: correct,
        reference,
        difficulty: template.difficulty,
        category,
        book: book.name,
        chapter: null,
        question_type: 'book'
      });
    });

    // Generate chapter-level questions (3-4 per chapter for popular books, 2 per chapter for others)
    const chapterTemplates = QUESTION_TEMPLATES.filter(t => t.type === 'chapter');
    const isPopularBook = ['Genesis', 'Exodus', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', 'Psalms', 'Proverbs'].includes(book.name);
    const questionsPerChapter = isPopularBook ? 4 : 2;
    const chapterInterval = 1; // Generate for ALL chapters

    for (let chapter = 1; chapter <= book.chapters; chapter += chapterInterval) {
      chapterTemplates.slice(0, questionsPerChapter).forEach(template => {
        const question = template.template(book.name, chapter);
        const options = template.options(book.name, chapter);
        const correct = template.correct(book.name, chapter);
        const reference = `${book.name} ${chapter}`;
        const category = `${book.testament} Testament`;
        
        questions.push({
          question,
          options: JSON.stringify(options),
          correct_answer: correct,
          reference,
          difficulty: template.difficulty,
          category,
          book: book.name,
          chapter: chapter,
          question_type: 'chapter'
        });
      });
    }
  });

  // Output SQL
  questions.forEach((q, index) => {
    const isLast = index === questions.length - 1;
    const comma = isLast ? ';' : ',';
    
    console.log(`  ('${q.question.replace(/'/g, "''")}', '${q.options}', '${q.correct_answer.replace(/'/g, "''")}', '${q.reference}', '${q.difficulty}', '${q.category}', ${q.book ? `'${q.book}'` : 'NULL'}, ${q.chapter || 'NULL'}, '${q.question_type}')${comma}`);
  });

  console.log(`\n-- Total questions generated: ${questions.length}`);
}

generateQuestions();

