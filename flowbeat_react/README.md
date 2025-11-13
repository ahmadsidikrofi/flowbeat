# tesis_flowbeat
Codingan tesis

Project is incompatible with this version of expo Go

Upgrade to sdk 54:
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npx expo install expo@latest

upgrade dependencie
npx expo install --fix
npx expo-doctor -> cek apa saja yang harus diperbaiki

Koneksikan React Native ke API
npm install axios

agar bisa akses ENV jalanin projeknya pakai ini agar terhapus cachenya
npx expo start -c

pastikan koneksi laptop dan hp sama

tambahkan untuk autentikasi
npx expo install @react-native-async-storage/async-storage

buat upload image
npx expo install expo-image-picker

untuk full brightness npx expo install expo-brightness

akses camera
npx expo prebuild
npx expo start -c

Buat deploy
# Install EAS CLI
npm install -g eas-cli

# Login ke Expo
eas login

# Konfigurasi project
eas build:configure

# Build APK untuk testing
eas build --platform android --profile preview

# Build AAB untuk production (Play Store)
eas build --platform android --profile production

# Submit ke Play Store (otomatis)
eas submit --platform android

Yang Diulang Setiap Ada Perubahan code:
🔄 Ini aja yang diulang setiap ada update

# 1. Ubah code kamu
# 2. Update version di app.json
# 3. Build ulang

# Untuk testing:
eas build --platform android --profile preview

# Untuk production:
eas build --platform android --profile production

# Submit ke Play Store (kalau sudah di store):
eas submit --platform android

Update Version 📝
Edit app.json:
"expo": {
    "version": "1.0.1",  // ✅ Naik dari 1.0.0 → 1.0.1
    "android": {
      "versionCode": 2   // ✅ Naik dari 1 → 2
    }

untuk show diagram
npm install react-native-chart-kit react-native-svg

untuk dering dna getar
npx expo install expo-av