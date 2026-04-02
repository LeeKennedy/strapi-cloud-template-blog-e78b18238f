// Usage:
// node --env-file=.env scripts/upload-exam-questions.mjs

import fs from 'fs';
import { parse } from 'csv-parse/sync';

// Load environment variables
const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_QUESTION_UPLOAD_TOKEN;

if (!STRAPI_TOKEN) {
  console.error('❌ STRAPI_QUESTION_UPLOAD_TOKEN is not set. Add it to your .env file.');
  process.exit(1);
}

// Read and parse the CSV file
const csv = fs.readFileSync('./scripts/exam-question-sample.csv', 'utf8');
const rows = parse(csv, { columns: true, skip_empty_lines: true });

// Looks up an exam by slug. The exam must already exist in Strapi admin
// before running this script — it will not create exams automatically.
async function findExam(row) {
  const slug = encodeURIComponent(row.examSlug);
  const res = await fetch(
    `${STRAPI_URL}/api/exams?filters%5Bslug%5D%5B%24eq%5D=${slug}`,
    { headers: { Authorization: `Bearer ${STRAPI_TOKEN}` } }
  );
  const data = await res.json();

  if (data.data?.length > 0) {
    return data.data[0].documentId;
  }

  console.error(`❌ No exam found with slug "${row.examSlug}". Create it in Strapi admin first.`);
  process.exit(1);
}

// Creates a new examQuestion and attaches it to the given exam.
// Note: this script is additive only — it never deletes or updates existing
// questions. Running it twice with the same CSV will create duplicates.
async function createQuestion(examId, row) {
  const res = await fetch(`${STRAPI_URL}/api/examQuestions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    body: JSON.stringify({
    data: {
        title: row.examQuestionTitle,
        question: row.question,
        correctAnswer: row.correctAnswer,
        correctRationale: row.correctRationale,
        distractor1: row.distractor1,
        distractor1Rationale: row.distractor1Rationale,
        distractor2: row.distractor2,
        distractor2Rationale: row.distractor2Rationale,
        distractor3: row.distractor3,
        distractor3Rationale: row.distractor3Rationale,
        isQuestionOf: examId,
    },
    }),
  });

  const text = await res.text();
}

async function main() {
  console.log(`Uploading ${rows.length} questions...\n`);

  for (const row of rows) {
    const examId = await findExam(row);
    await createQuestion(examId, row);
  }

  console.log('\nDone!');
}

main().catch(console.error);