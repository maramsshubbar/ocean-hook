// =========================
// GET HTML ELEMENTS
// =========================

const startScreen = document.querySelector('#start-screen');
const gameScreen = document.querySelector('#game-screen');

const startButton = document.querySelector('#start-btn');
const restartButton = document.querySelector('#restart-btn');

const gameArea = document.querySelector('#game-area');

const scoreDisplay = document.querySelector('#score');
const fishCaughtDisplay = document.querySelector('#fish-caught');
const timerDisplay = document.querySelector('#timer');

const gameOverScreen = document.querySelector('#game-over');

const finalScoreDisplay = document.querySelector('#final-score');
const finalFishDisplay = document.querySelector('#final-fish');


// =========================
// GAME VARIABLES
// =========================

let score = 0;
let fishCaught = 0;
let timeLeft = 60;

let timerInterval;
let fishInterval;

let gameRunning = false;


// =========================
// FISH SPRITE SHEETS
// =========================

const fishImages = [

  {
    file: 'fish1.png',
    frames: 8
  },

  {
    file: 'fish2.png',
    frames: 8
  },

  {
    file: 'fish3.png',
    frames: 8
  },

  {
    file: 'fish4.png',
    frames: 8
  },

  {
    file: 'fish5.png',
    frames: 8
  },

  {
    file: 'fish6.png',
    frames: 12
  },

  {
    file: 'fish7.png',
    frames: 10
  },

  {
    file: 'fish8.png',
    frames: 12
  },

  {
    file: 'fish9.png',
    frames: 12
  },

  {
    file: 'fish10.png',
    frames: 10
  }

];


// =========================
// START BUTTON
// =========================

startButton.addEventListener(
  'click',
  startGame
);


// =========================
// RESTART BUTTON
// =========================

restartButton.addEventListener(
  'click',
  startGame
);


// =========================
// START GAME
// =========================

function startGame() {

  // Reset game

  score = 0;

  fishCaught = 0;

  timeLeft = 60;

  gameRunning = true;


  // Update information

  scoreDisplay.textContent =
    score;

  fishCaughtDisplay.textContent =
    fishCaught;

  timerDisplay.textContent =
    timeLeft;


  // Change screens

  startScreen.style.display =
    'none';

  gameScreen.style.display =
    'block';

  gameOverScreen.style.display =
    'none';


  // Remove old fish

  gameArea.innerHTML =
    '';


  // Stop old timers

  clearInterval(
    timerInterval
  );

  clearInterval(
    fishInterval
  );


  // Create first fish

  createFish();


  // Create new fish

  fishInterval =
    setInterval(
      createFish,
      1500
    );


  // Start timer

  startTimer();

}


// =========================
// CREATE FISH
// =========================

function createFish() {

  if (!gameRunning) {

    return;

  }


  // Create canvas

  const fish =
    document.createElement(
      'canvas'
    );


  // Canvas size

  fish.width =
    100;

  fish.height =
    100;


  // Add CSS class

  fish.classList.add(
    'fish'
  );


  // Choose random fish

  const randomIndex =
    Math.floor(
      Math.random() *
      fishImages.length
    );


  const selectedFish =
    fishImages[randomIndex];


  // Create image

  const image =
    new Image();


  // Set image source

  image.src =
    `assets/images/${selectedFish.file}`;


  // Wait for image to load

  image.onload =
    function() {

      // Add fish to game

      gameArea.appendChild(
        fish
      );


      // Animate fish

      animateFish(
        fish,
        image,
        selectedFish.frames
      );


      // Move fish

      moveFish(
        fish
      );

    };

}


// =========================
// ANIMATE FISH
// =========================

function animateFish(
  fish,
  image,
  frameCount
) {

  const ctx =
    fish.getContext(
      '2d'
    );


  // Calculate the height
  // of ONE frame

  const frameHeight =
    image.height /
    frameCount;


  // Current animation frame

  let currentFrame =
    0;


  // Animation function

  function changeFrame() {

    // Stop if fish was caught

    if (
      !fish.isConnected
    ) {

      return;

    }


    // Stop when game ends

    if (
      !gameRunning
    ) {

      return;

    }


    // Clear canvas

    ctx.clearRect(
      0,
      0,
      fish.width,
      fish.height
    );


    // Draw ONLY ONE frame

    ctx.drawImage(

      image,

      0,

      currentFrame *
      frameHeight,

      image.width,

      frameHeight,

      0,

      0,

      fish.width,

      fish.height

    );


    // Go to next frame

    currentFrame++;


    // Start again from frame 1

    if (
      currentFrame >=
      frameCount
    ) {

      currentFrame =
        0;

    }


    // Change frame

    setTimeout(
      changeFrame,
      100
    );

  }


  // Start animation

  changeFrame();

}


// =========================
// MOVE FISH
// =========================

function moveFish(
  fish
) {

  const fishSize =
    100;


  // Random starting position

  let x =
    Math.random() *
    (
      window.innerWidth -
      fishSize
    );


  let y =
    100 +
    Math.random() *
    (
      window.innerHeight -
      fishSize -
      100
    );


  // Random horizontal speed

  let speedX =
    Math.random() *
    2 +
    1;


  // Random vertical speed

  let speedY =
    Math.random() *
    1 +
    0.5;


  // Random horizontal direction

  if (
    Math.random() <
    0.5
  ) {

    speedX =
      -speedX;

  }


  // Random vertical direction

  if (
    Math.random() <
    0.5
  ) {

    speedY =
      -speedY;

  }


  // Set starting position

  fish.style.left =
    `${x}px`;

  fish.style.top =
    `${y}px`;


  // Movement function

  function move() {

    // Stop if fish was caught

    if (
      !fish.isConnected
    ) {

      return;

    }


    // Stop when game ends

    if (
      !gameRunning
    ) {

      return;

    }


    // Move fish

    x +=
      speedX;

    y +=
      speedY;


    // =========================
    // LEFT WALL
    // =========================

    if (
      x <= 0
    ) {

      x = 0;

      speedX =
        Math.abs(
          speedX
        );

    }


    // =========================
    // RIGHT WALL
    // =========================

    if (
      x >=
      window.innerWidth -
      fishSize
    ) {

      x =
        window.innerWidth -
        fishSize;

      speedX =
        -Math.abs(
          speedX
        );

    }


    // =========================
    // TOP WALL
    // =========================

    if (
      y <= 100
    ) {

      y = 100;

      speedY =
        Math.abs(
          speedY
        );

    }


    // =========================
    // BOTTOM WALL
    // =========================

    if (
      y >=
      window.innerHeight -
      fishSize
    ) {

      y =
        window.innerHeight -
        fishSize;

      speedY =
        -Math.abs(
          speedY
        );

    }


    // Apply position

    fish.style.left =
      `${x}px`;

    fish.style.top =
      `${y}px`;


    // Continue moving

    requestAnimationFrame(
      move
    );

  }


  // Start movement

  move();

}


// =========================
// CATCH FISH
// =========================

gameArea.addEventListener(
  'click',
  function(event) {

    // Check if clicked element
    // is a fish

    if (
      !event.target.classList.contains(
        'fish'
      )
    ) {

      return;

    }


    // Add score

    score +=
      10;


    // Add caught fish

    fishCaught++;


    // Update score

    scoreDisplay.textContent =
      score;


    // Update fish caught

    fishCaughtDisplay.textContent =
      fishCaught;


    // Remove fish

    event.target.remove();

  }
);


// =========================
// TIMER
// =========================

function startTimer() {

  timerInterval =
    setInterval(
      function() {

        // Decrease time

        timeLeft--;


        // Update timer

        timerDisplay.textContent =
          timeLeft;


        // Check if time is over

        if (
          timeLeft <= 0
        ) {

          endGame();

        }

      },
      1000
    );

}


// =========================
// END GAME
// =========================

function endGame() {

  // Stop game

  gameRunning =
    false;


  // Stop creating fish

  clearInterval(
    fishInterval
  );


  // Stop timer

  clearInterval(
    timerInterval
  );


  // Show final score

  finalScoreDisplay.textContent =
    score;


  // Show final fish count

  finalFishDisplay.textContent =
    fishCaught;


  // Show Game Over screen

  gameOverScreen.style.display =
    'block';

}