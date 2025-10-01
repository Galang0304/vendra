# 🚀 SETUP MUDAH UNTUK CLIENT - Vendra CRM

## ⚡ Quick Setup (5 Menit)

Panduan ini sudah termasuk database dengan data sample yang siap pakai!

### Step 1: Install Prerequisites

#### Download dan Install:
1. **XAMPP** - https://www.apachefriends.org/download.html
2. **Node.js LTS** - https://nodejs.org/

### Step 2: Setup XAMPP
1. Install XAMPP
2. Start **Apache** dan **MySQL** di XAMPP Control Panel
3. Buka http://localhost/phpmyadmin

### Step 3: Import Database
1. Di phpMyAdmin, klik **"New"** untuk buat database baru
2. Nama database: **`business_crm`**
3. Klik **"Import"** tab
4. Pilih file **`business_crm_with_data.sql`** (yang saya berikan)
5. Klik **"Go"** untuk import

### Step 4: Setup Project
```bash
# Clone repository
git clone https://github.com/Galang0304/vendra.git
cd vendra

# Install dependencies
npm install

# Copy file environment yang sudah dikonfigurasi
copy .env.client .env     # Windows
cp .env.client .env       # Mac/Linux
```

### Step 5: Jalankan Aplikasi
```bash
npm start
```

### Step 6: Login
- Buka: http://localhost:3010
- Username: **admin**
- Password: **admin123**

## ✅ Yang Sudah Dikonfigurasi Untuk Anda:

### 🗄️ Database:
- ✅ Database `business_crm` sudah dibuat
- ✅ Semua tabel sudah ada
- ✅ User admin sudah dibuat (admin/admin123)
- ✅ Data sample 1000+ transaksi sudah ada
- ✅ 8 kategori produk siap pakai

### ⚙️ Konfigurasi:
- ✅ File `.env` sudah disesuaikan dengan XAMPP
- ✅ JWT Secret sudah dikonfigurasi
- ✅ Gemini AI API sudah aktif
- ✅ Upload limit sudah diset

### 📊 Data Sample:
- ✅ 1000+ customer transactions
- ✅ 8 kategori produk: Electronics, Clothing, Home & Garden, Sports, Health & Beauty, Books, Automotive, Food & Beverage
- ✅ Data tahun 2024 lengkap untuk testing
- ✅ Multiple payment methods
- ✅ Sales rep data

## 🎯 Setelah Setup:

### Dashboard akan menampilkan:
- Total Customers: ~800 pelanggan
- Total Transactions: ~1000+ transaksi  
- Total Revenue: ~500 juta rupiah
- Grafik analytics siap pakai

### Fitur yang bisa langsung dicoba:
- ✅ Dashboard analytics dengan grafik
- ✅ Import data CSV (template sudah tersedia)
- ✅ Statistics & reports
- ✅ AI Analytics chat
- ✅ Export data

## 🔧 Jika Ada Masalah:

### Error Database Connection:
1. Pastikan XAMPP MySQL running
2. Cek apakah database `business_crm` sudah ada
3. Pastikan file `.env` sesuai dengan `.env.client`

### Error Port 3010:
```bash
# Ganti port di .env jika bentrok
PORT=3011
```

### Error Module Not Found:
```bash
# Install ulang dependencies
npm install
```

## 📞 Support:
Jika ada masalah, hubungi developer atau baca dokumentasi lengkap di:
- README.md
- INSTALLATION.md  
- USER_GUIDE.md

---

**🎉 Selamat! Vendra CRM siap digunakan!**

Akses: **http://localhost:3010**
Login: **admin / admin123**