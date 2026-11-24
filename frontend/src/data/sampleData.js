// Sample data for features the backend does not serve yet.
// Remove entries here as the matching endpoints are added.

const inDays = (d) => new Date(Date.now() + d * 86400000).toISOString();

// Drive id 1 matches the drive seeded by the backend, so applying to it hits the real API.
export const SAMPLE_DRIVES = [
  {
    id: 1,
    companyName: 'Acme Technologies',
    jobTitle: 'Software Engineer Intern',
    jobDescription: 'Summer internship for final-year students.',
    requiredTechStacks: '["Java", "Spring Boot", "SQL"]',
    minimumScore: 60,
    applicationDeadline: inDays(30),
    active: true,
  },
  {
    id: 1001,
    companyName: 'Nimbus Cloud',
    jobTitle: 'Associate Cloud Engineer',
    jobDescription: 'Work on infrastructure automation and internal developer tooling.',
    requiredTechStacks: '["Python", "AWS", "Linux"]',
    minimumScore: 75,
    applicationDeadline: inDays(14),
    active: true,
    sample: true,
  },
  {
    id: 1002,
    companyName: 'Pixel Labs',
    jobTitle: 'Frontend Developer',
    jobDescription: 'Build product UI in React with a small design-led team.',
    requiredTechStacks: '["JavaScript", "React", "CSS"]',
    minimumScore: 50,
    applicationDeadline: inDays(7),
    active: true,
    sample: true,
  },
  {
    id: 1003,
    companyName: 'DataForge Analytics',
    jobTitle: 'Data Analyst Trainee',
    jobDescription: 'SQL-heavy analytics role supporting the business intelligence team.',
    requiredTechStacks: '["SQL", "Excel", "Python"]',
    minimumScore: 65,
    applicationDeadline: inDays(-2),
    active: true,
    sample: true,
  },
];

// Quiz question bank. The backend stores quiz metadata (title, duration, count)
// but not questions yet, so questions come from here, matched by quiz title.
const JAVA_QUESTIONS = [
  { q: 'Which keyword is used to inherit a class in Java?', options: ['implements', 'extends', 'inherits', 'super'], answer: 1 },
  { q: 'Which collection does NOT allow duplicate elements?', options: ['ArrayList', 'LinkedList', 'HashSet', 'Vector'], answer: 2 },
  { q: 'What is the default value of an int field in a Java class?', options: ['null', '0', 'undefined', '-1'], answer: 1 },
  { q: 'Which exception is checked?', options: ['NullPointerException', 'ArithmeticException', 'IOException', 'IllegalArgumentException'], answer: 2 },
  { q: 'Which method must a class implement to be used as a Runnable?', options: ['start()', 'run()', 'execute()', 'call()'], answer: 1 },
  { q: 'What does the `final` keyword on a class mean?', options: ['It cannot be instantiated', 'It cannot be subclassed', 'All methods are static', 'It is immutable'], answer: 1 },
  { q: 'Which of these is NOT a Java access modifier?', options: ['private', 'protected', 'internal', 'public'], answer: 2 },
  { q: 'HashMap allows how many null keys?', options: ['None', 'One', 'Unlimited', 'Two'], answer: 1 },
  { q: 'Which statement about interfaces (Java 8+) is true?', options: ['They cannot have method bodies', 'They can have default methods', 'They can have constructors', 'They can extend classes'], answer: 1 },
  { q: 'What is the time complexity of get() on an ArrayList?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], answer: 0 },
];

const GENERAL_QUESTIONS = [
  { q: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'], answer: 1 },
  { q: 'Which data structure uses FIFO order?', options: ['Stack', 'Queue', 'Tree', 'Graph'], answer: 1 },
  { q: 'Which SQL clause filters grouped rows?', options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'], answer: 1 },
  { q: 'Which sorting algorithm has the best worst-case complexity?', options: ['Quick sort', 'Bubble sort', 'Merge sort', 'Insertion sort'], answer: 2 },
  { q: 'What does HTTP status 404 mean?', options: ['Server error', 'Unauthorized', 'Not found', 'Redirect'], answer: 2 },
  { q: 'Which is NOT an OOP principle?', options: ['Encapsulation', 'Polymorphism', 'Compilation', 'Inheritance'], answer: 2 },
  { q: 'A primary key in a table must be…', options: ['Nullable', 'Unique and not null', 'A string', 'Auto-incremented'], answer: 1 },
  { q: 'Which traversal visits the root first?', options: ['In-order', 'Post-order', 'Pre-order', 'Level-order'], answer: 2 },
  { q: 'What is a deadlock?', options: ['A crashed process', 'Processes waiting on each other forever', 'An infinite loop', 'A memory leak'], answer: 1 },
  { q: 'Which Git command creates a new branch and switches to it?', options: ['git branch -d', 'git switch -c', 'git merge', 'git push -u'], answer: 1 },
];

export function questionsForQuiz(quiz) {
  const bank = /java/i.test(quiz?.title ?? '') ? JAVA_QUESTIONS : GENERAL_QUESTIONS;
  const count = Math.min(quiz?.totalQuestions || bank.length, bank.length);
  return bank.slice(0, count);
}

// Starter code per language. JavaScript runs in the browser; the others need the evaluation backend.
export const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', runnable: true },
  { id: 'python', label: 'Python', runnable: false },
  { id: 'java', label: 'Java', runnable: false },
  { id: 'cpp', label: 'C++', runnable: false },
];

export function starterCode(language, problem) {
  const sample = firstTestInput(problem);
  const hint = sample ? `input looks like: ${JSON.stringify(sample)}` : 'input is the test case input object';
  switch (language) {
    case 'javascript':
      return `/**\n * ${problem?.title ?? 'Solution'}\n * ${hint}\n * Return the expected output.\n */\nfunction solve(input) {\n  // your code here\n}\n`;
    case 'python':
      return `# ${problem?.title ?? 'Solution'}\n# ${hint}\ndef solve(input):\n    # your code here\n    pass\n`;
    case 'java':
      return `// ${problem?.title ?? 'Solution'}\nimport java.util.*;\n\nclass Solution {\n    public Object solve(Map<String, Object> input) {\n        // your code here\n        return null;\n    }\n}\n`;
    case 'cpp':
      return `// ${problem?.title ?? 'Solution'}\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}\n`;
    default:
      return '';
  }
}

export function parseTestCases(problem) {
  try {
    const parsed = JSON.parse(problem?.testCasesJson || '{}');
    return Array.isArray(parsed) ? parsed : parsed.testCases || [];
  } catch {
    return [];
  }
}

function firstTestInput(problem) {
  return parseTestCases(problem)[0]?.input;
}
