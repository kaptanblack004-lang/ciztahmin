#!/bin/bash

# Renk kodları
KIRMIZI='\033[0;31m'
YESIL='\033[0;32m'
SARI='\033[1;33m'
MAVI='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BEYAZ='\033[1;37m'
SIFIRLA='\033[0m'

clear

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════╗${SIFIRLA}"
echo -e "${CYAN}║                                                  ║${SIFIRLA}"
echo -e "${CYAN}║   ${BEYAZ}🎨  S I R R I   Ç Ö Z                         ${CYAN}║${SIFIRLA}"
echo -e "${CYAN}║   ${SARI}     Çiz • Tahmin Et • Kazan                  ${CYAN}║${SIFIRLA}"
echo -e "${CYAN}║                                                  ║${SIFIRLA}"
echo -e "${CYAN}║   ${MAGENTA}👨‍💻  Geliştirici: Burak                        ${CYAN}║${SIFIRLA}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${SIFIRLA}"
echo ""

sleep 0.5
echo -e "${SARI}🚀 Sırrı Çöz Projesi Başlatılıyor...${SIFIRLA}"
sleep 0.5

echo -e "${MAVI}📦 Proje klasörüne gidiliyor...${SIFIRLA}"
cd '/home/asus-kali/Masaüstü/sirri-cöz' || {
  echo -e "${KIRMIZI}❌ Klasör bulunamadı! Yol doğru mu?${SIFIRLA}"
  exit 1
}
sleep 0.3

echo -e "${MAVI}📡 Sunucu başlatılıyor...${SIFIRLA}"
node server.js &
SERVER_PID=$!
sleep 2

if ! kill -0 $SERVER_PID 2>/dev/null; then
  echo -e "${KIRMIZI}❌ Sunucu başlatılamadı!${SIFIRLA}"
  exit 1
fi

echo -e "${YESIL}✅ Sunucu çalışıyor! (PID: $SERVER_PID)${SIFIRLA}"
sleep 0.3

echo -e "${MAVI}🌐 Ngrok tüneli açılıyor...${SIFIRLA}"
echo ""
echo -e "${SARI}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${SIFIRLA}"
echo -e "${BEYAZ}  📌 Sabit link: https://stephanie-unvirile-stella.ngrok-free.dev ${SIFIRLA}"
echo -e "${SARI}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${SIFIRLA}"
echo ""
echo -e "${CYAN}  Ctrl+C ile her şeyi kapatabilirsin 🛑${SIFIRLA}"
echo ""

# Her ikisini de temiz kapat
trap "echo ''; echo -e '${KIRMIZI}🛑 Kapatılıyor...${SIFIRLA}'; kill $SERVER_PID 2>/dev/null; kill $NGROK_PID 2>/dev/null; exit 0" INT TERM

# Ngrok'u arka planda başlat
ngrok http --domain=stephanie-unvirile-stella.ngrok-free.dev 3000 --log=stdout &
NGROK_PID=$!

sleep 3

# Ngrok çalışıyor mu?
if ! kill -0 $NGROK_PID 2>/dev/null; then
  echo -e "${KIRMIZI}❌ Ngrok başlatılamadı!${SIFIRLA}"
  kill $SERVER_PID 2>/dev/null
  exit 1
fi

echo -e "${YESIL}✅ Ngrok çalışıyor! (PID: $NGROK_PID)${SIFIRLA}"
echo ""
echo -e "${YESIL}🎮 Oyun hazır! Arkadaşlarına linki gönder!${SIFIRLA}"
echo ""

# İkisi de çalışırken bekle
wait $NGROK_PID

kill $SERVER_PID 2>/dev/null
echo ""
echo -e "${KIRMIZI}👋 Görüşürüz!${SIFIRLA}"
