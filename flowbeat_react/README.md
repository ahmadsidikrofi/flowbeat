# tesis_flowbeat
Codingan tesis

Project is incompatible with this version of expo Go

Upgrade to sdk 54:
npx expo install expo@latest

upgrade dependencie
npx expo install --fix
npx expo-doctor -> cek apa saja yang harus diperbaiki

ada errror ini?
 react-native depends on @react-native-community/cli for cli commands. To fix update your package.json to include:


  "devDependencies": {
    "@react-native-community/cli": "latest",
  }

ini solusinya:
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install