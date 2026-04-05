# 🚀 Railway Ücretsiz Cloud Kurulumu

## 📯 Neden Railway?
- ✅ Kredi kartı gerekmez
- ✅ Ücretsiz plan var
- ✅ GitHub ile kolay bağlantı
- ✅ Otomatik deploy
- ✅ Socket.IO destekli

## 🛠️ Kurulum Adımları:

### 1. Railway Hesabı
1. https://railway.app/ adresine gidin
2. "Sign up with GitHub" tıklayın
3. GitHub ile bağlanın
4. Kredi kartı istemez

### 2. New Project
1. Dashboard'da "New Project" tıklayın
2. "Deploy from GitHub repo" seçin

### 3. Repository Seçimi
1. Repository: `kaptanblack004-lang/ciztahmin`
2. Branch: `main`
3. "Deploy" tıklayın

### 4. Service Ayarları
- **Name:** `ciztahmin-server`
- **Runtime:** Node.js
- **Root Directory:** `sirricoz`
- **Start Command:** `npm start`
- **Port:** `3000`

### 5. Environment Variables
- **NODE_ENV:** `production`
- **PORT:** `3000`

### 6. Deploy
- "Deploy" butonuna tıklayın
- 2-3 dakika sürer
- URL alacaksınız

## 🌐 Railway URL Formatı:
`https://ciztahmin-server.up.railway.app`

## 📱 Socket.IO Ayarları:
Game.js'de güncelle:
```javascript
const socket = io('https://ciztahmin-server.up.railway.app', {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  forceNew: true
});
```

## ✅ Avantajları:
- ✅ Kredi kartı gerekmez
- ✅ $5/ay ücretsiz kredi
- ✅ Otomatik deploy
- ✅ GitHub entegrasyonu
- ✅ Socket.IO çalışır

---
**Railway en iyi ücretsiz alternatif!** 🚀
