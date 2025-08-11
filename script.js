const cardsData = [
  { value: 'Pembina', logo: 'https://via.placeholder.com/80?text=Logo' },
  { value: 'Pembina', logo: 'https://via.placeholder.com/80?text=Logo' },
  { value: 'Rois Roisah', logo: 'https://via.placeholder.com/80?text=Logo' },
  { value: 'Rois Roisah', logo: 'https://via.placeholder.com/80?text=Logo' },
  { value: 'Sekretaris Umum', logo: 'https://via.placeholder.com/80?text=Logo' },
  { value: 'Sekretaris Umum', logo: 'https://via.placeholder.com/80?text=Logo' },
  { value: 'Bendahara Umum', logo: 'https://via.placeholder.com/80?text=Logo' },
  { value: 'Bendahara Umum', logo: 'https://via.placeholder.com/80?text=Logo' },
  { value: 'Pemberdayaan Sumber Daya Manusia', logo: 'https://via.placeholder.com/80?text=Logo' },
  { value: 'Pemberdayaan Sumber Daya Manusia', logo: 'https://via.placeholder.com/80?text=Logo' },
  { value: 'Syiar dan Dakwah', logo: 'https://via.placeholder.com/80?text=Logo' },
  { value: 'Syiar dan Dakwah', logo: 'https://via.placeholder.com/80?text=Logo' },
  { value: 'Dewan Kemakmuran Masjid', logo: 'https://via.placeholder.com/80?text=Logo' },
  { value: 'Dewan Kemakmuran Masjid', logo: 'https://via.placeholder.com/80?text=Logo' },
  { value: 'Jasadiyah wa Ruhiyah', logo: 'https://via.placeholder.com/80?text=Logo' },
  { value: 'Jasadiyah wa Ruhiyah', logo: 'https://via.placeholder.com/80?text=Logo' }
];

let gameBoard = document.getElementById('gameBoard');
let status = document.getElementById('status');
let timerDisplay = document.getElementById('timer');
let startButton = document.getElementById('startButton');
let tryAgainButton = document.getElementById('tryAgainButton');
let backButton = document.getElementById('backButton');
let difficultySelection = document.getElementById('difficultySelection');
let easyButton = document.getElementById('easyButton');
let mediumButton = document.getElementById('mediumButton');
let hardButton = document.getElementById('hardButton');
let loaderLayer = document.querySelector('.loader-layer');
let barProgress = document.querySelector('.bar-progress');
let flippedCards = [];
let matchesFound = 0;
const totalPairs = cardsData.length / 2;
let timeLeft = 90; // Default time (Easy)
let initialTimeLeft = 90; // Store initial time for the selected difficulty (Easy)
let selectedDifficulty = 'easy'; // Track selected difficulty
let timerInterval = null;

// Loader simulation
window.addEventListener('load', () => {
  let progress = 0;
  const interval = setInterval(() => {
    progress += 5;
    barProgress.style.width = `${progress}%`;
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        loaderLayer.classList.add('loaded');
        document.body.classList.remove('loading');
      }, 500);
    }
  }, 80);
});

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createCard(cardData) {
  const card = document.createElement('div');
  card.classList.add('unit-card');
  
  const inner = document.createElement('div');
  inner.classList.add('card-inner');
  
  const front = document.createElement('div');
  front.classList.add('card-front');
  
  const back = document.createElement('div');
  back.classList.add('card-back');
  back.innerHTML = `
        <h3>${cardData.value}</h3>
        <img src="${cardData.logo}" alt="${cardData.value} Logo">
    `;
  
  inner.appendChild(front);
  inner.appendChild(back);
  card.appendChild(inner);
  
  card.addEventListener('click', () => flipCard(card));
  console.log(`Created card with value: ${cardData.value}`);
  return card;
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval); // Prevent multiple timers
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time remaining: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      gameBoard.style.pointerEvents = 'none';
      tryAgainButton.style.display = 'block';
      backButton.style.display = 'block';
      setTimeout(() => alert('Game Over! Time ran out.'), 500);
      console.log('Game over, time reached 0');
    }
  }, 1000);
}

function resetGame() {
  console.log('Resetting game to difficulty selection');
  clearInterval(timerInterval);
  gameBoard.innerHTML = '';
  flippedCards = [];
  matchesFound = 0;
  status.textContent = `Matches found: ${matchesFound} / ${totalPairs}`;
  timerDisplay.textContent = `Time remaining: ${initialTimeLeft}s`;
  gameBoard.style.pointerEvents = 'auto';
  gameBoard.style.display = 'none';
  status.style.display = 'none';
  timerDisplay.style.display = 'none';
  tryAgainButton.style.display = 'none';
  backButton.style.display = 'none';
  difficultySelection.style.display = 'block';
}

function restartGame() {
  try {
    console.log(`Restarting game with difficulty: ${selectedDifficulty}, initial timeLeft: ${initialTimeLeft}`);
    clearInterval(timerInterval);
    gameBoard.innerHTML = '';
    flippedCards = [];
    matchesFound = 0;
    timeLeft = initialTimeLeft;
    if (!Number.isInteger(initialTimeLeft) || initialTimeLeft <= 0) {
      console.error(`Invalid initialTimeLeft: ${initialTimeLeft} for difficulty: ${selectedDifficulty}. Falling back to 90 seconds.`);
      initialTimeLeft = 90;
      timeLeft = 90;
      selectedDifficulty = 'easy';
    }
    status.textContent = `Matches found: ${matchesFound} / ${totalPairs}`;
    gameBoard.style.pointerEvents = 'auto';
    gameBoard.style.display = 'grid';
    status.style.display = 'block';
    timerDisplay.style.display = 'block';
    tryAgainButton.style.display = 'none';
    backButton.style.display = 'block';
    initGameBoard();
    timerDisplay.textContent = `Time remaining: ${timeLeft}s`;
    console.log(`Timer reset to: ${timeLeft}s for difficulty: ${selectedDifficulty}`);
    startTimer();
  } catch (error) {
    console.error('Error in restartGame:', error);
    alert('An error occurred while restarting the game. Please try again.');
  }
}

function initGameBoard() {
  shuffle(cardsData);
  cardsData.forEach(cardData => {
    const card = createCard(cardData);
    gameBoard.appendChild(card);
  });
  console.log(`Appended ${cardsData.length} cards to game board`);
}

function initGame() {
  try {
    console.log(`Initializing game with difficulty: ${selectedDifficulty}, timeLeft: ${timeLeft}, initialTimeLeft: ${initialTimeLeft}`);
    gameBoard.innerHTML = '';
    initGameBoard();
    gameBoard.style.display = 'grid';
    status.style.display = 'block';
    timerDisplay.style.display = 'block';
    startButton.style.display = 'none';
    difficultySelection.style.display = 'none';
    tryAgainButton.style.display = 'none';
    backButton.style.display = 'block';
    timerDisplay.textContent = `Time remaining: ${timeLeft}s`;
    startTimer();
  } catch (error) {
    console.error('Error in initGame:', error);
    alert('An error occurred while starting the game. Please try again.');
  }
}

function flipCard(card) {
  if (flippedCards.length < 2 && !card.classList.contains('flipped') && !card.classList.contains('matched') && timeLeft > 0) {
    card.classList.add('flipped');
    flippedCards.push(card);
    console.log('Flipped card:', card.querySelector('.card-back h3').textContent);
    
    if (flippedCards.length === 2) {
      checkMatch();
    }
  }
}

function checkMatch() {
  const [card1, card2] = flippedCards;
  const value1 = card1.querySelector('.card-back h3').textContent;
  const value2 = card2.querySelector('.card-back h3').textContent;
  
  console.log(`Checking match: ${value1} vs ${value2}`);
  
  if (value1 === value2) {
    card1.classList.add('matched');
    card2.classList.add('matched');
    matchesFound++;
    status.textContent = `Matches found: ${matchesFound} / ${totalPairs}`;
    if (matchesFound === totalPairs) {
      clearInterval(timerInterval);
      timerDisplay.textContent = `Time remaining: ${timeLeft}s`;
      gameBoard.style.pointerEvents = 'none';
      tryAgainButton.style.display = 'block';
      backButton.style.display = 'block';
      setTimeout(() => alert('You won!'), 500);
    }
    flippedCards = [];
  } else {
    setTimeout(() => {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      flippedCards = [];
    }, 1000);
  }
}

// Difficulty selection
easyButton.addEventListener('click', () => {
  timeLeft = 90;
  initialTimeLeft = 90;
  selectedDifficulty = 'easy';
  console.log('Difficulty set to Easy, timeLeft:', timeLeft, 'initialTimeLeft:', initialTimeLeft, 'selectedDifficulty:', selectedDifficulty);
  initGame();
});

mediumButton.addEventListener('click', () => {
  timeLeft = 60;
  initialTimeLeft = 60;
  selectedDifficulty = 'medium';
  console.log('Difficulty set to Medium, timeLeft:', timeLeft, 'initialTimeLeft:', initialTimeLeft, 'selectedDifficulty:', selectedDifficulty);
  initGame();
});

hardButton.addEventListener('click', () => {
  timeLeft = 30;
  initialTimeLeft = 30;
  selectedDifficulty = 'hard';
  console.log('Difficulty set to Hard, timeLeft:', timeLeft, 'initialTimeLeft:', initialTimeLeft, 'selectedDifficulty:', selectedDifficulty);
  initGame();
});

startButton.addEventListener('click', () => {
  console.log('Start button clicked');
  initGame();
});

tryAgainButton.addEventListener('click', () => {
  console.log('Try Again button clicked, restarting with difficulty:', selectedDifficulty, 'initialTimeLeft:', initialTimeLeft);
  tryAgainButton.disabled = true; // Disable button to prevent multiple clicks
  restartGame();
  setTimeout(() => {
    tryAgainButton.disabled = false; // Re-enable after restart
  }, 1000);
});

backButton.addEventListener('click', () => {
  console.log('Back button clicked');
  resetGame();
});
