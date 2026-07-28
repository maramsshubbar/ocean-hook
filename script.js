// ===== ELEMENTS =====
const startButton = document.querySelector('#start-btn');
const startScreen = document.querySelector('.start-screen');
const gameScreen = document.querySelector('.game-screen');
const ocean = document.querySelector('#ocean');
const scoreEl = document.querySelector('#score');
const coinsEl = document.querySelector('#coins');
const caughtEl = document.querySelector('#caught');

// ===== GAME STATE =====
let score = 0;
let coins = 0;
let caught = 0;
let fishSpawnInterval;

// ===== FISH DATA =====
const fishTypes = [
  { img: 'fish1.png', points: 10, coins: 2, speed: 3 },
  { img: 'fish2.png', points: 15, coins: 3, speed: 4 },
  { img: 'fish3.png', points: 20, coins: 5, speed: 5 },
  { img: 'fish4.png', points: 25, coins: 6, speed: 3 },
  { img: 'fish5.png', points: 30, coins: 8, speed: 4 },
  { img: 'fish6.png', points: 50, coins: 10, speed: 6 },
];

// ===== START GAME =====
startButton.addEventListener('click', function () {
  startScreen.style.display = 'none';
  gameScreen.style.display = 'block';
  startGame();
});

// ===== GAME LOGIC =====
function startGame() {
  score = 0;
  coins = 0;
  caught = 0;
  updateUI();

  // Spawn a new fish every 1.5 seconds
  fishSpawnInterval = setInterval(spawnFish, 1500);
}

function spawnFish() {
  // Pick a random fish type
  const type = fishTypes[Math.floor(Math.random() * fishTypes.length)];

  // Create the fish element
  const fish = document.createElement('img');
  fish.src = `assets/images/${type.img}`;
  fish.classList.add('fish');

  // Random vertical position (avoid top bar and cannon)
  const topPos = 80 + Math.random() * (window.innerHeight - 250);
  fish.style.top = `${topPos}px`;

  // Random direction (left → right OR right → left)
  const goingRight = Math.random() > 0.5;
  let posX = goingRight ? -100 : window.innerWidth + 100;
  fish.style.left = `${posX}px`;

  // Flip fish if going left
  if (!goingRight) {
    fish.style.transform = 'scaleX(-1)';
  }

  ocean.appendChild(fish);

  // Click to catch the fish
  fish.addEventListener('click', function () {
    catchFish(fish, type);
  });

  // Move fish across the screen
  const moveInterval = setInterval(() => {
    posX += goingRight ? type.speed : -type.speed;
    fish.style.left = `${posX}px`;

    // Remove fish if it goes off screen
    if (posX > window.innerWidth + 200 || posX < -200) {
      clearInterval(moveInterval);
      fish.remove();
    }
  }, 30);

  // Save interval on the element so we can clear it on catch
  fish.dataset.interval = moveInterval;
}

function catchFish(fish, type) {
  score += type.points;
  coins += type.coins;
  caught += 1;
  updateUI();

  // Simple catch animation
  fish.style.transition = 'transform 0.3s, opacity 0.3s';
  fish.style.transform = 'scale(0)';
  fish.style.opacity = '0';

  setTimeout(() => fish.remove(), 300);
}

function updateUI() {
  scoreEl.textContent = score;
  coinsEl.textContent = coins;
  caughtEl.textContent = caught;
}