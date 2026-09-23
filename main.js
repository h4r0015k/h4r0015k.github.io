/* ============================================================
   NIKHIL SAHANI // h4r0015k - CORE ENGINE & FULL-PAGE SNAKE
   Senior Product Engineer Portfolio
   ============================================================ */

// --- 1. WEB AUDIO SYNTHESIZER ---
class SoundEngine {
  constructor() {
    // Clear legacy audio cache so returning visitors default to muted
    if (localStorage.getItem('hud_audio') !== null && !localStorage.getItem('hud_audio_v2')) {
      localStorage.removeItem('hud_audio');
    }
    const savedAudio = localStorage.getItem('hud_audio_v2');
    this.enabled = savedAudio === 'true';
    this.ctx = null;
    this.initAudioContext();
  }

  initAudioContext() {
    const unlock = () => {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    };
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('pointerdown', unlock, { once: true });
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('hud_audio_v2', this.enabled ? 'true' : 'false');
    if (this.enabled) {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      this.playPowerUp();
    }
    return this.enabled;
  }

  playTone(freq, type = 'square', duration = 0.05, startVol = 0.05, endVol = 0.001) {
    if (!this.enabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(startVol, now);
      gain.gain.exponentialRampToValueAtTime(endVol, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  playHover() {
    this.playTone(840, 'sine', 0.02, 0.02);
  }

  playClick() {
    this.playTone(480, 'triangle', 0.04, 0.05);
  }

  playEat() {
    this.playTone(620, 'square', 0.05, 0.07);
    setTimeout(() => this.playTone(880, 'square', 0.06, 0.07), 35);
  }

  playDie() {
    this.playTone(160, 'sawtooth', 0.22, 0.1);
  }

  playPowerUp() {
    [261, 330, 392, 523].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'triangle', 0.07, 0.05), i * 45);
    });
  }
}

const sound = new SoundEngine();

// --- 2. THEMES & DISPLAY CONTROLS ---
const THEMES = ['green', 'amber', 'cyan', 'blood'];

function initThemeAndDisplay() {
  const savedTheme = localStorage.getItem('hud_theme') || 'green';
  document.body.setAttribute('data-theme', savedTheme);
  updateThemeBtn(savedTheme);

  // CRT Scanlines off by default unless explicitly turned on
  if (localStorage.getItem('hud_crt') !== null && !localStorage.getItem('hud_crt_v2')) {
    localStorage.removeItem('hud_crt');
  }
  const crtSetting = localStorage.getItem('hud_crt_v2');
  const btnCrt = document.getElementById('btn-crt');
  if (crtSetting === 'on') {
    document.body.classList.add('crt-active');
    if (btnCrt) btnCrt.textContent = 'CRT: [ON]';
  } else {
    document.body.classList.remove('crt-active');
    if (btnCrt) btnCrt.textContent = 'CRT: [OFF]';
  }

  const audioBtn = document.getElementById('btn-audio');
  if (audioBtn) {
    audioBtn.textContent = sound.enabled ? 'AUDIO: [ON]' : 'AUDIO: [OFF]';
  }
}

function cycleTheme() {
  const current = document.body.getAttribute('data-theme') || 'green';
  const nextIdx = (THEMES.indexOf(current) + 1) % THEMES.length;
  const nextTheme = THEMES[nextIdx];
  document.body.setAttribute('data-theme', nextTheme);
  localStorage.setItem('hud_theme', nextTheme);
  updateThemeBtn(nextTheme);
  sound.playClick();
  showToast(`PALETTE: ${nextTheme.toUpperCase()}`);
}

function updateThemeBtn(theme) {
  const btn = document.getElementById('btn-theme');
  if (btn) btn.textContent = `PALETTE: [${theme.toUpperCase()}]`;
}

function toggleCRT() {
  const isActive = document.body.classList.toggle('crt-active');
  localStorage.setItem('hud_crt_v2', isActive ? 'on' : 'off');
  const btn = document.getElementById('btn-crt');
  if (btn) btn.textContent = isActive ? 'CRT: [ON]' : 'CRT: [OFF]';
  sound.playClick();
  showToast(`CRT: ${isActive ? 'ON' : 'OFF'}`);
}

function toggleAudio() {
  const enabled = sound.toggle();
  const btn = document.getElementById('btn-audio');
  if (btn) btn.textContent = enabled ? 'AUDIO: [ON]' : 'AUDIO: [OFF]';
  showToast(`AUDIO: ${enabled ? 'ACTIVE' : 'MUTED'}`);
}

// --- 3. TOAST SYSTEM ---
function showToast(message) {
  let toast = document.getElementById('hud-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'hud-toast';
    toast.className = 'hud-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>▶</span> ${message}`;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2000);
}

// --- 4. COPY TEXT ---
function copyText(text, label) {
  sound.playClick();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label || 'TEXT'} COPIED`);
    });
  } else {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast(`${label || 'TEXT'} COPIED`);
  }
}

// --- 5. FULL-PAGE SNAKE ENGINE ---
class FullPageSnake {
  constructor() {
    this.active = false;
    this.canvas = document.getElementById('snake-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.gridSize = 20; // Pixel size of snake block
    this.cols = 0;
    this.rows = 0;

    this.snake = [];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.food = { x: 0, y: 0 };

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('snake_highscore') || '0', 10);
    this.gameLoop = null;
    this.speed = 80;

    this.scoreEl = document.getElementById('score-val');
    this.highScoreEl = document.getElementById('highscore-val');

    if (this.canvas) {
      this.initEvents();
      this.resizeCanvas();
      if (this.highScoreEl) this.highScoreEl.textContent = this.highScore;
    }
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.cols = Math.floor(this.canvas.width / this.gridSize);
    this.rows = Math.floor(this.canvas.height / this.gridSize);
  }

  initEvents() {
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      if (this.active) this.draw();
    });

    // Keyboard arrow keys
    window.addEventListener('keydown', (e) => {
      const tag = document.activeElement ? document.activeElement.tagName : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        if (this.active) this.pause();
        return;
      }

      let reqDir = null;
      let btnId = null;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        reqDir = { x: 0, y: -1 };
        btnId = 'pad-btn-up';
        e.preventDefault();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        reqDir = { x: 0, y: 1 };
        btnId = 'pad-btn-down';
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        reqDir = { x: -1, y: 0 };
        btnId = 'pad-btn-left';
        e.preventDefault();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        reqDir = { x: 1, y: 0 };
        btnId = 'pad-btn-right';
        e.preventDefault();
      }

      if (reqDir) {
        this.flashButton(btnId);
        this.inputDirection(reqDir.x, reqDir.y);
      }
    });

    // On-screen D-Pad click/touch events
    const bindPad = (id, dx, dy) => {
      const el = document.getElementById(id);
      if (!el) return;

      const trigger = (ev) => {
        ev.preventDefault();
        this.flashButton(id);
        this.inputDirection(dx, dy);
      };

      el.addEventListener('click', trigger);
      el.addEventListener('touchstart', trigger, { passive: false });
    };

    bindPad('pad-btn-up', 0, -1);
    bindPad('pad-btn-down', 0, 1);
    bindPad('pad-btn-left', -1, 0);
    bindPad('pad-btn-right', 1, 0);
  }

  flashButton(id) {
    if (!id) return;
    const btn = document.getElementById(id);
    if (btn) {
      btn.classList.add('pressed');
      setTimeout(() => btn.classList.remove('pressed'), 120);
    }
  }

  inputDirection(dx, dy) {
    if (window.innerWidth <= 768) return; // Snake disabled on mobile
    if (!this.active) {
      this.start(dx, dy);
      return;
    }

    if (dx !== 0 && this.direction.x === 0) {
      this.nextDirection = { x: dx, y: 0 };
      sound.playHover();
    } else if (dy !== 0 && this.direction.y === 0) {
      this.nextDirection = { x: 0, y: dy };
      sound.playHover();
    }
  }

  start(initialDx = 1, initialDy = 0) {
    this.active = true;
    this.resizeCanvas();
    this.resetState(initialDx, initialDy);

    sound.playPowerUp();
    showToast('SNAKE ACTIVE! ESC TO PAUSE');

    clearInterval(this.gameLoop);
    this.gameLoop = setInterval(() => this.step(), this.speed);
  }

  pause() {
    this.active = false;
    clearInterval(this.gameLoop);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    sound.playClick();
    showToast('SNAKE PAUSED');
  }

  resetState(initialDx = 1, initialDy = 0) {
    this.score = 0;
    if (this.scoreEl) this.scoreEl.textContent = '0';

    const startX = Math.floor(this.cols / 2);
    const startY = Math.floor(this.rows / 2);

    this.snake = [
      { x: startX, y: startY },
      { x: startX - initialDx, y: startY - initialDy },
      { x: startX - (initialDx * 2), y: startY - (initialDy * 2) },
      { x: startX - (initialDx * 3), y: startY - (initialDy * 3) }
    ];

    this.direction = { x: initialDx, y: initialDy };
    this.nextDirection = { x: initialDx, y: initialDy };
    this.spawnFood();
  }

  spawnFood() {
    let valid = false;
    while (!valid) {
      const rx = Math.floor(Math.random() * (this.cols - 2)) + 1;
      const ry = Math.floor(Math.random() * (this.rows - 2)) + 1;
      valid = !this.snake.some(segment => segment.x === rx && segment.y === ry);
      if (valid) {
        this.food = { x: rx, y: ry };
      }
    }
  }

  step() {
    this.direction = { ...this.nextDirection };
    let head = {
      x: this.snake[0].x + this.direction.x,
      y: this.snake[0].y + this.direction.y
    };

    // Screen wrap-around
    if (head.x < 0) head.x = this.cols - 1;
    if (head.x >= this.cols) head.x = 0;
    if (head.y < 0) head.y = this.rows - 1;
    if (head.y >= this.rows) head.y = 0;

    // Self-collision
    for (let i = 0; i < this.snake.length; i++) {
      if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
        this.gameOver();
        return;
      }
    }

    this.snake.unshift(head);

    // Food collision
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      sound.playEat();
      if (this.scoreEl) this.scoreEl.textContent = this.score;

      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('snake_highscore', this.highScore);
        if (this.highScoreEl) this.highScoreEl.textContent = this.highScore;
      }

      this.spawnFood();
    } else {
      this.snake.pop();
    }

    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const theme = document.body.getAttribute('data-theme') || 'green';
    let accentColor = '#00ff66';
    let foodColor = '#00f0ff';
    if (theme === 'amber') { accentColor = '#ffaa00'; foodColor = '#ff3366'; }
    else if (theme === 'cyan') { accentColor = '#00e5ff'; foodColor = '#ffaa00'; }
    else if (theme === 'blood') { accentColor = '#ff2a5f'; foodColor = '#00ff66'; }

    // Food
    const fx = this.food.x * this.gridSize;
    const fy = this.food.y * this.gridSize;
    this.ctx.fillStyle = foodColor;
    this.ctx.shadowColor = foodColor;
    this.ctx.shadowBlur = 10;
    this.ctx.fillRect(fx + 2, fy + 2, this.gridSize - 4, this.gridSize - 4);

    // Snake
    this.ctx.shadowColor = accentColor;
    this.ctx.shadowBlur = 8;
    this.snake.forEach((seg, index) => {
      const sx = seg.x * this.gridSize;
      const sy = seg.y * this.gridSize;

      if (index === 0) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(sx + 1, sy + 1, this.gridSize - 2, this.gridSize - 2);
      } else {
        this.ctx.fillStyle = accentColor;
        this.ctx.fillRect(sx + 2, sy + 2, this.gridSize - 4, this.gridSize - 4);
      }
    });

    this.ctx.shadowBlur = 0;
  }

  gameOver() {
    sound.playDie();
    showToast(`GAME OVER // SCORE: ${this.score}`);
    this.resetState(this.direction.x, this.direction.y);
  }
}

let snakeGame = null;

// --- DOM READY ---
document.addEventListener('DOMContentLoaded', () => {
  initThemeAndDisplay();
  snakeGame = new FullPageSnake();

  const interactives = document.querySelectorAll('a, button, .hud-btn, .btn-game, .comms-row, .project-card, .archive-card');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => sound.playHover());
  });
});

