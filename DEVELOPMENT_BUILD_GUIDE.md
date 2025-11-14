# 🔧 Panduan Development Build & Hot Reload

## 📋 Apa itu Development Build?

Development Build adalah APK khusus yang memungkinkan Anda:
- ✅ **Install APK sekali** di device Android
- ✅ **Auto-reload** setiap kali ubah kode
- ✅ **Hot reload** & fast refresh seperti di Expo Go
- ✅ **Debug** dengan React DevTools
- ✅ **Tidak perlu rebuild APK** untuk perubahan JavaScript/React

---

## 🚀 Metode 1: Development Build (Recommended)

### **Use Case:**
- Development & testing fitur baru
- Debugging dengan device fisik
- Team collaboration (share 1 APK, semua bisa development)

### **Langkah-langkah:**

#### 1️⃣ Build Development APK (Sekali Saja)

```powershell
# Build development APK
eas build --profile development --platform android
```

**Output:**
- Link download APK development
- APK size: ~50-80 MB (lebih besar dari production)
- Nama: `smartb-development.apk`

#### 2️⃣ Install APK di Device Android

```powershell
# Download APK dari link
# Install di device Android Anda
# Enable "Install from Unknown Sources" jika diminta
```

#### 3️⃣ Jalankan Development Server

```powershell
# Start Expo development server dengan dev client
npx expo start --dev-client
```

**Atau menggunakan npm script:**
```powershell
npm start
```

#### 4️⃣ Connect App ke Development Server

**Di Terminal:**
```
┌──────────────────────────────────────────┐
│                                          │
│   Waiting on exp://192.168.1.100:8081   │
│                                          │
│   [QR Code akan muncul di sini]          │
│                                          │
│   › Press a │ open Android                │
│   › Press r │ reload app                  │
│   › Press m │ toggle menu                 │
│                                          │
└──────────────────────────────────────────┘
```

**Di Device:**
1. Buka app **SMARTB** (development build yang sudah terinstall)
2. Scan QR code dari terminal
3. App akan connect dan load kode dari komputer Anda

#### 5️⃣ Development Workflow

**Sekarang Anda bisa:**
```powershell
# 1. Edit kode (misal: src/screens/ChatbotScreen.tsx)
# 2. Save file (Ctrl+S)
# 3. App AUTO-RELOAD di device! ✨
```

**Shortcut di Terminal:**
- `r` - Reload app manually
- `m` - Toggle developer menu
- `j` - Open debugger

---

## 🔄 Metode 2: EAS Update (For Preview/Production)

### **Use Case:**
- Update app yang sudah di-deploy
- Push hotfix tanpa rebuild
- A/B testing fitur baru

### **Setup (Sekali Saja):**

#### 1️⃣ Install EAS Update Package

```powershell
npx expo install expo-updates
```

#### 2️⃣ Verify app.json Configuration

File `app.json` sudah dikonfigurasi dengan:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "b9223e25-0742-480b-b550-eaf2d6931b25"
      }
    }
  }
}
```

#### 3️⃣ Build APK dengan Update Support

```powershell
# Build preview APK dengan update channel
eas build --profile preview --platform android
```

### **Push Update (Setiap Kali Ubah Kode):**

```powershell
# Setelah ubah kode, push update
eas update --branch preview --message "Update chatbot UI"
```

**Output:**
```
✔ Exported bundle
✔ Published bundle
✔ Update published

Branch: preview
Runtime version: exposdk:53.0.0
Platform: android, ios
Message: Update chatbot UI
```

### **App Auto-Update:**

1. User membuka app
2. App check for updates
3. Download update di background
4. Restart app → update applied! ✨

**Timeline:**
- Check update: Saat app dibuka
- Download: Background (1-5 detik)
- Apply: Saat restart app

---

## 📊 Comparison: Development vs EAS Update

| Fitur | Development Build | EAS Update |
|-------|-------------------|------------|
| **Install APK** | Sekali | Sekali |
| **Reload Speed** | Instant (WiFi) | 1-5 detik (download) |
| **Hot Reload** | ✅ Yes | ❌ No |
| **Fast Refresh** | ✅ Yes | ❌ No |
| **Debugging** | ✅ Full | ⚠️ Limited |
| **Internet Required** | ✅ Yes (LAN/WiFi) | ✅ Yes |
| **Native Code Changes** | ❌ Need rebuild | ❌ Need rebuild |
| **JS/React Changes** | ✅ Auto-reload | ✅ Auto-update |
| **Use Case** | Active development | Testing/Production |

---

## 🎯 Recommended Workflow

### **Untuk Development (Kode Sering Berubah):**

```powershell
# 1. Build development APK (sekali)
eas build --profile development --platform android

# 2. Install APK di device

# 3. Start dev server (setiap kali coding)
npx expo start --dev-client

# 4. Edit kode → Auto-reload! ✨
```

### **Untuk Testing (Preview/Production):**

```powershell
# 1. Build preview APK (jarang)
eas build --profile preview --platform android

# 2. Install APK di device

# 3. Update kode (sering)
eas update --branch preview --message "Fix bug X"

# 4. App auto-update di device
```

---

## 🔧 Troubleshooting

### **Development Build tidak Connect:**

```powershell
# 1. Pastikan device & komputer di WiFi yang sama
# 2. Check firewall (allow port 8081)
# 3. Restart dev server
npx expo start --dev-client --clear

# 4. Di app: Shake device → "Settings" → Enter URL manually
# URL: exp://[IP-KOMPUTER-ANDA]:8081
```

### **EAS Update tidak Apply:**

```powershell
# 1. Check runtime version match
eas update:list --branch preview

# 2. Force check update di app
# Shake device → "Check for updates"

# 3. Clear cache
npx expo start --clear

# 4. Rebuild jika ada native changes
eas build --profile preview --platform android
```

### **Changes tidak Muncul:**

```bash
# 1. Reload manual (di terminal tekan 'r')
# 2. Clear Metro bundler cache
npx expo start --clear

# 3. Rebuild development APK
eas build --profile development --platform android --clear-cache
```

---

## 📱 Device Setup

### **Enable Developer Options:**

1. Settings → About Phone
2. Tap "Build Number" 7x
3. Developer Options → Enable "USB Debugging"

### **Network Setup:**

```powershell
# Check your computer IP
ipconfig

# Look for "IPv4 Address" (misal: 192.168.1.100)
# Pastikan device connect ke WiFi yang sama
```

---

## 💡 Tips & Best Practices

### **Development:**
1. ✅ Gunakan WiFi yang stabil (bukan mobile hotspot)
2. ✅ Keep terminal tetap running saat development
3. ✅ Enable Fast Refresh di app settings
4. ✅ Use React DevTools untuk debugging

### **EAS Update:**
1. ✅ Test di development dulu sebelum push update
2. ✅ Tulis message yang jelas untuk setiap update
3. ✅ Check runtime version compatibility
4. ✅ Rollback jika ada issue: `eas update --branch preview --message "Rollback"`

### **Performance:**
1. ⚡ LAN/WiFi lebih cepat dari mobile data
2. ⚡ Development build lebih lambat dari production
3. ⚡ EAS Update size kecil (hanya JS bundle ~2-5 MB)

---

## 🎓 Advanced: Multiple Channels

Untuk testing berbeda-beda environment:

```powershell
# Development channel (unstable, frequent updates)
eas update --branch development --message "New feature X"

# Preview channel (stable, for testers)
eas update --branch preview --message "Beta release v1.1"

# Production channel (very stable, for users)
eas update --branch production --message "Release v1.0"
```

**Di app.json:**
```json
{
  "updates": {
    "url": "https://u.expo.dev/[project-id]",
    "fallbackToCacheTimeout": 0,
    "checkOnLaunch": "always"
  }
}
```

---

## 📚 Resources

- **Expo Dev Client:** https://docs.expo.dev/develop/development-builds/introduction/
- **EAS Update:** https://docs.expo.dev/eas-update/introduction/
- **Debugging:** https://docs.expo.dev/debugging/tools/

---

## ✅ Quick Commands Cheat Sheet

```powershell
# === DEVELOPMENT BUILD ===
# Build dev APK (sekali)
eas build --profile development --platform android

# Start dev server (setiap kali coding)
npx expo start --dev-client

# Clear cache & restart
npx expo start --dev-client --clear


# === EAS UPDATE ===
# Push update to preview
eas update --branch preview --message "Your message"

# List all updates
eas update:list --branch preview

# Rollback update
eas update --branch preview --message "Rollback to previous"


# === BUILD PRODUCTION ===
# Build production APK
eas build --profile production --platform android

# Build preview APK
eas build --profile preview --platform android


# === UTILITIES ===
# Check build status
eas build:list

# View project info
eas project:info

# Clear all caches
npx expo start --clear
```

---

**Selamat Development! 🎉** Sekarang Anda bisa coding dengan live reload!

**Terakhir diupdate:** November 14, 2025
