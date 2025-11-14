# 🤖 Deskripsi Tampilan AI Assistant (JotForm Chatbot)

## 📱 Alur Pengguna & Tampilan Visual

### 1️⃣ **Dashboard - Floating Chatbot Button**

**Lokasi:** Dashboard Utama (Halaman setelah login)

**Tampilan:**
```
┌─────────────────────────────────────┐
│  Selamat datang kembali             │
│  [Nama User]            [ICON]      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Hari X                 │   │
│  │  Pengobatan Fase Intensif   │   │
│  │                             │   │
│  │      XXX Poin               │   │
│  │      Streak: X hari         │   │
│  │                             │   │
│  │    [Gambar Pohon]           │   │
│  │                             │   │
│  │  [Input Data Hari Ini]      │   │
│  │  [Menu Lainnya]             │   │
│  └─────────────────────────────┘   │
│                                     │
│                          ┌────┐     │  ← Floating Chatbot
│                          │ 🤖 │     │     (chatbot.png)
│                          └────┘     │     Bottom-right
│                          ┌────┐     │     Above calendar
│                          │ 📅 │     │  ← Calendar Button
│                          └────┘     │
└─────────────────────────────────────┘
```

**Deskripsi:**
- **Posisi Chatbot Button:** 
  - Bottom-right corner
  - Di atas tombol kalender
  - Jarak dari bawah: ~96px (bottom-24)
  - Jarak dari kanan: 24px (right-6)
- **Icon:** `chatbot.png` ukuran 40x40 pixel
- **Button Style:**
  - Bentuk: Lingkaran (rounded-full)
  - Ukuran: 64x64 pixel
  - Background: `#2D5A4F` (hijau SMARTB)
  - Shadow: Elevated dengan shadow yang lebih besar dari calendar
- **Animation:** Smooth shadow animation on press

---

### 2️⃣ **Pop-up Chatbot - Saat Tombol Diklik**

**Animasi Muncul:**
```
Step 1: Background gelap muncul (fade in)
┌─────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← Overlay hitam 50%
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │     transparan
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────────────┘

Step 2: Panel slide up dari bawah (spring animation)
┌─────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ┌─────────────────────────────────┐ │
│ │ 🤖  AI Assistant SMARTB    ✕   │ │  ← Header
│ │─────────────────────────────────│ │
│ │                                 │ │
│ │   [Chatbot Content Area]        │ │  ← WebView
│ │                                 │ │
│ │                                 │ │
└─┴─────────────────────────────────┴─┘
```

**Tampilan Pop-up Penuh:**
```
┌─────────────────────────────────────┐
│ ░░░░░░ (Tap to close) ░░░░░░░░░░░░░ │  ← 15% layar (transparent)
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ ┌───────────────────────────┐ X ┃ │  ← Header hijau
│ ┃ │ 🤖  AI Assistant SMARTB   │   ┃ │
│ ┃ └───────────────────────────┘   ┃ │
│ ┃─────────────────────────────────┃ │
│ ┃                                 ┃ │
│ ┃  👋 Halo! Saya AI Assistant     ┃ │
│ ┃  SMARTB. Bagaimana saya bisa    ┃ │
│ ┃  membantu Anda hari ini?        ┃ │
│ ┃                                 ┃ │  ← 85% layar
│ ┃  [Suggested Questions]          ┃ │     (WebView)
│ ┃  ┌─────────────────────────┐   ┃ │
│ ┃  │ 📋 Apa itu TB?          │   ┃ │
│ ┃  └─────────────────────────┘   ┃ │
│ ┃  ┌─────────────────────────┐   ┃ │
│ ┃  │ 💊 Cara minum obat TB   │   ┃ │
│ ┃  └─────────────────────────┘   ┃ │
│ ┃  ┌─────────────────────────┐   ┃ │
│ ┃  │ 🩺 Gejala TB            │   ┃ │
│ ┃  └─────────────────────────┘   ┃ │
│ ┃                                 ┃ │
│ ┃  ┌───────────────────────────┐ ┃ │
│ ┃  │ Ketik pertanyaan...   [→] │ ┃ │
│ ┃  └───────────────────────────┘ ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└─────────────────────────────────────┘
```

**Spesifikasi Pop-up:**
- **Tinggi:** 85% dari tinggi layar (SCREEN_HEIGHT * 0.85)
- **Border Radius:** 20px di sudut atas (rounded top corners)
- **Background:** Putih (#fff)
- **Animation:** Spring animation dengan friction: 8
- **Close Options:**
  1. Tap tombol ✕ di header
  2. Tap area gelap di atas panel
  3. Gesture swipe down (native Android back)

**Header Pop-up:**
- **Background:** `#2D5A4F` (hijau SMARTB)
- **Tinggi:** ~52px
- **Content:**
  - Icon chatbot.png (32x32) + Text "AI Assistant SMARTB"
  - Close button (Ionicons "close", 28px)
- **Text Color:** White (#fff)
- **Font:** Bold, 18px

---

### 3️⃣ **Loading State - Inside Pop-up**

**Saat chatbot sedang dimuat di dalam panel:**
```
┌─────────────────────────────────────┐
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ 🤖  AI Assistant SMARTB      ✕  ┃ │
│ ┃─────────────────────────────────┃ │
│ ┃                                 ┃ │
│ ┃                                 ┃ │
│ ┃            ⚙ ⟳                 ┃ │
│ ┃       (Loading Spinner)         ┃ │
│ ┃                                 ┃ │
│ ┃    Memuat AI Assistant...       ┃ │
│ ┃                                 ┃ │
│ ┃                                 ┃ │
│ ┃                                 ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└─────────────────────────────────────┘
```

**Deskripsi:**
- Overlay loading di atas WebView
- Background: `#f5f5f5`
- Spinner color: `#2D5A4F`
- Durasi: 1-3 detik
- Auto-hide setelah WebView loaded

---

### 4️⃣ **Chatbot Active - Inside Pop-up**

---

### 5️⃣ **Contoh Interaksi Chat - Inside Pop-up**

**Setelah user bertanya:**
```
┌─────────────────────────────────────┐
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ 🤖  AI Assistant SMARTB      ✕  ┃ │
│ ┃─────────────────────────────────┃ │
│ ┃                                 ┃ │
│ ┃  👋 Halo! Saya AI Assistant...  ┃ │
│ ┃  (pesan awal dari AI)           ┃ │
│ ┃                                 ┃ │
│ ┃              ┌─────────────────┐┃ │
│ ┃              │ Apa itu TB?     │┃ │
│ ┃              │ (14:30)         │┃ │
│ ┃              └─────────────────┘┃ │
│ ┃                                 ┃ │
│ ┃  🤖 TB (Tuberkulosis) adalah    ┃ │
│ ┃  penyakit menular yang          ┃ │
│ ┃  disebabkan oleh bakteri        ┃ │
│ ┃  Mycobacterium tuberculosis.    ┃ │
│ ┃  Penyakit ini umumnya           ┃ │
│ ┃  menyerang paru-paru...         ┃ │
│ ┃  (14:30)                        ┃ │
│ ┃                                 ┃ │
│ ┃  Apakah Anda ingin tahu lebih   ┃ │
│ ┃  lanjut tentang:                ┃ │
│ ┃  ┌──────────────┐               ┃ │
│ ┃  │ Gejala TB    │               ┃ │
│ ┃  └──────────────┘               ┃ │
│ ┃  ┌──────────────┐               ┃ │
│ ┃  │ Pengobatan TB│               ┃ │
│ ┃  └──────────────┘               ┃ │
│ ┃                                 ┃ │
│ ┃  ┌───────────────────────────┐ ┃ │
│ ┃  │ Ketik pertanyaan...   [→] │ ┃ │
│ ┃  └───────────────────────────┘ ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└─────────────────────────────────────┘
```

**Karakteristik:**
- **User message:** 
  - Posisi kanan
  - Background biru/hijau
  - Timestamp
- **AI message:** 
  - Posisi kiri
  - Background abu-abu terang
  - Icon bot
  - Timestamp
- **Follow-up options:** Quick reply buttons
- **Smooth scrolling:** Auto-scroll ke pesan terbaru
- **Full-screen chat:** Maksimal 85% tinggi layar

---

### 6️⃣ **Menutup Chatbot**

**Cara 1: Tap tombol Close (✕)**
```
Animation: Panel slide down → Background fade out
Duration: 300ms smooth
```

**Cara 2: Tap area gelap di atas**
```
┌─────────────────────────────────────┐
│ ░░░░ TAP HERE TO CLOSE ░░░░░░░░░░░░ │  ← Tap area ini
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ 🤖  AI Assistant SMARTB      ✕  ┃ │
│ ┃─────────────────────────────────┃ │
│ ┃         [Chat Content]          ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└─────────────────────────────────────┘
```

**Cara 3: Android Back Button**
```
Native back gesture akan menutup modal
```

---

### 7️⃣ **Kembali ke Dashboard**

**Setelah chatbot ditutup:**
```
┌─────────────────────────────────────┐
│  Dashboard kembali normal           │
│                                     │
│  [Content dashboard...]             │
│                                     │
│                          ┌────┐     │
│                          │ 🤖 │     │  ← Tombol tetap ada
│                          └────┘     │     Bisa dibuka lagi
│                          ┌────┐     │
│                          │ 📅 │     │
│                          └────┘     │
└─────────────────────────────────────┘
```

**Behavior:**
- Chat history di-reset saat ditutup
- Koneksi WebView tetap fresh setiap dibuka
- Smooth transition kembali ke dashboard

---

## 🎨 Design Specifications

### Floating Button (Chatbot)
- **Shape:** Circle (rounded-full)
- **Size:** 56x56 pixel (sama dengan calendar button)
- **Padding:** p-4 (16px)
- **Icon:** chatbot.png (24x24 pixel, rounded-full)
- **Icon Border Radius:** 12px (perfect circle)
- **Background:** `#2D5A4F`
- **Position:**
  - Bottom: 96px (bottom-24)
  - Right: 24px (right-6)
- **Shadow:**
  - shadowColor: #000
  - shadowOpacity: 0.25
  - shadowRadius: 3.84
  - elevation: 5

### Floating Button (Calendar)
- **Shape:** Circle (rounded-full)
- **Size:** 56x56 pixel
- **Padding:** p-4 (16px)
- **Icon:** Ionicons calendar (24x24 pixel)
- **Background:** `#2D5A4F`
- **Position:**
  - Bottom: 24px (bottom-6)
  - Right: 24px (right-6)
- **Shadow:** Standard elevation 5

### Modal Overlay
- **Background:** `rgba(0, 0, 0, 0.5)` (50% black)
- **Tap to close:** Enabled
- **Animation:** Fade in 200ms

### Pop-up Panel
- **Height:** 85% screen height
- **Width:** 100% screen width
- **Background:** White (#fff)
- **Border Radius:** 20px (top corners only)
- **Animation:** 
  - Type: Spring
  - Friction: 8
  - Duration: ~400ms
  - From: Bottom (translateY: SCREEN_HEIGHT)
  - To: Visible (translateY: 0)

### Header (Pop-up)
- **Height:** ~52px
- **Background:** `#2D5A4F`
- **Padding:** 16px horizontal, 12px vertical
- **Border Radius:** 20px (top corners)
- **Content:**
  - Icon: chatbot.png (32x32)
  - Text: "AI Assistant SMARTB"
  - Font: Bold, 18px, White
  - Close button: 28px

### WebView Area
- **Height:** Panel height - Header height
- **Background:** Transparent
- **JavaScript:** Enabled
- **DOM Storage:** Enabled
- **Third-party Cookies:** Enabled
- **Scrolling:** Smooth vertical scroll

---

## 📊 Technical Behavior

### Performance
- **Initial Load:** 1-3 detik (tergantung internet)
- **Message Send:** Instant
- **AI Response:** 2-5 detik (tergantung kompleksitas)
- **Scroll Performance:** 60 FPS smooth

### Network Requirements
- **Required:** Active internet connection
- **Minimum:** 3G connection
- **Recommended:** 4G/WiFi for best experience

### Offline Behavior
- Jika tidak ada internet saat buka chatbot: Error state
- Jika koneksi terputus saat chat: Error di WebView
- Tidak ada offline caching untuk chat history

---

## 🔄 User Flow Summary

```
┌──────────────┐
│   Login      │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Dashboard  │ ← Langsung terlihat floating button
│              │   🤖 (chatbot) di atas 📅 (calendar)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Tap Chatbot  │ ← User tap tombol 🤖
│    Button    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Background   │ ← Overlay hitam 50% muncul
│  Overlay     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Panel Slide  │ ← Pop-up muncul dari bawah
│     Up       │   dengan spring animation
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Loading    │ ← WebView loading (1-3 detik)
│   Spinner    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Chatbot    │ ← JotForm AI Interface aktif
│   Active     │   Full interactive chat
└──────┬───────┘
       │
       ├──→ Chat dengan AI
       ├──→ Scroll history
       ├──→ Quick replies
       │
       ▼
┌──────────────┐
│ Close Modal  │ ← Tap ✕, area gelap, atau back
│              │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Back to      │ ← Kembali ke dashboard
│  Dashboard   │   Tombol 🤖 tetap ada
└──────────────┘
```

---

## 💡 Tips untuk User Experience

### Do's ✅
- Pastikan internet stabil sebelum membuka chatbot
- Gunakan pertanyaan yang jelas dan spesifik
- Manfaatkan quick reply buttons
- Scroll untuk melihat context sebelumnya

### Don'ts ❌
- Jangan refresh berulang kali saat loading
- Jangan keluar app saat chat penting (history bisa hilang)
- Jangan kirim pesan terlalu panjang (break into smaller messages)

---

**Catatan:** Tampilan JotForm AI dapat berbeda-beda tergantung konfigurasi agent di dashboard JotForm. Deskripsi di atas adalah tampilan default/umum.

**Terakhir diupdate:** November 14, 2025
