# 📊 Vendra CRM - Sistem Manajemen Hubungan Pelanggan

![CRM Dashboard](https://img.shields.io/badge/Version-2.0.0-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-14%2B-blue)
![MySQL](https://img.shields.io/badge/Database-MySQL-orange)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎯 Tentang Vendra CRM

**Vendra CRM** adalah sistem manajemen hubungan pelanggan (Customer Relationship Management) modern yang dirancang khusus untuk membantu bisnis dalam mengelola data pelanggan, transaksi, dan analitik bisnis secara efisien. Sistem ini dilengkapi dengan dashboard interaktif, sistem import data, dan fitur analitik berbasis AI.

### ✨ Fitur Utama

- 📈 **Dashboard Analytics** - Visualisasi data real-time dengan grafik dan statistik
- 📊 **Manajemen Transaksi** - Import dan kelola data transaksi pelanggan
- 🤖 **AI Analytics** - Analisis data menggunakan teknologi AI
- 📁 **Import Data CSV** - Upload data dari file CSV dengan template khusus
- 👥 **Manajemen User** - Sistem autentikasi dan otorisasi multi-level
- 📱 **Responsive Design** - Tampilan yang optimal di desktop dan mobile
- 📋 **Riwayat Import** - Tracking semua aktivitas import data
- 📊 **Laporan Statistik** - Berbagai jenis laporan bisnis

## 🛠️ Teknologi yang Digunakan

### Backend
- **Node.js** v14+ - Runtime JavaScript
- **Express.js** - Web framework
- **MySQL** - Database utama
- **JWT** - Autentikasi dan otorisasi
- **Multer** - Upload file handling
- **CSV Parser** - Parsing file CSV
- **Axios** - HTTP client untuk API calls

### Frontend
- **HTML5** - Struktur halaman
- **CSS3** - Styling dan layout responsive
- **JavaScript (Vanilla)** - Interaksi UI
- **Chart.js** - Visualisasi data dan grafik

### Utilitas
- **Winston** - Logging system
- **Moment.js** - Manipulasi tanggal
- **UUID** - Generator ID unik
- **Bcrypt** - Password hashing

## 📋 Prasyarat Sistem

Sebelum menjalankan aplikasi, pastikan komputer Anda sudah terinstall:

- **Node.js** versi 14.0.0 atau lebih baru
- **MySQL** versi 5.7 atau lebih baru
- **Git** untuk clone repository
- **Text Editor** (VS Code direkomendasikan)

### Cek Versi yang Terinstall

```bash
# Cek versi Node.js
node --version

# Cek versi npm
npm --version

# Cek versi MySQL
mysql --version
```

## 🚀 Cara Instalasi dan Setup

### 1. Clone Repository

```bash
# Clone repository dari GitHub
git clone https://github.com/Galang0304/vendra.git

# Masuk ke direktori project
cd vendra
```

### 2. Install Dependencies

```bash
# Install semua package yang diperlukan
npm install
```

### 3. Setup Database MySQL

#### A. Buat Database Baru

Login ke MySQL dan buat database:

```sql
# Login ke MySQL
mysql -u root -p

# Buat database baru
CREATE DATABASE business_crm;

# Gunakan database
USE business_crm;

# Keluar dari MySQL
EXIT;
```

#### B. Konfigurasi Environment

Buat file `.env` dari template:

```bash
# Copy file environment template
cp .env.example .env
```

Edit file `.env` sesuai konfigurasi Anda:

```bash
# Server Configuration
PORT=3010
NODE_ENV=development

# JWT Configuration - GANTI DENGAN SECRET KEY ANDA
JWT_SECRET=vendra-crm-secret-key-2024-change-this

# Database Configuration MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password_mysql_anda
DB_NAME=business_crm

# Email Configuration (Opsional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=email@anda.com
EMAIL_PASS=password_email_anda
```

⚠️ **PENTING**: Ganti `JWT_SECRET` dan `DB_PASSWORD` dengan nilai yang sesuai!

### 4. Setup Database dan Tabel

Jalankan script setup database:

```bash
# Setup database dan buat semua tabel
node setup/setup-database.js
```

Script ini akan:
- Membuat semua tabel yang diperlukan
- Membuat user admin default
- Mengisi data sample (opsional)

### 5. Jalankan Aplikasi

```bash
# Jalankan dalam mode development
npm run dev

# ATAU jalankan dalam mode production
npm start
```

### 6. Akses Aplikasi

Buka browser dan akses:
```
http://localhost:3010
```

## 👤 Login Default

Setelah setup database selesai, gunakan akun default berikut:

```
Username: admin
Password: admin123
```

⚠️ **PENTING**: Segera ganti password default setelah login pertama!

## 📁 Struktur Project

```
vendra/
├── 📄 app.js                 # File utama aplikasi
├── 📄 package.json           # Dependencies dan scripts
├── 📄 .env                   # Konfigurasi environment
├── 📁 public/                # File static (CSS, JS, HTML)
│   ├── 📁 assets/
│   │   ├── 📁 css/           # File styling
│   │   ├── 📁 js/            # JavaScript frontend
│   │   └── 📁 img/           # Gambar dan icon
│   └── 📁 views/             # Template HTML
├── 📁 src/                   # Source code backend
│   ├── 📁 controllers/       # Logic bisnis
│   ├── 📁 middleware/        # Middleware Express
│   ├── 📁 models/            # Model database
│   ├── 📁 routes/            # Route definitions
│   └── 📁 utils/             # Utility functions
├── 📁 setup/                 # Script setup database
├── 📁 logs/                  # File log aplikasi
└── 📁 uploads/               # Upload file sementara
```

## 🔧 Konfigurasi Penting

### Database Schema

Aplikasi menggunakan beberapa tabel utama:

1. **users** - Data pengguna sistem
2. **customer_transactions** - Data transaksi pelanggan
3. **import_history** - Riwayat import data
4. **chat_history** - Riwayat chat AI (opsional)

### Format File CSV Import

Untuk import data transaksi, gunakan format CSV berikut:

```csv
customer_name,email,phone,product_type,purchase_amount,purchase_date,payment_method,sales_rep
John Doe,john@email.com,08123456789,Electronics,1500000,2024-01-15,Credit Card,Sarah
Jane Smith,jane@email.com,08198765432,Clothing,750000,2024-01-16,Cash,Mike
```

Template CSV bisa didownload dari menu Import Data di aplikasi.

## 📊 Cara Penggunaan

### 1. Dashboard Utama

- **Statistik Real-time**: Lihat total pelanggan, transaksi, dan revenue
- **Grafik Analytics**: Visualisasi tren penjualan dan performa
- **Quick Actions**: Akses cepat ke fitur utama

### 2. Import Data

1. Siapkan file CSV sesuai format template
2. Buka menu "Import Data"
3. Upload file CSV
4. Review data preview
5. Konfirmasi import
6. Lihat hasil di dashboard

### 3. Analytics dan Laporan

- **Statistics Page**: Analisis mendalam data bisnis
- **AI Analytics**: Insights otomatis menggunakan AI
- **Export Reports**: Download laporan dalam format CSV

### 4. Manajemen User

- Tambah user baru dengan role berbeda
- Atur permission akses
- Monitor aktivitas user

## 🎯 Mode Development

Untuk development, gunakan mode watch:

```bash
# Install nodemon jika belum ada
npm install -g nodemon

# Jalankan dalam mode development
npm run dev
```

Mode ini akan restart otomatis saat ada perubahan code.

## 📝 Script Maintenance

```bash
# Bersihkan chat history
npm run clean-chat

# Backup and clean chat history
npm run backup-clean-chat

# Reset database (hati-hati!)
npm run reset-db
```

## 🐛 Troubleshooting

### Error: Database Connection Failed

```bash
# Cek status MySQL
# Windows:
net start mysql

# Pastikan kredensial database benar di file .env
# Pastikan database 'business_crm' sudah dibuat
```

### Error: Port Already in Use

```bash
# Cek process yang menggunakan port 3010
netstat -ano | findstr :3010

# Kill process jika perlu
taskkill /PID <process_id> /F

# Atau ganti port di .env
PORT=3011
```

### Error: Module Not Found

```bash
# Hapus node_modules dan install ulang
rmdir /s node_modules
npm install
```

### Error: Permission Denied

```bash
# Jalankan sebagai administrator di Windows
# Atau install dependencies secara global
npm install -g nodemon
```

## 🔒 Keamanan

### Rekomendasi Keamanan

1. **Ganti JWT Secret**: Selalu gunakan secret key yang strong
2. **Update Password**: Ganti password default admin
3. **Database Security**: Gunakan user database khusus, bukan root
4. **HTTPS**: Gunakan SSL certificate di production
5. **Environment Variables**: Jangan commit file `.env` ke repository

### Konfigurasi Production

```bash
# Set environment ke production
NODE_ENV=production

# Gunakan PM2 untuk process management
npm install -g pm2
pm2 start app.js --name "vendra-crm"
pm2 startup
pm2 save
```

## 📊 Performance Optimization

### Database Optimization

```sql
-- Index untuk performa query
CREATE INDEX idx_customer_name ON customer_transactions(customer_name);
CREATE INDEX idx_purchase_date ON customer_transactions(purchase_date);
CREATE INDEX idx_product_type ON customer_transactions(product_type);
```

### Caching Strategy

- Implementasi Redis untuk session caching
- Cache query results untuk data yang sering diakses
- Optimize image loading dengan lazy loading

## 🤝 Kontribusi

Jika Anda ingin berkontribusi:

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/amazing-feature`)
3. Commit perubahan (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📞 Support & Bantuan

Jika mengalami masalah atau butuh bantuan:

1. **Dokumentasi**: Baca dokumentasi lengkap ini
2. **Issues**: Buat issue di GitHub repository
3. **Email**: Hubungi tim development
4. **Chat**: Gunakan fitur AI chat di aplikasi

## 📄 Lisensi

Project ini menggunakan lisensi MIT. Lihat file `LICENSE` untuk detail lengkap.

## 🎉 Changelog

### Version 2.0.0 (Current)
- ✅ Dashboard analytics dengan grafik real-time
- ✅ Import data CSV dengan preview
- ✅ AI analytics integration
- ✅ Mobile responsive design
- ✅ Advanced logging system
- ✅ Multi-user authentication

### Version 1.0.0
- ✅ Basic CRUD operations
- ✅ User authentication
- ✅ Simple dashboard

## 🙏 Acknowledgments

Terima kasih kepada:
- Tim development Vendra CRM
- Community open source
- Semua kontributor dan tester

---

## 📋 Quick Start Checklist

- [ ] Install Node.js dan MySQL
- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Setup file `.env`
- [ ] Setup database (`node setup/setup-database.js`)
- [ ] Jalankan aplikasi (`npm start`)
- [ ] Akses http://localhost:3010
- [ ] Login dengan admin/admin123
- [ ] Ganti password default
- [ ] Import data sample
- [ ] Explore dashboard dan fitur

---

**© 2024 Vendra CRM. All rights reserved.**

Dibuat dengan ❤️ untuk membantu bisnis berkembang lebih baik.
