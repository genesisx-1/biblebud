// Split the large SQL file into smaller batches for Supabase
// Run: node supabase/split_questions.js

const fs = require('fs');

// Read the generated file
const sqlFile = fs.readFileSync('supabase/thousands_quiz_questions.sql', 'utf8');
const lines = sqlFile.split('\n');

// Find where VALUES starts
let valuesStartIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim().startsWith('VALUES')) {
    valuesStartIndex = i;
    break;
  }
}

if (valuesStartIndex === -1) {
  console.error('Could not find VALUES line');
  process.exit(1);
}

// Get header (everything before VALUES)
const header = lines.slice(0, valuesStartIndex + 1).join('\n');

// Get all value lines (everything after VALUES, excluding comments and ON CONFLICT)
const valueLines = [];
for (let i = valuesStartIndex + 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line && !line.startsWith('--') && !line.startsWith('-- Total') && !line.startsWith('ON CONFLICT')) {
    // Remove trailing comma or semicolon if present, we'll add it back
    const cleanLine = line.replace(/[,;]$/, '').trim();
    if (cleanLine) {
      valueLines.push(cleanLine);
    }
  }
}

// Split into batches of 100 questions each
const batchSize = 100;
const batches = [];

for (let i = 0; i < valueLines.length; i += batchSize) {
  const batch = valueLines.slice(i, i + batchSize);
  batches.push(batch);
}

// Create batch files
batches.forEach((batch, index) => {
  const batchNumber = index + 1;
  const batchContent = header + '\n' + 
    batch.map((line, idx) => {
      const isLast = idx === batch.length - 1;
      // Remove any trailing comma or semicolon from the line first
      const cleanLine = line.replace(/[,;]$/, '').trim();
      return '  ' + cleanLine + (isLast ? ';' : ',');
    }).join('\n') + '\n\n-- Batch ' + batchNumber + ' of ' + batches.length + ' (' + batch.length + ' questions)';
  
  fs.writeFileSync(
    `supabase/thousands_quiz_questions_batch_${batchNumber}.sql`,
    batchContent
  );
  
  console.log(`Created batch ${batchNumber}: ${batch.length} questions`);
});

console.log(`\nTotal batches: ${batches.length}`);
console.log(`Total questions: ${valueLines.length}`);
console.log('\nRun these files in Supabase SQL Editor in order (batch_1, batch_2, etc.)');

