/* =========================
   GAME CONSTANTS
========================= */
const MAX_LIVES         = 3;
const WINNING_SCORE     = 15;

const FISH_SPAWN_MS     = 900;
const MAX_FISH          = 8;
const FISH_SIZE         = 100;
const WATER_TOP         = 240;

const HOOK_SPEED        = 950;
const HOOK_RETURN_SPEED = 750;
const MAX_LINE_LENGTH   = 1500;
const MAX_AIM_ANGLE     = 70;

const HOOK_RADIUS       = 16;
const FISH_RADIUS       = 34;

/* =========================
========================= */
const ROD_W   = 130;
const ROD_H   = 130;
const ROD_TOP = 140;
const ROD_PIVOT_X = 0.50;   
const ROD_PIVOT_Y = 0.08;   

const ROD_TIP_X   = 0.50;   
const ROD_TIP_Y   = 0.97;   
const ROD_FLIP    = false;  
const ROD_OFFSET  = 0;      
const SHOW_ANCHOR = false;
/* =========================
   FISH SPRITE SHEETS
========================= */
const fishImages = [
  { file: 'fish1.png',  frames: 8,  type: 'good' },
  { file: 'fish2.png',  frames: 8,  type: 'good' },
  { file: 'fish3.png',  frames: 8,  type: 'good' },
  { file: 'fish4.png',  frames: 8,  type: 'good' },
  { file: 'fish5.png',  frames: 8,  type: 'good' },
  { file: 'fish6.png',  frames: 12, type: 'good' },
  { file: 'fish7.png',  frames: 10, type: 'good' },
  { file: 'fish8.png',  frames: 12, type: 'bad'  },
  { file: 'fish9.png',  frames: 12, type: 'bad'  },
  { file: 'fish10.png', frames: 10, type: 'bad'  }
];

/* =========================
   STATE
========================= */
let score = 0, fishCaught = 0, lives = MAX_LIVES;
let gameRunning = false;
let fishes = [];
let spawnTimer = null;
let lastTime = 0;

let areaW = 0, areaH = 0;
let pivotX = 0, pivotY = 0;    
let anchorX = 0, anchorY = 0;  
let rodAngle = 0;               

let aimX = 0, aimY = 1;

let hookState = 'idle';
let hookX = 0, hookY = 0;
let dirX = 0, dirY = 1;
let hookedFish = null;

/* =========================
   ELEMENTS
========================= */
const startScreen = document.querySelector('#start-screen');
const gameScreen  = document.querySelector('#game-screen');
const startButton = document.querySelector('#start-btn');
const restartBtn  = document.querySelector('#restart-btn');
const gameArea    = document.querySelector('#game-area');

const rodEl       = document.querySelector('#rod');
const rodImg      = document.querySelector('#rod-img');
const rodFallback = document.querySelector('#rod-fallback');

const hookEl     = document.querySelector('#hook');
const fishLineEl = document.querySelector('#fish-line');
const aimLineEl  = document.querySelector('#aim-line');

const scoreDisplay      = document.querySelector('#score');
const fishCaughtDisplay = document.querySelector('#fish-caught');
const livesDisplay      = document.querySelector('#lives');

const gameOverScreen    = document.querySelector('#game-over');
const resultTitle       = document.querySelector('#result-title');
const finalScoreDisplay = document.querySelector('#final-score');
const finalFishDisplay  = document.querySelector('#final-fish');

const anchorDot = document.createElement('div');
anchorDot.id = 'anchor-dot';
gameArea.appendChild(anchorDot);

/* =========================
   PRELOAD
========================= */
function preloadFishImages() {
  fishImages.forEach(function (cfg) {
    const img = new Image();
    img.onload  = function () { cfg.img = img; cfg.ready = true; };
    img.onerror = function () { cfg.ready = false; };
    img.src = 'assets/images/' + cfg.file;
  });
}

rodImg.onerror = function () {
  rodImg.style.display = 'none';
  rodFallback.style.display = 'block';
};

preloadFishImages();

/* =========================
   LISTENERS
========================= */
startButton.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
gameArea.addEventListener('mousemove', handleAim);
gameArea.addEventListener('click', handleCast);
window.addEventListener('resize', updateBounds);

/* =========================
   BOUNDS + ROD PLACEMENT
========================= */
function updateBounds() {
  areaW = gameArea.clientWidth;
  areaH = gameArea.clientHeight;

  rodEl.style.width  = ROD_W + 'px';
  rodEl.style.height = ROD_H + 'px';
  rodEl.style.left   = (areaW / 2 - ROD_W * ROD_PIVOT_X) + 'px';
  rodEl.style.top    = ROD_TOP + 'px';
  rodEl.style.transformOrigin =
    (ROD_PIVOT_X * 100) + '% ' + (ROD_PIVOT_Y * 100) + '%';

  if (ROD_FLIP) rodImg.style.transform = 'scaleX(-1)';

  pivotX = areaW / 2;
  pivotY = ROD_TOP + ROD_H * ROD_PIVOT_Y;

  anchorDot.style.display = SHOW_ANCHOR ? 'block' : 'none';

  updateRodAngle(rodAngle);
}

/* يحسب مكان طرف الصنارة بعد الدوران */
function updateRodAngle(angle) {
  rodAngle = angle;

  rodEl.style.transform =
    'rotate(' + (angle * 180 / Math.PI + ROD_OFFSET) + 'deg)';

  const ox = (ROD_TIP_X - ROD_PIVOT_X) * ROD_W;
  const oy = (ROD_TIP_Y - ROD_PIVOT_Y) * ROD_H;

  const c = Math.cos(angle);
  const s = Math.sin(angle);

  anchorX = pivotX + ox * c - oy * s;
  anchorY = pivotY + ox * s + oy * c;

  if (SHOW_ANCHOR) {
    anchorDot.style.left = anchorX + 'px';
    anchorDot.style.top  = anchorY + 'px';
  }
}

/* =========================
   START
========================= */
function startGame() {
  score = 0;
  fishCaught = 0;
  lives = MAX_LIVES;
  gameRunning = true;

  fishes.forEach(f => f.el.remove());
  fishes = [];
  gameArea.querySelectorAll('.popup').forEach(p => p.remove());

  hookState = 'idle';
  hookedFish = null;
  aimX = 0;
  aimY = 1;
  rodAngle = 0;

  startScreen.style.display    = 'none';
  gameScreen.style.display     = 'block';
  gameOverScreen.style.display = 'none';

  updateBounds();
  hideHook();
  render();

  clearInterval(spawnTimer);
  spawnFish();
  spawnFish();
  spawnTimer = setInterval(spawnFish, FISH_SPAWN_MS);

  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

/* =========================
   LOOP
========================= */
function gameLoop(t) {
  if (!gameRunning) return;

  let dt = (t - lastTime) / 1000;
  lastTime = t;
  if (dt > 0.05) dt = 0.05;

  updateFishes(dt);
  updateHook(dt);
  drawAim();

  requestAnimationFrame(gameLoop);
}

/* =========================
   FISH
========================= */
function spawnFish() {
  if (!gameRunning || fishes.length >= MAX_FISH) return;

  const cfg = fishImages[Math.floor(Math.random() * fishImages.length)];

  const el = document.createElement('canvas');
  el.width = FISH_SIZE;
  el.height = FISH_SIZE;
  el.className = 'fish' + (cfg.type === 'bad' ? ' bad' : '');

  const goRight = Math.random() < 0.5;
  const speed = 50 + Math.random() * 70;

  const fish = {
    el: el,
    ctx: el.getContext('2d'),
    cfg: cfg,
    type: cfg.type,
    x: goRight ? -FISH_SIZE : areaW,
    y: WATER_TOP + Math.random() * (areaH - WATER_TOP - FISH_SIZE - 20),
    vx: goRight ? speed : -speed,
    vy: Math.random() * 30 - 15,
    frame: 0,
    timer: 0
  };

  gameArea.appendChild(el);
  fishes.push(fish);
  drawFish(fish);
  positionFish(fish);
}

function updateFishes(dt) {
  for (let i = fishes.length - 1; i >= 0; i--) {
    const fish = fishes[i];

    if (fish === hookedFish) {
      fish.x = hookX - FISH_SIZE / 2;
      fish.y = hookY - FISH_SIZE / 2 + 10;
      positionFish(fish);
      animateFish(fish, dt);
      continue;
    }

    fish.x += fish.vx * dt;
    fish.y += fish.vy * dt;

    if (fish.y < WATER_TOP) {
      fish.y = WATER_TOP;
      fish.vy = Math.abs(fish.vy);
    }
    if (fish.y > areaH - FISH_SIZE) {
      fish.y = areaH - FISH_SIZE;
      fish.vy = -Math.abs(fish.vy);
    }

    if (fish.x < -FISH_SIZE - 60 || fish.x > areaW + 60) {
      fish.el.remove();
      fishes.splice(i, 1);
      continue;
    }

    positionFish(fish);
    animateFish(fish, dt);
  }
}

function positionFish(fish) {
  fish.el.style.transform = 'translate(' + fish.x + 'px,' + fish.y + 'px)';
}

function animateFish(fish, dt) {
  fish.timer += dt;
  if (fish.timer < 0.09) return;
  fish.timer = 0;
  fish.frame = (fish.frame + 1) % fish.cfg.frames;
  drawFish(fish);
}

function drawFish(fish) {
  const ctx = fish.ctx;
  const cfg = fish.cfg;

  ctx.clearRect(0, 0, FISH_SIZE, FISH_SIZE);
  ctx.save();

  if (fish.vx > 0) {
    ctx.translate(FISH_SIZE, 0);
    ctx.scale(-1, 1);
  }

  if (cfg.ready && cfg.img) {
    const fh = cfg.img.height / cfg.frames;
    ctx.drawImage(cfg.img, 0, fish.frame * fh, cfg.img.width, fh,
                  0, 0, FISH_SIZE, FISH_SIZE);
  } else {
    ctx.font = '64px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cfg.type === 'good' ? '🐟' : '🐡', FISH_SIZE / 2, FISH_SIZE / 2);
  }

  ctx.restore();
}

/* =========================
   AIM
========================= */
function handleAim(event) {
  if (!gameRunning || hookState !== 'idle') return;

  const rect = gameArea.getBoundingClientRect();
  const mx = event.clientX - rect.left;
  const my = event.clientY - rect.top;

  let dx = mx - pivotX;
  let dy = my - pivotY;
  if (dy < 40) dy = 40;

  let off = Math.atan2(dy, dx) - Math.PI / 2;
  const max = MAX_AIM_ANGLE * Math.PI / 180;
  if (off >  max) off =  max;
  if (off < -max) off = -max;

  updateRodAngle(off);

  aimX = Math.sin(off);
  aimY = Math.cos(off);
}

function drawAim() {
  if (hookState !== 'idle') {
    aimLineEl.style.visibility = 'hidden';
    return;
  }

  aimLineEl.style.visibility = 'visible';
  aimLineEl.setAttribute('x1', anchorX);
  aimLineEl.setAttribute('y1', anchorY);
  aimLineEl.setAttribute('x2', anchorX + aimX * 110);
  aimLineEl.setAttribute('y2', anchorY + aimY * 110);
}

/* =========================
   CAST
========================= */
function handleCast() {
  if (!gameRunning || hookState !== 'idle') return;

  hookState = 'out';
  hookedFish = null;

  dirX = aimX;
  dirY = aimY;
  hookX = anchorX;
  hookY = anchorY;

  hookEl.style.visibility = 'visible';
  fishLineEl.style.visibility = 'visible';
}

function updateHook(dt) {
  if (hookState === 'idle') return;

  if (hookState === 'out') {
    hookX += dirX * HOOK_SPEED * dt;
    hookY += dirY * HOOK_SPEED * dt;

    checkCatch();

    const dist = Math.hypot(hookX - anchorX, hookY - anchorY);
    const out = hookX < 15 || hookX > areaW - 15 || hookY > areaH - 15;

    if (hookState === 'out' && (dist >= MAX_LINE_LENGTH || out)) {
      hookState = 'back';
    }

  } else {
    const dx = anchorX - hookX;
    const dy = anchorY - hookY;
    const dist = Math.hypot(dx, dy);
    const step = HOOK_RETURN_SPEED * dt;

    if (dist <= step) {
      resolveCatch();
      return;
    }

    hookX += (dx / dist) * step;
    hookY += (dy / dist) * step;
  }

  drawHook();
}

function drawHook() {
  hookEl.style.transform =
    'translate(' + hookX + 'px,' + hookY + 'px) translate(-50%,-50%)';

  fishLineEl.setAttribute('x1', anchorX);
  fishLineEl.setAttribute('y1', anchorY);
  fishLineEl.setAttribute('x2', hookX);
  fishLineEl.setAttribute('y2', hookY);
}

function hideHook() {
  hookEl.style.visibility = 'hidden';
  fishLineEl.style.visibility = 'hidden';
  aimLineEl.style.visibility = 'hidden';
}

/* =========================
   CATCH
========================= */
function checkCatch() {
  for (let i = 0; i < fishes.length; i++) {
    const fish = fishes[i];
    const fx = fish.x + FISH_SIZE / 2;
    const fy = fish.y + FISH_SIZE / 2;

    if (Math.hypot(hookX - fx, hookY - fy) < HOOK_RADIUS + FISH_RADIUS) {
      hookedFish = fish;
      hookState = 'back';
      return;
    }
  }
}

function resolveCatch() {
  hookX = anchorX;
  hookY = anchorY;

  if (hookedFish) {
    const fish = hookedFish;
    const idx = fishes.indexOf(fish);
    if (idx > -1) fishes.splice(idx, 1);
    fish.el.remove();

    fishCaught++;

    if (fish.type === 'good') {
      score++;
      showPopup('+1', 'good');
    } else {
      lives--;
      showPopup('-1 ❤️', 'bad');
    }

    hookedFish = null;
    render();
  }

  hookState = 'idle';
  hideHook();

  if (score >= WINNING_SCORE)  endGame('win');
  else if (lives <= 0)         endGame('lose');
}

/* =========================
   UI
========================= */
function showPopup(text, kind) {
  const el = document.createElement('div');
  el.className = 'popup ' + kind;
  el.textContent = text;
  el.style.left = anchorX + 'px';
  el.style.top  = (anchorY + 40) + 'px';
  gameArea.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

function render() {
  scoreDisplay.textContent = score;
  fishCaughtDisplay.textContent = fishCaught;
  livesDisplay.textContent = lives > 0 ? '❤️'.repeat(lives) : '0';
}

function endGame(result) {
  gameRunning = false;
  hookState = 'idle';
  hookedFish = null;

  clearInterval(spawnTimer);
  fishes.forEach(f => f.el.remove());
  fishes = [];

  hideHook();
  updateRodAngle(0);

  resultTitle.textContent = (result === 'win') ? '🏆 You Win!' : '💀 Game Over!';
  finalScoreDisplay.textContent = score;
  finalFishDisplay.textContent  = fishCaught;
  gameOverScreen.style.display = 'block';
}