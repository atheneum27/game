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
let initialTimeLeft = 90; // Store initial time for the selected difficulty
let selectedDifficulty = 'easy'; // Track selected difficulty
let timerInterval = null;
let isGamePaused = false; // Track pause state for Adhan
let prayerTimes = null; // Store prayer times
let pauseEndTime = null; // Track when pause should end

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
        fetchPrayerTimes(); // Fetch prayer times after loading
      }, 500);
    }
  }, 80);
});

// Fetch prayer times based on user's location
async function fetchPrayerTimes() {
  try {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const today = new Date();
        const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        const response = await fetch(
          `http://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=2`
        );
        const data = await response.json();
        if (data.code === 200) {
          prayerTimes = data.data.timings; // Store prayer times (e.g., { Fajr: "05:15", Dhuhr: "12:30", ... })
          console.log('Prayer times fetched:', prayerTimes);
          checkAdhanTime(); // Start checking for Adhan times
        } else {
          console.error('Failed to fetch prayer times:', data);
          alert('Could not fetch prayer times. Adhan pause feature disabled.');
        }
      }, (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to access location. Adhan pause feature disabled.');
      });
    } else {
      console.error('Geolocation not supported');
      alert('Geolocation not supported. Adhan pause feature disabled.');
    }
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    alert('Error fetching prayer times. Adhan pause feature disabled.');
  }
}

// Convert prayer time (HH:MM) to minutes for comparison
function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Check if current time matches any Adhan time
function checkAdhanTime() {
  if (!prayerTimes) return;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  for (const prayer of prayerNames) {
    const prayerMinutes = timeToMinutes(prayerTimes[prayer]);
    // Check if current time is within 1 minute of prayer time
    if (Math.abs(currentMinutes - prayerMinutes) <= 1 && !isGamePaused) {
      pauseGameForAdhan(prayer);
      break;
    }
  }

  // Continue checking every 30 seconds
  setTimeout(checkAdhanTime, 30000);
}

// Pause game during Adhan
function pauseGameForAdhan(prayer) {
  if (timerInterval) {
    clearInterval(timerInterval); // Pause the game timer
    timerInterval = null;
  }
  isGamePaused = true;
  gameBoard.style.pointerEvents = 'none'; // Disable card clicks
  timerDisplay.textContent = `Game Paused for ${prayer} Prayer`;
  console.log(`Game paused for ${prayer} Adhan`);

  // Set pause duration (5 minutes)
  const pauseDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
  pauseEndTime = Date.now() + pauseDuration;

  // Check periodically to resume game
  const resumeCheck = setInterval(() => {
    if (Date.now() >= pauseEndTime) {
      clearInterval(resumeCheck);
      resumeGameAfterAdhan();
    }
  }, 1000);
}

// Resume game after Adhan pause
function resumeGameAfterAdhan() {
  if (!isGamePaused) return;
  isGamePaused = false;
  gameBoard.style.pointerEvents = 'auto'; // Re-enable card clicks
  timerDisplay.textContent = `Time remaining: ${timeLeft}s`;
  if (timeLeft > 0 && matchesFound < totalPairs) {
    startTimer(); // Resume timer if game is still active
  }
  console.log('Game resumed after Adhan');
}

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
    if (!isGamePaused) {
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
  isGamePaused = false;
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
    if (!isGamePaused) startTimer();
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
    if (!isGamePaused) startTimer();
  } catch (error) {
    console.error('Error in initGame:', error);
    alert('An error occurred while starting the game. Please try again.');
  }
}

function flipCard(card) {
  if (isGamePaused) return; // Prevent flipping during pause
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
      if (!isGamePaused) {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        flippedCards = [];
      }
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
  tryAgainButton.disabled = true;
  restartGame();
  setTimeout(() => {
    tryAgainButton.disabled = false;
  }, 1000);
});

backButton.addEventListener('click', () => {
  console.log('Back button clicked');
  resetGame();
});
