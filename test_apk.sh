#!/bin/bash

echo "📱 ÇizTahmin APK Test Başlatılıyor..."

# APK kontrol
APK_FILE="ÇizTahmin_Real_v1.0.0.apk"

echo "📊 APK Dosyası Kontrol Ediliyor..."
if [ -f "$APK_FILE" ]; then
    echo "✅ APK dosyası bulundu"
    echo "📊 Boyut: $(ls -lh $APK_FILE | awk '{print $5}')"
else
    echo "❌ APK dosyası bulunamadı!"
    exit 1
fi

# APK içeriği kontrol
echo "🔍 APK İçeriği Kontrol Ediliyor..."
file $APK_FILE

# Test yöntemleri
echo "🎮 Test Yöntemleri:"
echo "1. BlueStacks Emulator"
echo "2. NoxPlayer Emulator"
echo "3. Android Studio Emulator"
echo "4. Genymotion"

echo ""
echo "📱 APK Konumu: $(pwd)/$APK_FILE"
echo "🌐 Web Sürümü: https://kaptanblack004-lang.github.io/ciztahmin"
echo "📞 APK Link: https://raw.githubusercontent.com/kaptanblack004-lang/ciztahmin/main/docs/ÇizTahmin_Real_v1.0.0.apk"

echo ""
echo "✅ APK Test Hazır!"
echo "🚀 Hemen test edebilirsiniz!"
