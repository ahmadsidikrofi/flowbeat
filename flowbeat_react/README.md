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
