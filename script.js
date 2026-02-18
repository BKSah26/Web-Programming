// ── QUESTION BANK ──
const QUESTION_BANK = [
  {
    category: "Science",
    question: "What is the chemical symbol for Gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    answer: 2
  },
  {
    category: "Science",
    question: "How many bones are in the adult human body?",
    options: ["196", "206", "216", "186"],
    answer: 1
  },
  {
    category: "Science",
    question: "What planet is known as the Red Planet?",
    options: ["Venus", "Jupiter", "Saturn", "Mars"],
    answer: 3
  },
  {
    category: "Geography",
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    answer: 3
  },
  {
    category: "Geography",
    question: "Which country has the most natural lakes?",
    options: ["Russia", "USA", "Canada", "Finland"],
    answer: 2
  },
  {
    category: "Geography",
    question: "What is the capital city of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
    answer: 2
  },
  {
    category: "History",
    question: "In which year did World War II end?",
    options: ["1943", "1944", "1946", "1945"],
    answer: 3
  },
  {
    category: "History",
    question: "Who was the first President of the United States?",
    options: ["Abraham Lincoln", "Thomas Jefferson", "George Washington", "John Adams"],
    answer: 2
  },
  {
    category: "History",
    question: "The ancient Olympic Games originated in which country?",
    options: ["Rome", "Greece", "Egypt", "Persia"],
    answer: 1
  },
  {
    category: "Technology",
    question: "What does 'HTTP' stand for?",
    options: ["HyperText Transfer Protocol", "High Tech Transfer Process", "HyperText Transmission Program", "Hyper Transfer Text Protocol"],
    answer: 0
  },
  {
    category: "Technology",
    question: "Who co-founded Apple Inc. along with Steve Jobs?",
    options: ["Bill Gates", "Steve Wozniak", "Mark Zuckerberg", "Elon Musk"],
    answer: 1
  },
  {
    category: "Technology",
    question: "What programming language is the backbone of the web?",
    options: ["Python", "Java", "C++", "JavaScript"],
    answer: 3
  },
  {
    category: "General Knowledge",
    question: "How many sides does a hexagon have?",
    options: ["5", "7", "8", "6"],
    answer: 3
  },
  {
    category: "General Knowledge",
    question: "What is the largest mammal on Earth?",
    options: ["African Elephant", "Blue Whale", "Giraffe", "Great White Shark"],
    answer: 1
  },
  {
    category: "General Knowledge",
    question: "Which element has the atomic number 1?",
    options: ["Helium", "Oxygen", "Hydrogen", "Carbon"],
    answer: 2
  },
  {
    category: "Pop Culture",
    question: "Which fictional detective lives at 221B Baker Street?",
    options: ["Hercule Poirot", "Philip Marlowe", "Sherlock Holmes", "Sam Spade"],
    answer: 2
  },
  {
    category: "Pop Culture",
    question: "How many strings does a standard guitar have?",
    options: ["4", "5", "7", "6"],
    answer: 3
  },
  {
    category: "Science",
    question: "What is the speed of light (approximate) in km/s?",
    options: ["200,000", "400,000", "300,000", "150,000"],
    answer: 2
  },
  {
    category: "Geography",
    question: "Which river is the longest in the world?",
    options: ["Amazon", "Nile", "Yangtze", "Mississippi"],
    answer: 1
  },
  {
    category: "General Knowledge",
    question: "How many players are on a standard soccer (football) team?",
    options: ["9", "10", "12", "11"],
    answer: 3
  }
];

// ── CONFIG ──
const TOTAL_QUESTIONS = 10;
const TIMER_SECONDS = 30;
const CIRCUMFERENCE = 2 * Math.PI * 24; // r=24

// ── STATE ──
let questions = [];
let currentIndex = 0;
let score = 0;
let correctCount = 0;
let wrongCount = 0;
let skippedCount = 0;
let timerInterval = null;
let timeLeft = TIMER_SECONDS;
let answered = false;

// ── ELEMENTS ──
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const nextBtn = document.getElementById('next-btn');
const qCurrent = document.getElementById('q-current');
const qCategory = document.getElementById('q-category');
const qText = document.getElementById('q-text');
const optionsGrid = document.getElementById('options-grid');
const progressBar = document.getElementById('progress-bar');
const timerText = document.getElementById('timer-text');
const ringProgress = document.getElementById('ring-progress');
const liveScore = document.getElementById('live-score');
const questionCard = document.getElementById('question-card');

// ── HELPERS ──
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function pickQuestions() {
  return shuffle(QUESTION_BANK).slice(0, TOTAL_QUESTIONS);
}

// ── TIMER ──
function startTimer() {
  timeLeft = TIMER_SECONDS;
  updateTimerUI();
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      autoAdvance();
    }
  }, 1000);
}

function updateTimerUI() {
  timerText.textContent = timeLeft;
  const offset = CIRCUMFERENCE * (1 - timeLeft / TIMER_SECONDS);
  ringProgress.style.strokeDashoffset = offset;

  const isDanger = timeLeft <= 8;
  ringProgress.classList.toggle('danger', isDanger);
  timerText.classList.toggle('danger', isDanger);
}

function autoAdvance() {
  if (!answered) {
    skippedCount++;
    revealCorrect();
    answered = true;
  }
  nextBtn.disabled = false;
  // Auto-go after 1.2s
  setTimeout(() => {
    advance();
  }, 1200);
}

// ── QUIZ LOGIC ──
function startQuiz() {
  questions = pickQuestions();
  currentIndex = 0;
  score = 0;
  correctCount = 0;
  wrongCount = 0;
  skippedCount = 0;
  liveScore.textContent = '0';
  showScreen('quiz-screen');
  loadQuestion();
}

function loadQuestion() {
  answered = false;
  nextBtn.disabled = true;

  const q = questions[currentIndex];
  qCurrent.textContent = currentIndex + 1;
  qCategory.textContent = q.category;
  qText.textContent = q.question;

  // Progress
  progressBar.style.width = ((currentIndex + 1) / TOTAL_QUESTIONS * 100) + '%';

  // Animate card
  questionCard.style.animation = 'none';
  void questionCard.offsetWidth;
  questionCard.style.animation = 'card-in 0.4s cubic-bezier(.4,0,.2,1)';

  // Build options
  optionsGrid.innerHTML = '';
  const labels = ['A', 'B', 'C', 'D'];
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="opt-label">${labels[i]}</span>${opt}`;
    btn.addEventListener('click', () => selectAnswer(i, btn));
    optionsGrid.appendChild(btn);
  });

  startTimer();
}

function selectAnswer(index, btn) {
  if (answered) return;
  answered = true;
  clearInterval(timerInterval);

  const q = questions[currentIndex];
  const allBtns = optionsGrid.querySelectorAll('.option-btn');

  allBtns.forEach(b => b.disabled = true);

  if (index === q.answer) {
    btn.classList.add('correct');
    score++;
    correctCount++;
    liveScore.textContent = score;
  } else {
    btn.classList.add('wrong');
    wrongCount++;
    // Reveal correct
    allBtns[q.answer].classList.add('correct');
  }

  nextBtn.disabled = false;
}

function revealCorrect() {
  const q = questions[currentIndex];
  const allBtns = optionsGrid.querySelectorAll('.option-btn');
  allBtns.forEach(b => b.disabled = true);
  allBtns[q.answer].classList.add('correct');
}

function advance() {
  currentIndex++;
  if (currentIndex >= TOTAL_QUESTIONS) {
    showResult();
  } else {
    loadQuestion();
  }
}

nextBtn.addEventListener('click', () => {
  if (!answered) {
    skippedCount++;
    revealCorrect();
    answered = true;
    clearInterval(timerInterval);
  }
  advance();
});

// ── RESULT ──
function showResult() {
  clearInterval(timerInterval);
  showScreen('result-screen');

  document.getElementById('final-score').textContent = score;
  document.getElementById('stat-correct').textContent = correctCount;
  document.getElementById('stat-wrong').textContent = wrongCount;
  document.getElementById('stat-skipped').textContent = skippedCount;

  const pct = score / TOTAL_QUESTIONS;
  let icon, title;
  if (pct === 1) { icon = '🏆'; title = 'Perfect Score!'; }
  else if (pct >= 0.8) { icon = '🎉'; title = 'Excellent!'; }
  else if (pct >= 0.6) { icon = '👍'; title = 'Good Job!'; }
  else if (pct >= 0.4) { icon = '🤔'; title = 'Keep Practicing!'; }
  else { icon = '💡'; title = 'Keep Learning!'; }

  document.getElementById('result-icon').textContent = icon;
  document.getElementById('result-title').textContent = title;
}

// ── EVENTS ──
startBtn.addEventListener('click', startQuiz);
restartBtn.addEventListener('click', startQuiz);

// Init ring
ringProgress.style.strokeDasharray = CIRCUMFERENCE;
ringProgress.style.strokeDashoffset = 0;