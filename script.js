const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");
const startBtn = document.getElementById("start-btn");

const TILE = 20;
const COLS = canvas.width / TILE;
const ROWS = canvas.height / TILE;

let snake, dir, nextDir, food, score, timer, running, paused;
let best = Number(localStorage.getItem("cobrinha-recorde")) || 0;
bestEl.textContent = best;

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function reset() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  dir = DIRS.right;
  nextDir = dir;
  score = 0;
  scoreEl.textContent = 0;
  paused = false;
  placeFood();
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (snake.some((s) => s.x === food.x && s.y === food.y));
}

function start() {
  reset();
  overlay.classList.add("hidden");
  running = true;
  clearInterval(timer);
  timer = setInterval(tick, 110);
  draw();
}

function gameOver() {
  running = false;
  clearInterval(timer);
  if (score > best) {
    best = score;
    localStorage.setItem("cobrinha-recorde", best);
    bestEl.textContent = best;
  }
  overlayText.textContent = `Fim de jogo! Pontos: ${score}`;
  startBtn.textContent = "Jogar de novo";
  overlay.classList.remove("hidden");
}

function tick() {
  if (paused) return;

  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  const hitWall = head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS;
  const hitSelf = snake.some((s) => s.x === head.x && s.y === head.y);
  if (hitWall || hitSelf) return gameOver();

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // comida
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(
    food.x * TILE + TILE / 2,
    food.y * TILE + TILE / 2,
    TILE / 2 - 2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // cobra
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? "#4ade80" : "#22c55e";
    ctx.fillRect(s.x * TILE + 1, s.y * TILE + 1, TILE - 2, TILE - 2);
  });
}

function setDirection(name) {
  const d = DIRS[name];
  // impede virar 180 graus
  if (d.x === -dir.x && d.y === -dir.y) return;
  nextDir = d;
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  if (paused) {
    overlayText.textContent = "Pausado";
    startBtn.textContent = "Continuar";
    overlay.classList.remove("hidden");
  } else {
    overlay.classList.add("hidden");
  }
}

document.addEventListener("keydown", (e) => {
  const map = {
    ArrowUp: "up", w: "up", W: "up",
    ArrowDown: "down", s: "down", S: "down",
    ArrowLeft: "left", a: "left", A: "left",
    ArrowRight: "right", d: "right", D: "right",
  };

  if (e.code === "Space") {
    e.preventDefault();
    return togglePause();
  }

  if (map[e.key]) {
    e.preventDefault();
    if (!running) start();
    setDirection(map[e.key]);
  }
});

startBtn.addEventListener("click", () => {
  if (paused) togglePause();
  else start();
});

document.querySelectorAll(".controls button").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!running) start();
    setDirection(btn.dataset.dir);
  });
});

// deslizar o dedo no celular
let touchStart = null;
canvas.addEventListener("touchstart", (e) => {
  touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
});
canvas.addEventListener("touchend", (e) => {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
  if (!running) start();
  if (Math.abs(dx) > Math.abs(dy)) setDirection(dx > 0 ? "right" : "left");
  else setDirection(dy > 0 ? "down" : "up");
  touchStart = null;
});

reset();
draw();
