// Combine all batch files into one
const fs = require('fs');

// Read first batch to get header
const firstBatch = fs.readFileSync('supabase/thousands_quiz_questions_batch_1.sql', 'utf8');
const lines = firstBatch.split('\n');

// Find VALUES line
let valuesIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim().startsWith('VALUES')) {
    valuesIndex = i;
    break;
  }
}

const header = lines.slice(0, valuesIndex + 1).join('\n');

// Collect all question lines from all batches
const allQuestions = [];

for (let i = 1; i <= 30; i++) {
  const batchFile = `supabase/thousands_quiz_questions_batch_${i}.sql`;
  if (fs.existsSync(batchFile)) {
    const content = fs.readFileSync(batchFile, 'utf8');
    const batchLines = content.split('\n');
    
    // Extract question lines (between VALUES and comments)
    for (let j = valuesIndex + 1; j < batchLines.length; j++) {
      const line = batchLines[j].trim();
      if (line && !line.startsWith('--') && !line.startsWith('ON CONFLICT')) {
        // Remove trailing comma/semicolon
        const cleanLine = line.replace(/[,;]$/, '').trim();
        if (cleanLine) {
          allQuestions.push(cleanLine);
        }
      }
    }
  }
}

// Write combined file
const combined = header + '\n' + 
  allQuestions.map((line, idx) => {
    const isLast = idx === allQuestions.length - 1;
    return '  ' + line + (isLast ? ';' : ',');
  }).join('\n') + '\n\n-- Total questions: ' + allQuestions.length;

fs.writeFileSync('supabase/all_questions_combined.sql', combined);
console.log(`Created all_questions_combined.sql with ${allQuestions.length} questions`);

