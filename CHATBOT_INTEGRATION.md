# Integrasi JotForm AI Chatbot - SMARTB Mobile App

## 📋 Overview
Chatbot JotForm AI telah berhasil diintegrasikan ke dalam aplikasi SMARTB menggunakan WebView. Pengguna dapat mengakses AI Assistant melalui menu aplikasi.

## 🎯 Fitur yang Diimplementasikan

### 1. ChatbotScreen Component
**Lokasi:** `src/screens/ChatbotScreen.tsx`

**Fitur:**
- ✅ Embedding JotForm AI Agent menggunakan WebView
- ✅ Loading indicator saat chatbot dimuat
- ✅ Error handling untuk masalah koneksi
- ✅ Responsive design untuk berbagai ukuran layar
- ✅ Third-party cookies enabled untuk JotForm
- ✅ JavaScript dan DOM storage enabled
- ✅ Communication antara WebView dan React Native

**Konfigurasi WebView:**
```typescript
- javaScriptEnabled: true
- domStorageEnabled: true
- thirdPartyCookiesEnabled: true
- mixedContentMode: "always"
- allowFileAccess: true
```

### 2. Route Configuration
**Lokasi:** `app/(protected)/chatbot.tsx`

Route baru telah dibuat untuk mengakses chatbot di:
```
/(protected)/chatbot
```

### 3. Menu Integration
**Lokasi:** `src/screens/OtherMenuScreen.tsx`

Menu baru "AI Assistant" telah ditambahkan dengan:
- Icon: Ionicons `chatbubble-ellipses`
- Warna: `#2D5A4F` (warna brand SMARTB)
- Navigasi otomatis ke ChatbotScreen

## 🚀 Cara Menggunakan

### Untuk Pengguna Akhir:
1. Buka aplikasi SMARTB
2. Login ke akun Anda
3. Navigasi ke halaman "Menu Lainnya"
4. Tap pada menu "AI Assistant"
5. Tunggu chatbot dimuat (akan muncul loading indicator)
6. Mulai berinteraksi dengan AI Assistant

### Untuk Developer:
1. Install dependencies:
   ```bash
   npm install
   ```

2. Jalankan aplikasi:
   ```bash
   npm start
   ```

3. Test di Android:
   ```bash
   npm run android
   ```

4. Test di iOS:
   ```bash
   npm run ios
   ```

## 🔧 Konfigurasi JotForm AI

**Embed Script:**
```html
<script src='https://cdn.jotfor.ms/agent/embedjs/019a39cd4ebf787eb91665b20832550a3ab6/embed.js'></script>
```

**Agent ID:** `019a39cd4ebf787eb91665b20832550a3ab6`

## 📱 Kompatibilitas

- ✅ Android (Tested)
- ✅ iOS (Requires testing)
- ⚠️ Web (Membutuhkan browser yang support third-party cookies)

## 🛠️ Troubleshooting

### Chatbot tidak muncul
1. Pastikan koneksi internet stabil
2. Clear cache aplikasi
3. Restart aplikasi
4. Periksa apakah JotForm Agent masih aktif

### Loading terlalu lama
1. Periksa kecepatan internet
2. Reload halaman dengan pull-to-refresh (jika diimplementasikan)
3. Restart aplikasi

### Error Permission
Pastikan di `app.json` permissions sudah benar:
```json
{
  "android": {
    "permissions": [
      "android.permission.INTERNET"
    ]
  }
}
```

## 🔄 Update Chatbot

Jika Anda perlu mengupdate chatbot atau mengganti Agent ID:

1. Buka `src/screens/ChatbotScreen.tsx`
2. Cari baris dengan embed script:
   ```javascript
   <script src='https://cdn.jotfor.ms/agent/embedjs/[AGENT_ID]/embed.js'></script>
   ```
3. Ganti `[AGENT_ID]` dengan ID baru
4. Save dan rebuild aplikasi

## 📊 Monitoring & Analytics

Untuk memonitor penggunaan chatbot:
1. Login ke JotForm dashboard
2. Navigasi ke AI Agent section
3. Lihat analytics dan conversation logs

## 🔐 Keamanan

- WebView menggunakan HTTPS untuk komunikasi
- Third-party cookies hanya diaktifkan untuk JotForm domain
- Tidak ada data sensitif yang disimpan di local storage chatbot

## 📝 Catatan Penting

1. **Internet Required:** Chatbot memerlukan koneksi internet untuk berfungsi
2. **JotForm Account:** Pastikan akun JotForm aktif dan Agent tidak expired
3. **Performance:** Waktu loading bergantung pada kecepatan internet pengguna
4. **Updates:** Update JotForm AI akan otomatis tercermin tanpa perlu update aplikasi

## 🤝 Support

Jika mengalami masalah dengan integrasi chatbot:
1. Cek JotForm documentation: https://www.jotform.com/help/
2. Verify Agent ID di JotForm dashboard
3. Test di browser web terlebih dahulu sebelum test di mobile

## 📅 Version History

**Version 1.0.0** (Current)
- Initial integration JotForm AI Chatbot
- WebView implementation
- Loading & Error states
- Menu integration

---

**Terakhir diupdate:** November 14, 2025
**Developer:** SMARTB Team
