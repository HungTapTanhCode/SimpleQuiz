require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');
const Question = require('../models/question');
const Quiz = require('../models/quiz');
const { hashPassword } = require('../middleware/authenticate');

const questionFixtures = [
  { text: 'Which HTTP method is used to retrieve a resource?', options: ['POST', 'GET', 'DELETE', 'PATCH'], keywords: ['http', 'rest'], correctAnswerIndex: 1 },
  { text: 'Which React hook stores local component state?', options: ['useEffect', 'useMemo', 'useState', 'useContext'], keywords: ['react', 'hooks'], correctAnswerIndex: 2 },
  { text: 'What is Redux primarily used for?', options: ['Styling pages', 'Managing shared application state', 'Connecting MongoDB', 'Compiling JSX'], keywords: ['redux', 'state'], correctAnswerIndex: 1 },
  { text: 'Which database type is MongoDB?', options: ['Relational', 'Graph only', 'Document-oriented', 'Key-value only'], keywords: ['mongodb', 'database'], correctAnswerIndex: 2 }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  const admin = await User.findOneAndUpdate(
    { username: 'admin' },
    { username: 'admin', passwordHash: hashPassword('Admin@123'), admin: true },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );
  await User.findOneAndUpdate(
    { username: 'student' },
    { username: 'student', passwordHash: hashPassword('Student@123'), admin: false },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );

  const questions = [];
  for (const fixture of questionFixtures) {
    questions.push(await Question.findOneAndUpdate(
      { text: fixture.text },
      { ...fixture, author: admin._id },
      { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
    ));
  }

  await Quiz.findOneAndUpdate(
    { title: 'Web Development Fundamentals' },
    { title: 'Web Development Fundamentals', description: 'A four-question quiz covering HTTP, React, Redux, and MongoDB.', questions: questions.map(question => question._id) },
    { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
  );

  console.log('ASM04 demo data ready');
  console.log('Admin:   admin / Admin@123');
  console.log('User:    student / Student@123');
  await mongoose.disconnect();
}

seed().catch(async error => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
