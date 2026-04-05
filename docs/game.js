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

// ─── Socket.IO Bağlantısı ───────────────────────────────────────────────────────
// GitHub Pages için Socket.IO cloud backend
const socket = io('https://ciztahmin-server.onrender.com', {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  forceNew: true
});

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
let currentTool = 'pen';
let currentColor = '#000000';
let currentSize = 8;

// ─── Socket.IO Event Listeners ─────────────────────────────────────────────────
socket.on('connect', () => {
  console.log('✅ Cloud sunucuya bağlandı!');
  myId = socket.id;
  showNotification('Sunucuya bağlandı!', 'success');
});

socket.on('disconnect', () => {
  console.log('❌ Sunucu bağlantısı koptu!');
  showNotification('Sunucu bağlantısı koptu!', 'error');
});

socket.on('error', (err) => {
  console.error('❌ Socket.IO hatası:', err);
  showNotification('Bağlantı hatası!', 'error');
});

// ─── Oda Eventleri ───────────────────────────────────────────────────────────
socket.on('room-created', (data) => {
  console.log('🏠 Oda oluşturuldu:', data);
  myRoomId = data.roomId;
  showScreen('game');
  updateRoomInfo(data.roomId);
});

socket.on('room-joined', (data) => {
  console.log('👥 Odaya katıldı:', data);
  myRoomId = data.roomId;
  showScreen('game');
  updateRoomInfo(data.roomId);
});

socket.on('player-joined', (data) => {
  console.log('👋 Oyuncu katıldı:', data);
  updatePlayerList(data.players);
});

socket.on('player-left', (data) => {
  console.log('👋 Oyuncu ayrıldı:', data);
  updatePlayerList(data.players);
});

socket.on('game-state', (data) => {
  console.log('🎮 Oyun durumu:', data);
  gameState = data;
  updateGameUI(data);
});

// ─── UI Functions ─────────────────────────────────────────────────────────────
function showNotification(message, type = 'info') {
  console.log(message);
  // iOS notification için
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('ÇizTahmin', { body: message });
  }
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }
}

function updateRoomInfo(roomId) {
  const roomInfo = document.getElementById('room-info');
  if (roomInfo) {
    roomInfo.textContent = `Oda: ${roomId}`;
  }
}

function updatePlayerList(players) {
  const playerList = document.getElementById('player-list');
  if (playerList) {
    playerList.innerHTML = '';
    players.forEach(player => {
      const li = document.createElement('li');
      li.textContent = player.name || player.id;
      if (player.id === myId) {
        li.textContent += ' (Sen)';
      }
      playerList.appendChild(li);
    });
  }
}

function updateGameUI(data) {
  // Oyun arayüzünü güncelle
  if (data.currentWord) {
    const wordDisplay = document.getElementById('word-display');
    if (wordDisplay) {
      wordDisplay.innerHTML = `<span class="word-hint">${data.currentWord}</span>`;
    }
  }
  
  if (data.isDrawing !== undefined) {
    isDrawer = data.isDrawing;
    const toolbar = document.getElementById('toolbar');
    if (toolbar) {
      toolbar.style.display = isDrawer ? 'block' : 'none';
    }
  }
}

// ─── Oda Oluşturma ───────────────────────────────────────────────────────────
document.getElementById('btn-create-private')?.addEventListener('click', () => {
  const playerName = document.getElementById('input-name')?.value.trim() || 'Oyuncu';
  console.log('🏠 Özel oda oluşturuluyor...');
  socket.emit('create-room', { 
    isPrivate: true, 
    playerName: playerName 
  });
});

document.getElementById('btn-join-private')?.addEventListener('click', () => {
  const roomCode = document.getElementById('input-room-code')?.value.trim();
  const playerName = document.getElementById('input-name')?.value.trim() || 'Oyuncu';
  
  if (roomCode) {
    console.log('👥 Odaya katılıyor:', roomCode);
    socket.emit('join-room', { 
      roomId: roomCode, 
      playerName: playerName 
    });
  }
});

document.getElementById('btn-play')?.addEventListener('click', () => {
  const playerName = document.getElementById('input-name')?.value.trim() || 'Oyuncu';
  console.log('🎮 Hızlı oyna...');
  socket.emit('join-random', { playerName: playerName });
});

// ─── Canvas Drawing ───────────────────────────────────────────────────────────
if (canvas) {
  // Touch events for iOS
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
  
  // Mouse events for desktop
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
}

function handleTouchStart(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function handleTouchMove(e) {
  e.preventDefault();
  if (!drawing) return;
  
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  
  drawLine(x, y);
}

function handleTouchEnd(e) {
  e.preventDefault();
  drawing = false;
  ctx.beginPath();
}

function startDrawing(e) {
  drawing = true;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function draw(e) {
  if (!drawing) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  drawLine(x, y);
}

function stopDrawing() {
  drawing = false;
  ctx.beginPath();
}

function drawLine(x, y) {
  ctx.lineWidth = currentSize;
  ctx.lineCap = 'round';
  ctx.strokeStyle = currentColor;
  
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
  
  // Socket.IO ile çizim verisini gönder
  if (socket && socket.connected) {
    socket.emit('drawing', {
      x: x,
      y: y,
      color: currentColor,
      size: currentSize,
      tool: currentTool
    });
  }
}

// ─── Drawing Events ─────────────────────────────────────────────────────────
socket.on('drawing', (data) => {
  if (!isDrawer) {
    ctx.lineWidth = data.size;
    ctx.lineCap = 'round';
    ctx.strokeStyle = data.color;
    
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(data.x, data.y);
  }
});

socket.on('clear-canvas', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// ─── Tool Selection ───────────────────────────────────────────────────────────
document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTool = btn.dataset.tool;
  });
});

document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentColor = btn.dataset.color;
  });
});

document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSize = parseInt(btn.dataset.size);
  });
});

document.getElementById('btn-clear')?.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (socket && socket.connected) {
    socket.emit('clear-canvas');
  }
});

// ─── Chat System ─────────────────────────────────────────────────────────────
document.getElementById('btn-send')?.addEventListener('click', sendMessage);
document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

function sendMessage() {
  const input = document.getElementById('chat-input');
  const message = input?.value.trim();
  
  if (message && socket && socket.connected) {
    socket.emit('guess', message);
    input.value = '';
  }
}

socket.on('guess', (data) => {
  const chatMessages = document.getElementById('chat-messages');
  if (chatMessages) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = `${data.playerName}: ${data.message}`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});

// ─── Notification Permission ────────────────────────────────────────────────
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

console.log('🎮 ÇizTahmin oyunu yüklendi - GitHub Pages sürümü!');
