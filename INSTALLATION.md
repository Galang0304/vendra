# 🛠️ Panduan Instalasi Lengkap Vendra CRM

## 📋 Persyaratan Sistem

### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.15+, atau Linux Ubuntu 18.04+
- **RAM**: 4GB (8GB direkomendasikan)
- **Storage**: 2GB ruang kosong
- **Internet**: Koneksi stabil untuk download dependencies

### Software Requirements
- **Node.js** v14.0.0 atau lebih baru
- **MySQL** v5.7 atau lebih baru (v8.0+ direkomendasikan)
- **Git** untuk version control
- **Text Editor** (VS Code direkomendasikan)

## 🚀 Langkah-langkah Instalasi Detail

### Step 1: Install Prerequisites

#### Install Node.js
1. Kunjungi https://nodejs.org/
2. Download versi LTS (Long Term Support)
3. Jalankan installer dan ikuti wizard instalasi
4. Verify instalasi:
   ```bash
   node --version
   npm --version
   ```

#### Install MySQL
**Windows:**
1. Download MySQL Installer dari https://dev.mysql.com/downloads/installer/
2. Pilih "MySQL Installer for Windows"
3. Jalankan installer, pilih "Developer Default"
4. Set root password yang kuat
5. Catat password ini untuk konfigurasi nanti

**macOS (menggunakan Homebrew):**
```bash
# Install Homebrew jika belum ada
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MySQL
brew install mysql
brew services start mysql

# Setup password
mysql_secure_installation
```

**Linux (Ubuntu/Debian):**
```bash
# Update package list
sudo apt update

# Install MySQL
sudo apt install mysql-server

# Setup MySQL
sudo mysql_secure_installation
```

#### Install Git
- **Windows**: Download dari https://git-scm.com/
- **macOS**: `brew install git`
- **Linux**: `sudo apt install git`

### Step 2: Clone dan Setup Project

#### Clone Repository
```bash
# Clone repository
git clone https://github.com/Galang0304/vendra.git

# Masuk ke direktori
cd vendra

# Cek struktur project
ls -la  # Linux/macOS
dir     # Windows
```

#### Install Dependencies
```bash
# Install semua package yang diperlukan
npm install

# Jika ada error, coba install dengan flag berikut:
npm install --legacy-peer-deps

# Atau clear cache dulu:
npm cache clean --force
npm install
```

### Step 3: Database Setup Detail

#### Buat Database MySQL
```bash
# Login ke MySQL sebagai root
mysql -u root -p

# Masukkan password root yang sudah dibuat
```

Di dalam MySQL console:
```sql
-- Buat database
CREATE DATABASE business_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Buat user khusus untuk aplikasi (opsional tapi direkomendasikan)
CREATE USER 'vendra_user'@'localhost' IDENTIFIED BY 'password_yang_kuat';

-- Berikan hak akses
GRANT ALL PRIVILEGES ON business_crm.* TO 'vendra_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Cek database yang sudah dibuat
SHOW DATABASES;

-- Keluar dari MySQL
EXIT;
```

#### Konfigurasi Environment
```bash
# Copy template environment
copy .env.example .env    # Windows
cp .env.example .env      # Linux/macOS
```

Edit file `.env` dengan editor favorit Anda:
```bash
# Server Configuration
PORT=3010
NODE_ENV=development

# JWT Configuration - GANTI INI!
JWT_SECRET=vendra-crm-super-secret-key-2024-ganti-dengan-random-string

# Database Configuration
DB_HOST=localhost
DB_USER=vendra_user          # atau 'root' jika menggunakan root
DB_PASSWORD=password_yang_kuat
DB_NAME=business_crm

# Email Configuration (untuk fitur notifikasi - opsional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

⚠️ **PENTING**: Untuk JWT_SECRET, gunakan string random yang panjang dan kompleks!

### Step 4: Setup Database Schema

Jalankan script setup database:
```bash
# Setup database dan buat semua tabel
node setup/setup-database.js
```

Jika berhasil, Anda akan melihat output seperti:
```
🔧 Setting up Business CRM Database...
✅ Connected to MySQL database
✅ Users table created
✅ Customer transactions table created
✅ Import history table created
✅ Chat history table created
✅ Default admin user created
✅ Sample data inserted
🎉 Database setup completed successfully!
```

### Step 5: Verifikasi Instalasi

#### Test Koneksi Database
```bash
# Test koneksi dengan script khusus
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();
(async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        console.log('✅ Database connection successful!');
        await connection.end();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
})();
"
```

#### Jalankan Aplikasi
```bash
# Mode production
npm start

# Mode development (dengan auto-reload)
npm run dev
```

Output yang diharapkan:
```
🚀 Server running on port 3010
✅ Database connected successfully
📊 Vendra CRM is ready!
```

#### Test di Browser
1. Buka browser
2. Akses: http://localhost:3010
3. Anda akan melihat halaman login
4. Login dengan:
   ```
   Username: admin
   Password: admin123
   ```

## 🔧 Troubleshooting Instalasi

### Error: "Cannot find module 'mysql2'"
```bash
# Install dependency yang hilang
npm install mysql2 --save
```

### Error: "ER_ACCESS_DENIED_FOR_USER"
- Periksa kembali username dan password di file `.env`
- Pastikan user MySQL memiliki hak akses ke database
- Test koneksi manual ke MySQL

### Error: "Port 3010 is already in use"
```bash
# Windows - cari process yang menggunakan port
netstat -ano | findstr :3010

# Kill process jika perlu
taskkill /PID <process_id> /F

# Atau ganti port di .env
PORT=3011
```

### Error: "ENOENT: no such file or directory"
- Pastikan Anda berada di direktori project yang benar
- Jalankan `npm install` ulang
- Cek struktur folder dengan `ls -la` atau `dir`

### Error: MySQL Connection Timeout
```bash
# Restart MySQL service
# Windows:
net stop mysql
net start mysql

# Linux:
sudo systemctl restart mysql

# macOS:
brew services restart mysql
```

### Error: "bcrypt not found" atau "bcryptjs not found"
```bash
# Install ulang bcrypt
npm uninstall bcrypt bcryptjs
npm install bcryptjs --save
```

## 🎯 Verifikasi Instalasi Berhasil

Setelah semua langkah diikuti, pastikan:

✅ **Database terhubung**: Tidak ada error koneksi saat startup
✅ **Login berhasil**: Bisa login dengan admin/admin123
✅ **Dashboard muncul**: Halaman dashboard terbuka dengan data
✅ **Import data berfungsi**: Bisa upload CSV dan melihat data
✅ **Navigasi lancar**: Semua menu dan halaman bisa diakses

## 🔄 Instalasi Ulang (Jika Diperlukan)

Jika instalasi gagal dan ingin mulai dari awal:

```bash
# Hapus node_modules
rmdir /s node_modules  # Windows
rm -rf node_modules    # Linux/macOS

# Hapus package-lock.json
del package-lock.json  # Windows
rm package-lock.json   # Linux/macOS

# Install ulang
npm install

# Drop dan buat ulang database
mysql -u root -p -e "DROP DATABASE IF EXISTS business_crm; CREATE DATABASE business_crm;"

# Setup ulang database
node setup/setup-database.js
```

## 📞 Bantuan Lebih Lanjut

Jika masih mengalami kesulitan:

1. **Periksa log error** di folder `logs/`
2. **Baca dokumentasi lengkap** di README.md
3. **Buat issue** di GitHub repository
4. **Konsultasi** dengan tim development

---

**Selamat! Vendra CRM siap digunakan! 🎉**