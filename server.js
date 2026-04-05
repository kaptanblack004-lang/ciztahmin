const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// ─── Kelime Listesi ───────────────────────────────────────────────────────────
const WORDS = [
  // Hayvanlar
  'köpek', 'kedi', 'balık', 'kuş', 'aslan', 'kaplan', 'fil', 'zürafa', 'maymun',
  'tavşan', 'kaplumbağa', 'timsah', 'penguen', 'kartal', 'baykuş', 'at', 'inek',
  'domuz', 'koyun', 'keçi', 'horoz', 'tavuk', 'ördek', 'kaz', 'arı', 'kelebek',
  'örümcek', 'yılan', 'kertenkele', 'yunus', 'balina', 'köpekbalığı', 'ahtapot',
  'midye', 'yengeç', 'istakoz', 'karınca', 'çekirge', 'uğur böceği', 'salyangoz',
  // Yiyecek & İçecek
  'elma', 'armut', 'muz', 'çilek', 'üzüm', 'kiraz', 'karpuz', 'kavun', 'portakal',
  'limon', 'ananas', 'mango', 'kivi', 'şeftali', 'erik', 'incir', 'nar', 'hurma',
  'pizza', 'hamburger', 'sandviç', 'makarna', 'pilav', 'çorba', 'kebap', 'döner',
  'börek', 'simit', 'ekmek', 'pasta', 'kek', 'kurabiye', 'dondurma', 'çikolata',
  'kahve', 'çay', 'süt', 'ayran', 'meyve suyu', 'kola', 'su', 'bira',
  'domates', 'salatalık', 'biber', 'patlıcan', 'kabak', 'havuç', 'soğan', 'sarımsak',
  'patates', 'mısır', 'brokoli', 'ıspanak', 'marul', 'mantar', 'bezelye',
  // Taşıtlar
  'araba', 'otobüs', 'tren', 'uçak', 'gemi', 'bisiklet', 'motosiklet', 'taksi',
  'ambulans', 'itfaiye arabası', 'kamyon', 'traktör', 'helikopter', 'balon',
  'tekne', 'kayık', 'denizaltı', 'roket', 'uzay mekiği',
  // Meslekler
  'doktor', 'öğretmen', 'polis', 'itfaiyeci', 'aşçı', 'pilot', 'astronot',
  'ressam', 'müzisyen', 'futbolcu', 'doktor', 'mühendis', 'avukat', 'hemşire',
  // Eşyalar
  'masa', 'sandalye', 'koltuk', 'yatak', 'dolap', 'kitaplık', 'lamba', 'ayna',
  'kalem', 'kitap', 'defter', 'makas', 'cetvel', 'silgi', 'çanta', 'saat',
  'telefon', 'bilgisayar', 'klavye', 'fare', 'ekran', 'televizyon', 'radyo',
  'gözlük', 'şapka', 'ayakkabı', 'çorap', 'eldiven', 'atkı', 'şemsiye',
  'bardak', 'tabak', 'kaşık', 'çatal', 'bıçak', 'tencere', 'tava', 'fırın',
  'buzdolabı', 'çamaşır makinesi', 'süpürge', 'anahtar', 'kapı', 'pencere',
  // Doğa & Hava
  'güneş', 'ay', 'yıldız', 'bulut', 'yağmur', 'kar', 'fırtına', 'gökkuşağı',
  'ağaç', 'çiçek', 'yaprak', 'dağ', 'deniz', 'nehir', 'göl', 'orman', 'çöl',
  'ada', 'şelale', 'yanardağ', 'mağara', 'çimen', 'kaya', 'toprak', 'buz',
  // Spor & Eğlence
  'futbol', 'basketbol', 'tenis', 'yüzme', 'koşu', 'boks', 'güreş', 'voleybol',
  'bowling', 'golf', 'kayak', 'sörf', 'satranç', 'tavla', 'iskambil',
  'gitar', 'piyano', 'davul', 'keman', 'flüt', 'trompet',
  // Yapılar & Yerler
  'ev', 'kale', 'köprü', 'cami', 'kilise', 'okul', 'hastane', 'market',
  'park', 'bahçe', 'havuz', 'plaj', 'stadyum', 'sinema', 'tiyatro', 'müze',
  'kütüphane', 'otel', 'restoran', 'banka', 'postane', 'eczane',
  // Fantastik & Eğlenceli
  'ejderha', 'prenses', 'robot', 'uzaylı', 'cadı', 'vampir', 'zombi', 'peri',
  'hazine', 'korsan', 'ninja', 'süpermen', 'büyücü', 'canavar',
];

// ─── Yanlış Tahmin Yanıtları ──────────────────────────────────────────────────
const YANLIS_YANITLAR = [
  'Ah! Dostum, tahminin yanlış 😅',
  'Olmadı! Bir daha dene 🤔',
  'Yakın değilsin bile 😂',
  'Hiç öyle bir şey yok 😄',
  'Maalesef yanlış! 😬',
  'Bu ne ya 😂 Daha iyi bak!',
  'Neredeyse... Hayır değil 😄',
  'Gözlerini aç biraz 👀',
  'Hmmm, sanmıyorum 🤭',
  'Çizene yazık 😅',
  'Keşke doğru olsaydı 😩',
  'Yanlış! Ama cesur tahmin 💪',
];

// ─── Oda Yönetimi ─────────────────────────────────────────────────────────────
const rooms = {};

function getRandomWords(count = 3) {
  const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function createRoom(roomId, isPrivate = false) {
  return {
    id: roomId,
    isPrivate,
    players: [],
    currentWord: null,
    currentDrawer: null,
    round: 0,
    maxRounds: 3,
    timeLeft: 80,
    timer: null,
    phase: 'waiting', // waiting | choosing | drawing | reveal | results
    guessedPlayers: new Set(),
    drawHistory: []
  };
}

function getRoom(roomId) {
  return rooms[roomId];
}

function getPublicRoom() {
  for (const r of Object.values(rooms)) {
    if (!r.isPrivate && r.phase === 'waiting' && r.players.length < 8) return r;
  }
  const id = Math.random().toString(36).slice(2, 8).toUpperCase();
  rooms[id] = createRoom(id, false);
  return rooms[id];
}

function nextDrawer(room) {
  const idx = room.players.findIndex(p => p.id === room.currentDrawer);
  return room.players[(idx + 1) % room.players.length];
}

function startRound(room) {
  room.guessedPlayers.clear();
  room.drawHistory = [];
  const drawer = room.currentDrawer
    ? nextDrawer(room)
    : room.players[0];

  if (!drawer) return;
  room.currentDrawer = drawer.id;
  room.phase = 'choosing';

  const words = getRandomWords(3);
  io.to(drawer.id).emit('chooseWord', words);
  io.to(room.id).emit('gameState', sanitizeRoom(room, null));
  io.to(room.id).emit('systemMessage', `🎨 ${drawer.name} kelime seçiyor...`);
}

function beginDrawing(room, word) {
  room.currentWord = word;
  room.phase = 'drawing';
  room.timeLeft = 80;

  const drawer = room.players.find(p => p.id === room.currentDrawer);
  io.to(room.id).emit('gameState', sanitizeRoom(room, null));
  io.to(room.currentDrawer).emit('yourWord', word);
  io.to(room.id).emit('systemMessage', `✏️ ${drawer.name} çiziyor! Kelimeyi tahmin et!`);

  room.timer = setInterval(() => {
    room.timeLeft--;
    io.to(room.id).emit('timer', room.timeLeft);

    if (room.timeLeft <= 0) {
      clearInterval(room.timer);
      endRound(room);
    }
  }, 1000);
}

function endRound(room, reason = 'timeout', lastGuesser = null) {
  clearInterval(room.timer);
  room.phase = 'reveal';
  const word = room.currentWord;
  room.currentWord = null;
  io.to(room.id).emit('roundEnd', { word, reason, lastGuesser });
  const msg = reason === 'allGuessed'
    ? `🎉 ${lastGuesser ? lastGuesser + ' son doğruyu bildi!' : 'Herkes doğru bildi!'} Kelime: "${word}"`
    : `⏱️ Süre doldu! Kelime: "${word}"`;
  io.to(room.id).emit('systemMessage', msg);

  setTimeout(() => {
    // Sonraki round veya oyun sonu
    const drawerIdx = room.players.findIndex(p => p.id === room.currentDrawer);
    const isLastDrawer = drawerIdx === room.players.length - 1;

    if (isLastDrawer) {
      room.round++;
    }

    if (room.round >= room.maxRounds) {
      endGame(room);
    } else {
      startRound(room);
    }
  }, 4000);
}

function endGame(room) {
  room.phase = 'results';
  const sorted = [...room.players].sort((a, b) => b.score - a.score);
  io.to(room.id).emit('gameOver', { scores: sorted, roomId: room.id });
  io.to(room.id).emit('systemMessage', `🏆 Oyun bitti! Kazanan: ${sorted[0]?.name}`);

  // 12 saniye sonra otomatik yeniden başlat
  room._restartTimer = setTimeout(() => {
    if (room.players.length >= 2) {
      room.players.forEach(p => { p.score = 0; });
      room.round = 0;
      room.currentDrawer = null;
      room.phase = 'waiting';
      io.to(room.id).emit('autoRestart');
      io.to(room.id).emit('gameState', sanitizeRoom(room, null));
      io.to(room.id).emit('systemMessage', '🔄 Yeni oyun başlıyor...');
      setTimeout(() => {
        if (room.players.length >= 2 && room.phase === 'waiting') {
          room.phase = 'playing';
          startRound(room);
        }
      }, 2000);
    } else {
      room.phase = 'waiting';
      io.to(room.id).emit('gameState', sanitizeRoom(room, null));
    }
  }, 12000);
}

function sanitizeRoom(room, requesterId) {
  return {
    id: room.id,
    phase: room.phase,
    round: room.round,
    maxRounds: room.maxRounds,
    timeLeft: room.timeLeft,
    currentDrawer: room.currentDrawer,
    wordLength: room.currentWord ? room.currentWord.length : 0,
    players: room.players.map(p => ({ id: p.id, name: p.name, score: p.score }))
  };
}

// ─── Socket.io ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  let currentRoom = null;

  socket.on('joinPublic', (name) => {
    const room = getPublicRoom();
    joinRoom(socket, name, room);
  });

  socket.on('createPrivate', (name) => {
    const id = Math.random().toString(36).slice(2, 8).toUpperCase();
    rooms[id] = createRoom(id, true);
    joinRoom(socket, name, rooms[id]);
    socket.emit('privateRoomCreated', id);
  });

  socket.on('joinPrivate', ({ name, roomId }) => {
    const room = rooms[roomId.toUpperCase()];
    if (!room) return socket.emit('error', 'Oda bulunamadı!');
    joinRoom(socket, name, room);
  });

  function joinRoom(socket, name, room) {
    currentRoom = room;
    const player = { id: socket.id, name: name || 'Misafir', score: 0 };
    room.players.push(player);
    socket.join(room.id);

    if (room.drawHistory.length > 0) {
      socket.emit('drawHistory', room.drawHistory);
    }

    socket.emit('joined', { roomId: room.id, playerId: socket.id, phase: room.phase });
    io.to(room.id).emit('gameState', sanitizeRoom(room, socket.id));
    io.to(room.id).emit('systemMessage', `👋 ${player.name} katıldı!`);

    // Sadece waiting durumunda otomatik başlat
    if (room.players.length >= 2 && room.phase === 'waiting') {
      setTimeout(() => {
        if (room.players.length >= 2 && room.phase === 'waiting') {
          room.phase = 'playing';
          startRound(room);
        }
      }, 2000);
    }
  }

  // Tekrar oyna butonu
  socket.on('playAgain', () => {
    if (!currentRoom) return;
    if (currentRoom._restartTimer) {
      clearTimeout(currentRoom._restartTimer);
      currentRoom._restartTimer = null;
    }
    currentRoom.players.forEach(p => { p.score = 0; });
    currentRoom.round = 0;
    currentRoom.currentDrawer = null;
    currentRoom.phase = 'waiting';
    io.to(currentRoom.id).emit('autoRestart');
    io.to(currentRoom.id).emit('gameState', sanitizeRoom(currentRoom, null));
    io.to(currentRoom.id).emit('systemMessage', '🔄 Yeni oyun başlıyor...');
    setTimeout(() => {
      if (currentRoom && currentRoom.players.length >= 2 && currentRoom.phase === 'waiting') {
        currentRoom.phase = 'playing';
        startRound(currentRoom);
      }
    }, 2000);
  });

  socket.on('wordChosen', (word) => {
    if (!currentRoom || currentRoom.currentDrawer !== socket.id) return;
    beginDrawing(currentRoom, word);
  });

  socket.on('draw', (data) => {
    if (!currentRoom || currentRoom.currentDrawer !== socket.id) return;
    currentRoom.drawHistory.push(data);
    socket.to(currentRoom.id).emit('draw', data);
  });

  socket.on('clearCanvas', () => {
    if (!currentRoom || currentRoom.currentDrawer !== socket.id) return;
    currentRoom.drawHistory = [];
    socket.to(currentRoom.id).emit('clearCanvas');
  });

  socket.on('guess', (guess) => {
    if (!currentRoom || currentRoom.phase !== 'drawing') return;
    if (socket.id === currentRoom.currentDrawer) return;
    if (currentRoom.guessedPlayers.has(socket.id)) return;

    const player = currentRoom.players.find(p => p.id === socket.id);
    if (!player) return;

    function trLower(str) {
      return str.replace(/İ/g, 'i').replace(/I/g, 'ı').replace(/Ğ/g, 'ğ')
                .replace(/Ü/g, 'ü').replace(/Ş/g, 'ş').replace(/Ö/g, 'ö')
                .replace(/Ç/g, 'ç').toLowerCase();
    }
    if (trLower(guess.trim()) === trLower(currentRoom.currentWord || '')) {
      currentRoom.guessedPlayers.add(socket.id);
      const timeBonus = Math.floor(currentRoom.timeLeft * 5);
      player.score += 100 + timeBonus;

      // Çizene de puan ver
      const drawer = currentRoom.players.find(p => p.id === currentRoom.currentDrawer);
      if (drawer) drawer.score += 50;

      io.to(currentRoom.id).emit('correctGuess', { playerId: socket.id, name: player.name, score: 100 + timeBonus });
      io.to(currentRoom.id).emit('gameState', sanitizeRoom(currentRoom, null));
      io.to(currentRoom.id).emit('systemMessage', `✅ ${player.name} doğru bildi! +${100 + timeBonus} puan 🎉`);

      // Herkes bildi mi?
      const guessers = currentRoom.players.filter(p => p.id !== currentRoom.currentDrawer);
      if (currentRoom.guessedPlayers.size >= guessers.length) {
        clearInterval(currentRoom.timer);
        endRound(currentRoom, 'allGuessed', player.name);
      }
    } else {
      const yanlis = YANLIS_YANITLAR[Math.floor(Math.random() * YANLIS_YANITLAR.length)];
      io.to(currentRoom.id).emit('chatMessage', { name: player.name, text: guess });
      socket.emit('wrongGuess', { reply: yanlis });
    }
  });

  socket.on('chat', (text) => {
    if (!currentRoom) return;
    const player = currentRoom.players.find(p => p.id === socket.id);
    if (!player) return;
    io.to(currentRoom.id).emit('chatMessage', { name: player.name, text });
  });

  socket.on('leave', () => {
    if (!currentRoom) return;
    currentRoom.players = currentRoom.players.filter(p => p.id !== socket.id);
    io.to(currentRoom.id).emit('gameState', sanitizeRoom(currentRoom, null));
    io.to(currentRoom.id).emit('systemMessage', `👋 Bir oyuncu ayrıldı`);
    socket.leave(currentRoom.id);
    currentRoom = null;
  });

  socket.on('disconnect', () => {
    if (!currentRoom) return;
    currentRoom.players = currentRoom.players.filter(p => p.id !== socket.id);
    io.to(currentRoom.id).emit('gameState', sanitizeRoom(currentRoom, null));
    io.to(currentRoom.id).emit('systemMessage', `👋 Bir oyuncu ayrıldı`);

    if (currentRoom.players.length < 2 && currentRoom.phase !== 'waiting') {
      clearInterval(currentRoom.timer);
      currentRoom.phase = 'waiting';
      currentRoom.currentWord = null;
      currentRoom.currentDrawer = null;
      io.to(currentRoom.id).emit('gameState', sanitizeRoom(currentRoom, null));
      io.to(currentRoom.id).emit('systemMessage', '⏳ Yeterli oyuncu yok, bekleniyor...');
    }

    if (currentRoom.players.length === 0) {
      delete rooms[currentRoom.id];
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🎮 Oyun sunucusu çalışıyor: http://localhost:${PORT}`);
});
