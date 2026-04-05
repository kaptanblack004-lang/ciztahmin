# 🎮 Glitch Ücretsiz Cloud Kurulumu

## 📯 Neden Glitch?
- ✅ Kredi kartı gerekmez
- ✅ Tamamen ücretsiz
- ✅ Anında çalışır
- ✅ Socket.IO destekli
- ✅ Editör dahil

## 🛠️ Kurulum Adımları:

### 1. Glitch Hesabı
1. https://glitch.com/ adresine gidin
2. "Sign up" tıklayın
3. GitHub veya Google ile bağlanın
4. Kredi kartı istemez

### 2. New Project
1. "New Project" tıklayın
2. "Import from GitHub" seçin
3. Repository: `kaptanblack004-lang/ciztahmin`

### 3. Project Ayarları
- **Name:** `ciztahmin-server`
- **Type:** Node.js
- **Start Script:** `npm start`

### 4. Server Dosyası
server-render.js dosyasını ana dizine taşı
package.json dosyasını güncelle

### 5. Deploy
- "Show" tıklayın
- Anında çalışır
- URL alacaksınız

## 🌐 Glitch URL Formatı:
`https://ciztahmin-server.glitch.me`

## 📱 Socket.IO Ayarları:
```javascript
const socket = io('https://ciztahmin-server.glitch.me', {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  forceNew: true
});
```

## ✅ Avantajları:
- ✅ Kredi kartı gerekmez
- ✅ Tamamen ücretsiz
- ✅ Anında deploy
- ✅ Editör dahil
- ✅ Socket.IO çalışır

---
**Glitch en hızlı ücretsiz çözüm!** 🚀
