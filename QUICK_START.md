# 🚀 QUICK START - SMARTB Mobile App

## ⚡ Commands Cepat

### Setup Pertama Kali
```bash
# 1. Install dependencies
npm install

# 2. Login Expo
npx expo login

# 3. Initialize project
npx eas init
```

### Development & Testing
```bash
# Jalankan development server
npm start

# Test di Android (setelah expo start)
# Tekan 'a' di terminal atau scan QR code dengan Expo Go
```

### Build APK
```bash
# Build APK untuk testing
eas build --platform android --profile preview

# Build AAB untuk Google Play Store
eas build --platform android --profile production
```

## 📁 File Penting

| File | Deskripsi |
|------|-----------|
| `app.json` | Konfigurasi app (nama, version, permissions) |
| `eas.json` | Konfigurasi build EAS |
| `package.json` | Dependencies & scripts |
| `.env` | Environment variables (jangan di-commit!) |
| `src/screens/ChatbotScreen.tsx` | Implementasi JotForm AI Chatbot |
| `app/(protected)/chatbot.tsx` | Route untuk chatbot |

## 🔗 Link Penting

- **Expo Dashboard:** https://expo.dev
- **Expo Documentation:** https://docs.expo.dev
- **JotForm AI:** https://www.jotform.com/ai-agent/
- **Build History:** https://expo.dev/accounts/[username]/projects/smartb/builds

## 🎯 Akses Chatbot di App

1. Login ke aplikasi
2. Tap "Menu Lainnya" 
3. Tap "AI Assistant" (icon chat bubble)
4. Chatbot JotForm AI siap digunakan ✅

## 🔧 Update Chatbot Agent

**File:** `src/screens/ChatbotScreen.tsx`

Cari dan ubah:
```javascript
<script src='https://cdn.jotfor.ms/agent/embedjs/[AGENT_ID]/embed.js'></script>
```

Current Agent ID: `019a39cd4ebf787eb91665b20832550a3ab6`

## 📱 Distribusi APK

### Setelah Build Selesai:
1. Copy link dari terminal
2. Buka link di browser
3. Download APK
4. Share link atau file APK

### Link Format:
```
https://expo.dev/accounts/[username]/projects/smartb/builds/[build-id]
```

## ⚠️ Troubleshooting Cepat

| Masalah | Solusi |
|---------|--------|
| Module not found | `npm install` |
| Cache issues | `npx expo start -c` |
| Build failed | `eas build --clear-cache` |
| Login issues | `npx expo logout` → `npx expo login` |
| Chatbot tidak muncul | Cek koneksi internet & restart app |

## 📊 Check Status

```bash
# Lihat build list
eas build:list

# Lihat device list
eas device:list

# Lihat project info
npx expo config
```

## 🔄 Workflow Update

```bash
# 1. Buat perubahan code
# 2. Test locally
npm start

# 3. Commit changes
git add .
git commit -m "Your message"

# 4. Build new APK
eas build --platform android --profile preview

# 5. Share new build link
```

## 📝 Catatan Penting

- ✅ Internet diperlukan untuk chatbot
- ✅ Expo Go hanya untuk development
- ✅ APK untuk testing & distribusi
- ✅ AAB untuk Google Play Store
- ✅ Update `version` di app.json setiap build

## 🎨 Branding SMARTB

- Primary Color: `#2D5A4F`
- Background: `#f1f8f5`
- Font: Kollektif

---

**Need Help?** Cek `DEPLOYMENT_GUIDE.md` untuk panduan lengkap!
