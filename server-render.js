// ─── server-render.js ──────────────────────────────────────────────────────────
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Kelime Havuzu ─────────────────────────────────────────────────────────────
const kelimeler = [
  'kedi', 'köpek', 'kuş', 'balık', 'at', 'inek', 'koyun', 'keçi', 'tavşan', 'fare',
  'elma', 'armut', 'muz', 'portakal', 'çilek', 'üzüm', 'kiraz', 'şeftali', 'karpuz', 'kavun',
  'araba', 'bisiklet', 'uçak', 'tren', 'gemi', 'otobüs', 'kamyon', 'motorsiklet', 'metro', 'tramvay',
  'ev', 'okul', 'hastane', 'market', 'restoran', 'kütüphane', 'sinema', 'tiyatro', 'park', 'otopark',
  'güneş', 'ay', 'yıldız', 'bulut', 'yağmur', 'kar', 'rüzgar', 'şimşek', 'gökkuşağı', 'fırtına',
  'ağaç', 'çiçek', 'çimen', 'yaprak', 'dal', 'kök', 'meyve', 'sebze', 'toprak', 'sulama',
  'kitap', 'kalem', 'defter', 'silgi', 'cetvel', 'masa', 'sandalye', 'bilgisayar', 'telefon', 'televizyon',
  'anne', 'baba', 'kardeş', 'arkadaş', 'öğretmen', 'doktor', 'hemşire', 'polis', 'itfaiyeci', 'asker',
  'futbol', 'basketbol', 'voleybol', 'tenis', 'yüzme', 'koşu', 'yürüyüş', 'bisiklet', 'dans', 'müzik',
  'pasta', 'börek', 'pilav', 'çorba', 'salata', 'kebap', 'döner', 'pizza', 'hamburger', 'tost',
  'gözlük', 'saat', 'kemer', 'çanta', 'ayakkabı', 'çorap', 'elbise', 'pantolon', 'gömlek', 'ceket'
];

// ─── Oda Yönetimi ─────────────────────────────────────────────────────────────
const rooms = new Map();
const players = new Map();

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getRandomWord() {
  return kelimeler[Math.floor(Math.random() * kelimeler.length)];
}

// ─── Socket.IO Event Handlers ─────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('✅ Kullanıcı bağlandı:', socket.id);
  
  // Kullanıcı bilgilerini kaydet
  players.set(socket.id, {
    id: socket.id,
    name: null,
    room: null,
    score: 0,
    isDrawing: false
  });

  // Oda oluşturma
  socket.on('create-room', (data) => {
    const roomCode = generateRoomCode();
    const playerName = data.playerName || 'Oyuncu ' + socket.id.substring(0, 4);
    
    // Oda oluştur
    const room = {
      id: roomCode,
      players: [],
      currentWord: null,
      currentDrawer: null,
      gameState: 'waiting',
      round: 0,
      maxRounds: 5,
      roundTime: 80,
      timeLeft: 80
    };
    
    rooms.set(roomCode, room);
    
    // Oyuncuyu odaya ekle
    joinRoom(socket, roomCode, playerName);
    
    socket.emit('room-created', {
      roomId: roomCode,
      players: room.players
    });
    
    console.log('🏠 Oda oluşturuldu:', roomCode);
  });

  // Odaya katılma
  socket.on('join-room', (data) => {
    const { roomId, playerName } = data;
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', 'Oda bulunamadı!');
      return;
    }
    
    joinRoom(socket, roomId, playerName);
    
    socket.emit('room-joined', {
      roomId: roomId,
      players: room.players
    });
    
    // Diğer oyunculara haber ver
    socket.to(roomId).emit('player-joined', {
      playerId: socket.id,
      playerName: playerName,
      players: room.players
    });
    
    console.log('👥 Odaya katıldı:', roomId, playerName);
  });

  // Rastgele odaya katılma
  socket.on('join-random', (data) => {
    const playerName = data.playerName || 'Oyuncu ' + socket.id.substring(0, 4);
    
    // Boş oda bul veya yeni oda oluştur
    let availableRoom = null;
    for (const [roomId, room] of rooms) {
      if (room.players.length < 8 && room.gameState === 'waiting') {
        availableRoom = roomId;
        break;
      }
    }
    
    if (!availableRoom) {
      socket.emit('create-room', { playerName: playerName });
      return;
    }
    
    joinRoom(socket, availableRoom, playerName);
    
    socket.emit('room-joined', {
      roomId: availableRoom,
      players: rooms.get(availableRoom).players
    });
    
    socket.to(availableRoom).emit('player-joined', {
      playerId: socket.id,
      playerName: playerName,
      players: rooms.get(availableRoom).players
    });
  });

  // Çizim verisi
  socket.on('drawing', (data) => {
    const player = players.get(socket.id);
    if (player && player.room) {
      socket.to(player.room).emit('drawing', data);
    }
  });

  // Tuvali temizle
  socket.on('clear-canvas', () => {
    const player = players.get(socket.id);
    if (player && player.room) {
      socket.to(player.room).emit('clear-canvas');
    }
  });

  // Tahmin
  socket.on('guess', (data) => {
    const player = players.get(socket.id);
    if (!player || !player.room) return;
    
    const room = rooms.get(player.room);
    if (!room || !room.currentWord) return;
    
    const isCorrect = data.message.toLowerCase() === room.currentWord.toLowerCase();
    
    if (isCorrect && !player.isDrawing) {
      player.score += 10;
      socket.emit('guess-correct', { word: room.currentWord });
      socket.to(player.room).emit('guess-correct', {
        playerId: socket.id,
        playerName: player.name,
        word: room.currentWord
      });
    }
    
    socket.to(player.room).emit('guess', {
      playerId: socket.id,
      playerName: player.name,
      message: data.message
    });
  });

  // Bağlantı kesilmesi
  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (player && player.room) {
      const room = rooms.get(player.room);
      if (room) {
        room.players = room.players.filter(p => p.id !== socket.id);
        
        if (room.players.length === 0) {
          rooms.delete(player.room);
        } else {
          socket.to(player.room).emit('player-left', {
            playerId: socket.id,
            players: room.players
          });
        }
      }
    }
    
    players.delete(socket.id);
    console.log('❌ Kullanıcı ayrıldı:', socket.id);
  });
});

// ─── Yardımcı Fonksiyonlar ─────────────────────────────────────────────────────
function joinRoom(socket, roomId, playerName) {
  const room = rooms.get(roomId);
  const player = players.get(socket.id);
  
  player.name = playerName;
  player.room = roomId;
  
  room.players.push({
    id: socket.id,
    name: playerName,
    score: 0,
    isDrawing: false
  });
  
  socket.join(roomId);
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size, players: players.size });
});

// ─── Server Start ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 ÇizTahmin server çalışıyor: ${PORT}`);
  console.log(`📱 Aktif odalar: ${rooms.size}`);
  console.log(`👥 Bağlı oyuncular: ${players.size}`);
});
