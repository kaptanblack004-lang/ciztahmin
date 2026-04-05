# 🎨 Sırrı Çöz - Interaktif Çizim Oyunu

<div align="center">

![GitHub stars](https://img.shields.io/github/stars/username/siricoz?style=social)
![GitHub forks](https://img.shields.io/github/forks/username/siricoz?style=social)
![GitHub issues](https://img.shields.io/github/issues/username/siricoz)
![GitHub license](https://img.shields.io/github/license/username/siricoz)

**Skribbl.io benzeri çok oyunculu çizim ve tahmin oyunu**

[🚀 Demo](#) • [📖 Kurulum](#kurulum) • [🎮 Nasıl Oynanır](#nasıl-oynanır) • [🤝 Katkıda Bulun](#katkıda-bulunun)

</div>

## ✨ Özellikler

- 🎨 **Gerçek Zamanlı Çizim** - Canvas üzerinde anlık çizim yapma
- 👥 **Çok Oyunculu** - Birden fazla oyuncu aynı anda oynayabilir
- 🎯 **Kelime Tahmini** - Zengin kelime havuzu ile eğlenceli tahminler
- 💬 **Sohbet Sistemi** - Oyuncular arasında mesajlaşma
- 🏆 **Puanlama** - Doğru tahminler ve çizimlerle puan kazanma
- 📱 **Responsive Tasarım** - Masaüstü ve mobil cihazlarda çalışır
- 🌐 **Socket.IO** - Gerçek zamanlı iletişim teknolojisi

## 🛠️ Teknolojiler

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

</div>

## 🚀 Kurulum

### Gereksinimler

- [Node.js](https://nodejs.org/) (v14 veya üzeri)
- [npm](https://www.npmjs.com/) veya [yarn](https://yarnpkg.com/)

### Adım Adım Kurulum

1. **Repository'i klonlayın**
   ```bash
   git clone https://github.com/username/siricoz.git
   cd siricoz
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   # veya
   yarn install
   ```

3. **Sunucuyu başlatın**
   ```bash
   npm start
   # veya
   node server.js
   ```

4. **Tarayıcıda açın**
   
   Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın

## 🎮 Nasıl Oynanır

### Oyunun Amacı
- Rastgele seçilen kelimeleri çizerek diğer oyuncuların tahmin etmesini sağlamak
- Diğer oyuncuların çizimlerini tahmin ederek puan kazanmak

### Oyun Akışı

1. **Oyuna Katılın**
   - Oyun odasına girin ve kullanıcı adınızı belirleyin

2. **Çizim Sırası**
   - Her oyuncu sırayla çizici olur
   - Çiziciye rastgele bir kelime verilir
   - Süre içinde kelimeyi çizin

3. **Tahmin Etme**
   - Diğer oyuncular çizimi izleyip tahminde bulunur
   - Sohbet kısmına tahmininizi yazın

4. **Puanlama**
   - Doğru tahmin = +100 puan
   - Çizim tahmin edildi = +50 puan
   - En çok puanı alan kazanır!

### Kontroller

| Aksiyon | Kontrol |
|---------|---------|
| Çizim | Mouse sol tuş + sürükle |
| Renk değiştir | Renk paletine tıkla |
| Fırça boyutu | Boyut ayarlayıcı |
| Temizle | 🗑️ Temizle butonu |
| Tahmin et | Sohbet kutusuna yaz + Enter |

## 📁 Proje Yapısı

```
sirri-coz/
├── 📄 server.js          # Sunucu dosyası
├── 📄 package.json        # Proje bilgileri
├── 📄 README.md          # Proje dokümantasyonu
├── 📄 .gitignore         # Git ignore dosyası
├── 📁 public/            # İstemci dosyaları
│   ├── 📄 index.html     # Ana sayfa
│   ├── 📄 style.css      # Stil dosyası
│   ├── 📄 game.js        # Oyun mantığı
│   ├── 📄 sw.js          # Service Worker
│   └── 📁 icons/         # Uygulama ikonları
└── 📁 node_modules/       # Bağımlılıklar
```

## 🎯 Kelime Kategorileri

Oyunda 150+ kelime bulunmaktadır:

- 🐾 **Hayvanlar** - Köpek, kedi, aslan, fil...
- 🍎 **Yiyecek & İçecek** - Elma, pizza, kahve...
- 🚗 **Taşıtlar** - Araba, uçak, bisiklet...
- 👨‍⚕️ **Meslekler** - Doktor, öğretmen, pilot...
- 🏠 **Eşyalar** - Masa, kitap, telefon...
- 🌳 **Doğa & Hava** - Güneş, yağmur, gökkuşağı...
- ⚽ **Spor & Eğlence** - Futbol, gitar, satranç...

## 🤝 Katkıda Bulunun

Katkılarınızı bekliyoruz! Lütfen aşağıdaki adımları izleyin:

1. Repository'i **fork** edin
2. Yeni bir **branch** oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi **commit** edin (`git commit -m 'Add some amazing feature'`)
4. **Push** edin (`git push origin feature/amazing-feature`)
5. **Pull Request** oluşturun

## 🐛 Hata Bildirimi

Hata bulduysanız lütfen [Issues](https://github.com/kaptanblack004/siricoz/issues) sayfasını kullanın.

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.

## 🙏 Teşekkürler

- [Socket.IO](https://socket.io/) - Gerçek zamanlı iletişim için
- [Express.js](https://expressjs.com/) - Web framework için
- Tüm katkıda bulunanlara ❤️

---

<div align="center">

**🎨 Hayal gücünüzü konuşturun, sırları çözün!**

Made with ❤️ by [Burak Çalışkan](https://github.com/kaptanblack004)

[⭐ Star](https://github.com/kaptanblack004/siricoz) • [🍴 Fork](https://github.com/kaptanblack004/siricoz/fork) • [📧 Contact](kaptanblack004@gmail.com)

</div>
