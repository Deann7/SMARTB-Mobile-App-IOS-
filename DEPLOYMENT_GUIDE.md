# 🚀 Panduan Menjalankan SMARTB Mobile App

## 📋 Prasyarat

Pastikan Anda telah menginstall:
- ✅ Node.js (v16 atau lebih baru) - [Download](https://nodejs.org/)
- ✅ npm atau yarn (termasuk dalam Node.js)
- ✅ Git - [Download](https://git-scm.com/)

## 🔧 Langkah 1: Persiapan Awal

### 1.1 Clone Repository (Jika Belum)
```bash
git clone https://github.com/Deann7/SMARTB-Mobile-App-IOS-.git
cd SMARTB-Mobile-App-IOS-
```

### 1.2 Install Dependencies
```bash
npm install
```
atau jika menggunakan yarn:
```bash
yarn install
```

## 🔐 Langkah 2: Konfigurasi Akun Expo

### 2.1 Install Expo CLI (Global)
```bash
npm install -g expo-cli
```

### 2.2 Login ke Akun Expo Anda
```bash
npx expo login
```
Masukkan username dan password akun Expo Anda.

> **Belum punya akun?** Buat akun gratis di [expo.dev/signup](https://expo.dev/signup)

### 2.3 Initialize Project dengan Akun Anda
```bash
npx eas init
```
Ikuti instruksi:
1. Pilih "Create a new project" atau "Link to existing project"
2. Konfirmasi nama project
3. Project ID baru akan ditambahkan ke `app.json`

## 📱 Langkah 3: Testing Development

### 3.1 Jalankan Development Server
```bash
npm start
```
atau
```bash
npx expo start
```

### 3.2 Testing di Device Android

**Opsi A: Menggunakan Device Fisik**
1. Install aplikasi **Expo Go** dari Google Play Store
2. Scan QR code yang muncul di terminal menggunakan Expo Go
3. Aplikasi akan dimuat di device Anda

**Opsi B: Menggunakan Android Emulator**
1. Install Android Studio
2. Setup Android Emulator
3. Jalankan emulator
4. Di terminal Expo, tekan `a` untuk run di Android

## 🏗️ Langkah 4: Build APK untuk Android

### 4.1 Install EAS CLI
```bash
npm install -g eas-cli
```

### 4.2 Login EAS (jika belum)
```bash
eas login
```

### 4.3 Configure EAS Build
File `eas.json` sudah tersedia. Pastikan konfigurasinya sesuai:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### 4.4 Build APK
```bash
eas build --platform android --profile preview
```

Pilih:
- ✅ Generate new Android Keystore (untuk project baru)
- ⏳ Tunggu proses build selesai (sekitar 10-20 menit)

### 4.5 Download APK
Setelah build selesai:
1. Link download APK akan muncul di terminal
2. Copy link tersebut
3. Buka di browser untuk download
4. Install APK di device Android Anda

**Contoh link:**
```
https://expo.dev/accounts/[username]/projects/smartb/builds/[build-id]
```

## 🌐 Langkah 5: Akses Build di Expo Dashboard

1. Buka [expo.dev](https://expo.dev)
2. Login dengan akun Anda
3. Pilih project "SMARTB 2.0" atau "smartb"
4. Klik tab **"Builds"**
5. Lihat semua build history dan download link

## 📲 Langkah 6: Distribusi APK

### Cara 1: Share Link Langsung
```
https://expo.dev/accounts/[username]/projects/smartb/builds/[build-id]
```
Kirim link ini ke tester untuk download APK.

### Cara 2: QR Code
Expo akan generate QR code untuk setiap build. Scan QR code untuk download.

### Cara 3: Download & Share File
1. Download APK dari Expo
2. Upload ke Google Drive / Dropbox
3. Share link ke tester

## 🔄 Langkah 7: Update & Rebuild

### Jika Ada Perubahan Code:
```bash
# 1. Commit changes
git add .
git commit -m "Update feature XYZ"

# 2. Rebuild APK
eas build --platform android --profile preview

# 3. Share new build link
```

## ⚙️ Konfigurasi Project dengan Akun Pribadi

### Update Owner di app.json
Buka `app.json` dan ubah:
```json
{
  "expo": {
    "owner": "username-expo-anda",
    "slug": "smartb"
  }
}
```

### Verifikasi Konfigurasi
```bash
npx expo config --type public
```

## 🧪 Testing Chatbot

Setelah aplikasi terinstall:
1. Login ke aplikasi
2. Buka menu "Menu Lainnya"
3. Tap "AI Assistant"
4. Test interaksi dengan chatbot

## 🐛 Troubleshooting

### Error: "Unable to resolve module"
```bash
npm install
npx expo start -c
```

### Error: Build Failed
1. Periksa `eas.json` konfigurasi
2. Pastikan semua dependencies terinstall
3. Coba build ulang dengan clean:
   ```bash
   eas build --platform android --profile preview --clear-cache
   ```

### Error: Expo Account Issues
```bash
# Logout dan login ulang
npx expo logout
npx expo login
```

### APK Not Installing
1. Enable "Install from Unknown Sources" di Android
2. Pastikan storage cukup
3. Uninstall versi lama terlebih dahulu

## 📊 Monitoring Build

### Check Build Status
```bash
eas build:list
```

### View Build Logs
```bash
eas build:view [BUILD_ID]
```

## 💡 Tips & Best Practices

1. **Development:**
   - Gunakan `expo start` untuk development cepat
   - Test di device fisik untuk performa akurat

2. **Building:**
   - Build `preview` (APK) untuk testing internal
   - Build `production` (AAB) untuk Google Play Store

3. **Versioning:**
   - Update `version` di `app.json` setiap build baru
   - Update `android.versionCode` untuk setiap release

4. **Testing:**
   - Test semua fitur di APK sebelum distribusi
   - Test di berbagai ukuran screen
   - Test koneksi internet stabil dan tidak stabil

## 📞 Support

Jika mengalami kendala:
1. Cek dokumentasi Expo: [docs.expo.dev](https://docs.expo.dev)
2. Forum Expo: [forums.expo.dev](https://forums.expo.dev)
3. GitHub Issues: Repository project

## 🎯 Checklist Deployment

- [ ] Dependencies terinstall
- [ ] Expo account setup
- [ ] `eas init` selesai
- [ ] Development testing berhasil
- [ ] Build APK berhasil
- [ ] APK terinstall dan berjalan di device
- [ ] Semua fitur berfungsi (termasuk chatbot)
- [ ] Link distribusi tersedia

---

**Selamat!** 🎉 Aplikasi SMARTB Anda siap untuk di-deploy dan digunakan!

**Terakhir diupdate:** November 14, 2025
