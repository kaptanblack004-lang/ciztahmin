# 🚀 Render Cloud Server Kurulumu

## 📯 Hedef:
- PC kapalıyken çalışan Socket.IO server
- iOS ve Web'de online oyun
- Özel oda oluşturma

## 🛠️ Kurulum Adımları:

### 1. GitHub Repository Hazırlama
```bash
# Dosyaları GitHub'a push et
git add server-render.js package-render.json
git commit -m "Add Render server files"
git push origin main
```

### 2. Render.com Hesabı
1. https://render.com/ adresine gidin
2. Ücretsiz hesap oluşturun
3. GitHub ile bağlanın

### 3. Web Service Oluşturma
1. Dashboard'da "New +" tıklayın
2. "Web Service" seçin
3. GitHub repository seçin:
   - Repository: kaptanblack004-lang/ciztahmin
   - Branch: main
   - Root Directory: sirricoz

### 4. Build Settings
- **Name:** ciztahmin-server
- **Runtime:** Node
- **Build Command:** npm install
- **Start Command:** npm start
- **Instance Type:** Free
- **Plan:** Free

### 5. Environment Variables
- **PORT:** 3000 (Render otomatik ayarlar)

### 6. Deploy
- "Create Web Service" tıklayın
- Deploy işlemi 2-3 dakika sürer
- Logları izleyin

## 🌐 Server URL
Deploy sonrası URL: https://ciztahmin-server.onrender.com

## 📱 Test
1. Browser'da: https://ciztahmin-server.onrender.com
2. Health check: https://ciztahmin-server.onrender.com/health

## 🔧 Socket.IO Ayarları
Game.js'de server URL güncelle:
```javascript
const socket = io('https://ciztahmin-server.onrender.com', {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  forceNew: true
});
```

## ✅ Sonuç
- ✅ Cloud server çalışır
- ✅ iOS'ta özel oda oluşturulur
- ✅ PC kapalıyken oyun çalışır
- ✅ Her yerden erişim

---
**Render kurulumu sonrası oyun her zaman çalışacak!** 🚀
