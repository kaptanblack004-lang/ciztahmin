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

// ─── Socket.IO Bağlantısı ───────────────────────────────────────────────────────
// GitHub Pages için Socket.IO çalışmaz, bu yüzden local server kullanıyoruz
const socket = io('http://192.168.1.102:3000', {
  transports: ['websocket'],
  timeout: 5000,
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
  console.log('✅ Sunucuya bağlandı!');
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

// ─── UI Functions ─────────────────────────────────────────────────────────────
function showNotification(message, type = 'info') {
  console.log(message);
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

function updateRoomInfo(roomId) {
  const roomInfo = document.getElementById('room-info');
  if (roomInfo) {
    roomInfo.textContent = `Oda: ${roomId}`;
  }
}

// ─── Oda Oluşturma ───────────────────────────────────────────────────────────
document.getElementById('btn-create-private')?.addEventListener('click', () => {
  console.log('🏠 Özel oda oluşturuluyor...');
  socket.emit('create-room', { isPrivate: true });
});

document.getElementById('btn-join-private')?.addEventListener('click', () => {
  const roomCode = document.getElementById('input-room-code').value.trim();
  if (roomCode) {
    console.log('👥 Odaya katılıyor:', roomCode);
    socket.emit('join-room', { roomId: roomCode });
  }
});

// ─── Canvas Drawing ───────────────────────────────────────────────────────────
if (canvas) {
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
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
  
  ctx.lineWidth = currentSize;
  ctx.lineCap = 'round';
  ctx.strokeStyle = currentColor;
  
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function stopDrawing() {
  if (drawing) {
    drawing = false;
    ctx.beginPath();
  }
}

console.log('🎮 ÇizTahmin oyunu yüklendi!');
