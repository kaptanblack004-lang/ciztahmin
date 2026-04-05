// ─── game.js ──────────────────────────────────────────────────────────────────
'use strict';

// ─── PWA: Service Worker ──────────────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(() => {
      console.log('✅ Service Worker kayıtlı!');
    }).catch(err => console.log('SW hata:', err));
  });
}

// ─── PWA: Uygulama Kurulum Butonu ─────────────────────────────────────────────
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  // Kurulum butonunu göster
  const btn = document.getElementById('btn-install');
  if (btn) {
    btn.style.display = 'flex';
    btn.addEventListener('click', async () => {
      btn.style.display = 'none';
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('✅ Uygulama kuruldu!');
      }
      deferredInstallPrompt = null;
    });
  }
});

window.addEventListener('appinstalled', () => {
  console.log('🎉 ÇizTahmin uygulaması kuruldu!');
  const btn = document.getElementById('btn-install');
  if (btn) btn.style.display = 'none';
});

const socket = io();

// ─── State ────────────────────────────────────────────────────────────────────
let myId = null;
let myRoomId = null;
let gameState = null;
let isDrawer = false;
let maxTime = 80;

// ─── Canvas ───────────────────────────────────────────────────────────────────
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let lastX = 0, lastY = 0;
let currentTool = 'pen';
let currentColor = '#000000';
let currentSize = 8;

const COLORS = [
  '#000000','#ffffff','#ff4757','#ff6348','#ffa502','#ffdd59',
  '#2ed573','#1e90ff','#5352ed','#ff6b81','#747d8c','#eccc68',
  '#a29bfe','#fd79a8','#00b894','#0984e3','#6c5ce7','#fdcb6e',
  '#e17055','#2d3436'
];

// ─── UI Helpers ───────────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  // Mobil geri tuşu desteği
  if (id === 'screen-game') {
    history.pushState({ screen: 'game' }, '');
  }
}

// Geri tuşuna basılınca ana menüye dön
window.addEventListener('popstate', () => {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-menu').classList.add('active');
  socket.emit('leave');
});

function addChatMsg(data) {
  const el = document.createElement('div');
  el.className = 'chat-msg' + (data.system ? ' system' : '') + (data.correct ? ' correct' : '');
  if (data.system) {
    el.textContent = data.text;
  } else {
    el.innerHTML = `<span class="msg-name">${escHtml(data.name)}:</span><span class="msg-text"> ${escHtml(data.text)}</span>`;
  }
  const box = document.getElementById('chat-messages');
  box.appendChild(el);
  box.scrollTop = box.scrollHeight;
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─── Player List ──────────────────────────────────────────────────────────────
const AVATARS = ['🐱','🐶','🦊','🐻','🐼','🐨','🦁','🐯','🦝','🐸'];

function renderPlayers(players) {
  const list = document.getElementById('player-list');
  list.innerHTML = '';
  players.forEach((p, i) => {
    const li = document.createElement('li');
    const isMe = p.id === myId;
    const isDr = gameState && p.id === gameState.currentDrawer;
    if (isDr) li.classList.add('is-drawer');
    if (gameState && gameState.guessedPlayers && gameState.guessedPlayers.includes(p.id))
      li.classList.add('guessed');

    li.innerHTML = `
      <div class="avatar" style="background:${avatarColor(i)}">${AVATARS[i % AVATARS.length]}</div>
      <span>${escHtml(p.name)}${isMe ? ' (sen)' : ''}${isDr ? ' 🖌️' : ''}</span>
      <span class="score">${p.score}</span>
    `;
    list.appendChild(li);
  });
}

function avatarColor(i) {
  const colors = ['#ff6b6b33','#4ecdc433','#ffe66d33','#a29bfe33','#fd79a833'];
  return colors[i % colors.length];
}

// ─── Word Display ─────────────────────────────────────────────────────────────
function setWordHint(text) {
  document.getElementById('word-hint').textContent = text;
}

function buildBlanks(len) {
  return Array(len).fill('_').join(' ');
}

// ─── Timer ────────────────────────────────────────────────────────────────────
function setTimer(val) {
  document.getElementById('timer-text').textContent = val;
  const pct = (val / maxTime) * 100;
  document.getElementById('timer-bar').style.setProperty('--progress', pct + '%');
  const bar = document.getElementById('timer-bar');
  if (val <= 10) bar.style.setProperty('--progress', pct + '%');
}

// ─── Overlay ──────────────────────────────────────────────────────────────────
function showOverlay(text) {
  document.getElementById('canvas-overlay').classList.remove('hidden');
  document.getElementById('overlay-content').innerHTML = text;
}

function hideOverlay() {
  document.getElementById('canvas-overlay').classList.add('hidden');
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────
function buildToolbar() {
  const colorsEl = document.querySelector('#toolbar .colors');
  colorsEl.innerHTML = '';
  COLORS.forEach(c => {
    const sw = document.createElement('div');
    sw.className = 'color-swatch' + (c === currentColor ? ' active' : '');
    sw.style.background = c;
    sw.style.border = c === '#ffffff' ? '3px solid #ddd' : '';
    sw.addEventListener('click', () => {
      currentColor = c;
      currentTool = 'pen';
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      sw.classList.add('active');
      setActiveTool('pen');
    });
    colorsEl.appendChild(sw);
  });
}

function setActiveTool(tool) {
  currentTool = tool;
  document.querySelectorAll('.tool-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tool === tool);
  });
}

// ─── Canvas Drawing ───────────────────────────────────────────────────────────
function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

function drawLine(x0, y0, x1, y1, color, size, tool) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
  ctx.lineWidth = tool === 'eraser' ? size * 3 : size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
  ctx.stroke();
  ctx.restore();
}

function floodFill(startX, startY, fillColor) {
  startX = Math.round(startX);
  startY = Math.round(startY);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  function getPixel(x, y) {
    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return [-1,-1,-1,-1];
    const i = (y * canvas.width + x) * 4;
    return [data[i], data[i+1], data[i+2], data[i+3]];
  }

  function colorMatch(a, b) {
    return Math.abs(a[0]-b[0]) < 32 && Math.abs(a[1]-b[1]) < 32 &&
           Math.abs(a[2]-b[2]) < 32 && Math.abs(a[3]-b[3]) < 32;
  }

  const target = getPixel(startX, startY);
  const fill = hexToRgba(fillColor);
  if (colorMatch(target, fill)) return;

  const stack = [[startX, startY]];
  const visited = new Set();

  while (stack.length > 0) {
    const [x, y] = stack.pop();
    const key = x + ',' + y;
    if (visited.has(key)) continue;
    const current = getPixel(x, y);
    if (!colorMatch(current, target)) continue;
    visited.add(key);
    const i = (y * canvas.width + x) * 4;
    data[i] = fill[0]; data[i+1] = fill[1]; data[i+2] = fill[2]; data[i+3] = fill[3];
    stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
  }
  ctx.putImageData(imageData, 0, 0);
}

function hexToRgba(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r, g, b, 255];
}

// ─── Canvas Resize (Mobil Uyum) ───────────────────────────────────────────────
function resizeCanvas() {
  const container = document.getElementById('canvas-container');
  if (!container) return;
  const maxW = container.clientWidth - 32;
  const maxH = container.clientHeight - 32;
  const ratio = 800 / 500;
  let w = maxW;
  let h = w / ratio;
  if (h > maxH) { h = maxH; w = h * ratio; }
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 200));

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', continueDraw);
canvas.addEventListener('mouseup', stopDraw);
canvas.addEventListener('mouseleave', stopDraw);
canvas.addEventListener('touchstart', e => { e.preventDefault(); startDraw(e); }, { passive: false });
canvas.addEventListener('touchmove', e => { e.preventDefault(); continueDraw(e); }, { passive: false });
canvas.addEventListener('touchend', stopDraw);

function startDraw(e) {
  if (!isDrawer) return;
  const pos = getPos(e);

  if (currentTool === 'fill') {
    floodFill(pos.x, pos.y, currentColor);
    socket.emit('draw', { type: 'fill', x: pos.x, y: pos.y, color: currentColor });
    return;
  }

  drawing = true;
  lastX = pos.x;
  lastY = pos.y;
}

function continueDraw(e) {
  if (!isDrawer || !drawing) return;
  if (currentTool === 'fill') return;
  const pos = getPos(e);
  drawLine(lastX, lastY, pos.x, pos.y, currentColor, currentSize, currentTool);
  socket.emit('draw', { type: 'line', x0: lastX, y0: lastY, x1: pos.x, y1: pos.y, color: currentColor, size: currentSize, tool: currentTool });
  lastX = pos.x;
  lastY = pos.y;
}

function stopDraw() {
  drawing = false;
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ─── Game State Handler ───────────────────────────────────────────────────────
function applyGameState(state) {
  gameState = state;
  isDrawer = state.currentDrawer === myId;

  // Toolbar
  document.getElementById('toolbar').classList.toggle('hidden', !isDrawer);
  canvas.style.cursor = isDrawer ? 'crosshair' : 'default';

  // Players
  renderPlayers(state.players);

  // Round info
  document.getElementById('round-display').textContent =
    state.round > 0 ? `${state.round}/${state.maxRounds}` : '-';

  // Room info
  document.getElementById('room-info').textContent = `Oda: ${state.id || myRoomId}`;

  // Word / phase
  if (state.phase === 'waiting') {
    showOverlay('⏳ Oyuncular bekleniyor...<br><small>En az 2 kişi gerekli</small>');
    setWordHint('');
  } else if (state.phase === 'choosing') {
    hideOverlay();
    if (!isDrawer) {
      setWordHint('Kelime seçiliyor...');
    }
  } else if (state.phase === 'drawing') {
    hideOverlay();
    if (!isDrawer) {
      setWordHint(buildBlanks(state.wordLength));
    }
  } else if (state.phase === 'results') {
    // handled by gameOver event
  }
}

// ─── Socket Events ────────────────────────────────────────────────────────────
socket.on('joined', ({ roomId, playerId }) => {
  myId = playerId;
  myRoomId = roomId;
  showScreen('screen-game');
  clearCanvas();
  setTimeout(resizeCanvas, 100);
});

socket.on('privateRoomCreated', (roomId) => {
  document.getElementById('room-info').textContent = `Oda Kodu: ${roomId}`;
  addChatMsg({ system: true, text: `🔒 Özel oda kodu: ${roomId} — Arkadaşlarınla paylaş!` });
});

socket.on('gameState', (state) => {
  applyGameState(state);
});

socket.on('timer', (val) => {
  setTimer(val);
});

socket.on('chooseWord', (words) => {
  const modal = document.getElementById('modal-word-choose');
  const choices = document.getElementById('word-choices');
  choices.innerHTML = '';
  words.forEach(w => {
    const btn = document.createElement('button');
    btn.className = 'word-choice-btn';
    btn.textContent = w.toUpperCase();
    btn.addEventListener('click', () => {
      socket.emit('wordChosen', w);
      modal.classList.add('hidden');
      setWordHint(w.toUpperCase());
    });
    choices.appendChild(btn);
  });
  modal.classList.remove('hidden');
});

socket.on('yourWord', (word) => {
  setWordHint(word.toUpperCase());
});

socket.on('draw', (data) => {
  if (data.type === 'line') {
    drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.size, data.tool);
  } else if (data.type === 'fill') {
    floodFill(data.x, data.y, data.color);
  }
});

socket.on('drawHistory', (history) => {
  clearCanvas();
  history.forEach(data => {
    if (data.type === 'line') {
      drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.size, data.tool);
    } else if (data.type === 'fill') {
      floodFill(data.x, data.y, data.color);
    }
  });
});

socket.on('clearCanvas', () => {
  clearCanvas();
});

socket.on('chatMessage', ({ name, text }) => {
  addChatMsg({ name, text });
});

socket.on('systemMessage', (text) => {
  addChatMsg({ system: true, text });
});

socket.on('wrongGuess', ({ reply }) => {
  const box = document.getElementById('chat-messages');
  const lastMsg = box.lastElementChild;
  if (lastMsg) {
    const replyEl = document.createElement('div');
    replyEl.className = 'chat-reply';
    replyEl.textContent = reply;
    lastMsg.appendChild(replyEl);
    setTimeout(() => replyEl.remove(), 3000);
  }
  box.scrollTop = box.scrollHeight;
});

socket.on('correctGuess', ({ playerId, name, score }) => {
  const isMe = playerId === myId;

  const box = document.getElementById('chat-messages');
  const el = document.createElement('div');
  el.className = 'chat-msg correct-announce';
  el.innerHTML = `<span class="correct-name">${isMe ? '🏆 Sen' : '✅ ' + escHtml(name)}</span><span class="correct-text"> kelimeyi doğru bildi! +${score} puan</span>`;
  box.appendChild(el);
  box.scrollTop = box.scrollHeight;

  if (isMe) {
    showOverlay(`🎉 Doğru!<br><small>+${score} puan kazandın!</small>`);
    setTimeout(hideOverlay, 2500);
  } else {
    showOverlay(`✅ ${escHtml(name)} doğru bildi!`);
    setTimeout(hideOverlay, 2000);
  }
});

socket.on('roundEnd', ({ word, reason, lastGuesser }) => {
  clearCanvas();
  setWordHint('');
  setTimer(0);
  if (reason === 'allGuessed') {
    const isMe = lastGuesser && gameState && gameState.players.find(p => p.id === myId)?.name === lastGuesser;
    const nameText = isMe ? 'Sen' : (lastGuesser || 'Herkes');
    showOverlay(`🎉 ${nameText} son doğruyu bildi!<br>Kelime: <b>${word}</b>`);
  } else {
    showOverlay(`⏱️ Süre doldu!<br>Kelime: <b>${word}</b>`);
  }
  setTimeout(hideOverlay, 3500);
});

socket.on('gameOver', ({ scores, roomId }) => {
  const modal = document.getElementById('modal-game-over');
  const list = document.getElementById('final-scores');
  list.innerHTML = '';
  const medals = ['🥇','🥈','🥉'];
  scores.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'final-score-row';
    const isMe = p.id === myId;
    row.innerHTML = `
      <span class="rank-badge">${medals[i] || (i+1)+'.'}</span>
      <span class="player-name">${escHtml(p.name)}${isMe ? ' (sen)' : ''}</span>
      <span class="player-pts">${p.score} puan</span>
    `;
    list.appendChild(row);
  });

  // Geri sayım
  let countdown = 12;
  const countEl = document.getElementById('gameover-countdown');
  if (countEl) {
    countEl.textContent = countdown;
    const cd = setInterval(() => {
      countdown--;
      countEl.textContent = countdown;
      if (countdown <= 0) clearInterval(cd);
    }, 1000);
  }

  modal.classList.remove('hidden');
});

socket.on('autoRestart', () => {
  document.getElementById('modal-game-over').classList.add('hidden');
  clearCanvas();
  setWordHint('');
  setTimer(80);
  document.getElementById('chat-messages').innerHTML = '';
});

socket.on('error', (msg) => {
  alert('Hata: ' + msg);
});

// ─── Menu Buttons ─────────────────────────────────────────────────────────────
document.getElementById('btn-play').addEventListener('click', () => {
  const name = document.getElementById('input-name').value.trim() || 'Misafir';
  socket.emit('joinPublic', name);
});

document.getElementById('btn-create-private').addEventListener('click', () => {
  const name = document.getElementById('input-name').value.trim() || 'Misafir';
  socket.emit('createPrivate', name);
});

document.getElementById('btn-join-private').addEventListener('click', () => {
  const name = document.getElementById('input-name').value.trim() || 'Misafir';
  const code = document.getElementById('input-room-code').value.trim().toUpperCase();
  if (!code) return alert('Oda kodu gir!');
  socket.emit('joinPrivate', { name, roomId: code });
});

// ─── Chat ─────────────────────────────────────────────────────────────────────
function sendGuess() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  if (gameState && gameState.phase === 'drawing' && !isDrawer) {
    socket.emit('guess', text);
  } else {
    socket.emit('chat', text);
  }
}

document.getElementById('btn-send').addEventListener('click', sendGuess);
// Mobilde touchend ile de çalışsın
document.getElementById('btn-send').addEventListener('touchend', (e) => {
  e.preventDefault();
  sendGuess();
});
document.getElementById('chat-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); sendGuess(); }
});
// Mobilde input'a odaklanınca scroll'u serbest bırak
document.getElementById('chat-input').addEventListener('focus', () => {
  document.getElementById('screen-game').style.overflow = 'auto';
});
document.getElementById('chat-input').addEventListener('blur', () => {
  document.getElementById('screen-game').style.overflow = 'hidden';
});

// ─── Toolbar Events ───────────────────────────────────────────────────────────
buildToolbar();

document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', () => setActiveTool(btn.dataset.tool));
});

document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentSize = parseInt(btn.dataset.size);
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

document.getElementById('btn-clear').addEventListener('click', () => {
  if (!isDrawer) return;
  clearCanvas();
  socket.emit('clearCanvas');
});

// Init
clearCanvas();

// ─── Oyun Sonu Butonları ──────────────────────────────────────────────────────
document.getElementById('btn-play-again').addEventListener('click', () => {
  socket.emit('playAgain');
  document.getElementById('modal-game-over').classList.add('hidden');
  clearCanvas();
  setWordHint('');
  document.getElementById('chat-messages').innerHTML = '';
});

document.getElementById('btn-back-menu').addEventListener('click', () => {
  socket.emit('leave');
  document.getElementById('modal-game-over').classList.add('hidden');
  showScreen('screen-menu');
});
