// Seed script for Nobilis Academy database
// Run with: npx tsx prisma/seed.ts

// NOTE: This requires DATABASE_URL to be configured and Prisma Client generated
// For now, this is a reference for the data structure

const seedData = {
  users: [
    { email: 'student@nobilis.kz', name: 'Алия Нурланова', role: 'STUDENT' },
    { email: 'mentor@nobilis.kz', name: 'Ментор Нурбек', role: 'MENTOR' },
    { email: 'parent@nobilis.kz', name: 'Родитель Нурланов', role: 'PARENT' },
    { email: 'admin@nobilis.kz', name: 'Админ', role: 'ADMIN' },
    { email: 'b2b@university.edu', name: 'University of Toronto Scout', role: 'B2B_UNI' },
  ],

  universities: [
    { name: 'University of Toronto', country: 'Canada', city: 'Toronto', ranking: 21, tuitionMin: 25000, tuitionMax: 45000, gpaRequirement: 3.5, ieltsRequirement: 6.5, scholarshipAvailable: true, faculties: ['CS', 'Engineering', 'Business', 'Arts'] },
    { name: 'KIT Karlsruhe', country: 'Germany', city: 'Karlsruhe', ranking: 120, tuitionMin: 0, tuitionMax: 1500, gpaRequirement: 3.0, ieltsRequirement: 6.0, scholarshipAvailable: false, faculties: ['Engineering', 'CS', 'Physics'] },
    { name: 'Korea University', country: 'South Korea', city: 'Seoul', ranking: 74, tuitionMin: 5000, tuitionMax: 12000, gpaRequirement: 3.2, ieltsRequirement: 6.5, scholarshipAvailable: true, faculties: ['Business', 'Engineering', 'IT'] },
    { name: 'Masaryk University', country: 'Czech Republic', city: 'Brno', ranking: 400, tuitionMin: 0, tuitionMax: 3000, gpaRequirement: 2.5, ieltsRequirement: 5.5, scholarshipAvailable: false, faculties: ['IT', 'Medicine', 'Law'] },
    { name: 'University of Arizona', country: 'USA', city: 'Tucson', ranking: 99, tuitionMin: 20000, tuitionMax: 35000, gpaRequirement: 3.0, ieltsRequirement: 6.5, scholarshipAvailable: true, faculties: ['Data Science', 'Engineering', 'Business'] },
  ],

  quizQuestions: [
    { skill: 'READING', difficulty: 'EASY', question: 'The synonym of "happy" is:', options: ['Sad', 'Joyful', 'Angry', 'Tired'], correctAnswer: 1, explanation: '"Joyful" means feeling or expressing great happiness.', timeLimit: 20 },
    { skill: 'READING', difficulty: 'MEDIUM', question: 'Choose the correct word: She _____ to work every day.', options: ['go', 'goes', 'going', 'gone'], correctAnswer: 1, explanation: 'Third person singular requires "goes".', timeLimit: 30 },
    { skill: 'LISTENING', difficulty: 'EASY', question: 'What does "occasionally" mean?', options: ['Always', 'Never', 'Sometimes', 'Rarely'], correctAnswer: 2, explanation: '"Occasionally" means sometimes or from time to time.', timeLimit: 20 },
    { skill: 'MATH', difficulty: 'MEDIUM', question: 'If x + 3 = 7, what is x?', options: ['3', '4', '5', '10'], correctAnswer: 1, explanation: 'x = 7 - 3 = 4', timeLimit: 30 },
  ],
};

async function main() {
  console.log('Seed data prepared. Connect to database to insert.');
  console.log(`Users: ${seedData.users.length}`);
  console.log(`Universities: ${seedData.universities.length}`);
  console.log(`Quiz Questions: ${seedData.quizQuestions.length}`);

  // Uncomment when Prisma is connected:
  // const { PrismaClient } = require('@prisma/client');
  // const prisma = new PrismaClient();
  // for (const user of seedData.users) { await prisma.user.create({ data: user }); }
  // ...
}

main();

export default seedData;
