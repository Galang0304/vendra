# 🚀 Deployment Guide - Vendra CRM

## 📋 Pilihan Deployment

Vendra CRM dapat di-deploy di berbagai platform:

1. **VPS/Dedicated Server** (Ubuntu/CentOS)
2. **Cloud Platform** (AWS, Google Cloud, Azure)
3. **Shared Hosting** (cPanel dengan Node.js support)
4. **Container** (Docker)
5. **Platform-as-a-Service** (Heroku, Railway, Vercel)

## 🖥️ VPS/Dedicated Server Deployment

### Prerequisites
- Ubuntu 20.04+ atau CentOS 8+
- Root atau sudo access
- Domain name (opsional)
- SSL certificate (direkomendasikan)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install Nginx (reverse proxy)
sudo apt install nginx -y

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Git
sudo apt install git -y
```

### Step 2: Clone dan Setup Project

```bash
# Create user untuk aplikasi
sudo adduser vendra
sudo usermod -aG sudo vendra
sudo su - vendra

# Clone repository
git clone https://github.com/Galang0304/vendra.git
cd vendra

# Install dependencies
npm install --production

# Setup environment
cp .env.example .env
nano .env
```

### Step 3: Database Setup

```bash
# Login ke MySQL
sudo mysql -u root -p

# Buat database dan user
CREATE DATABASE business_crm;
CREATE USER 'vendra'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON business_crm.* TO 'vendra'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Setup database schema
node setup/setup-database.js
```

### Step 4: Konfigurasi Production

Edit file `.env`:
```bash
# Production configuration
NODE_ENV=production
PORT=3010

# Database
DB_HOST=localhost
DB_USER=vendra
DB_PASSWORD=strong_password
DB_NAME=business_crm

# Security
JWT_SECRET=your-super-secure-jwt-secret-production-key
```

### Step 5: PM2 Configuration

Buat file `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'vendra-crm',
    script: 'app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3010
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true
  }]
};
```

Start aplikasi dengan PM2:
```bash
# Start application
pm2 start ecosystem.config.js --env production

# Setup PM2 startup script
pm2 startup
pm2 save

# Monitor aplikasi
pm2 status
pm2 logs vendra-crm
```

### Step 6: Nginx Configuration

Buat file `/etc/nginx/sites-available/vendra-crm`:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /assets/ {
        alias /home/vendra/vendra/public/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/vendra-crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 7: SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

## ☁️ Cloud Platform Deployment

### AWS EC2 Deployment

#### 1. Launch EC2 Instance
- **AMI**: Ubuntu Server 20.04 LTS
- **Instance Type**: t3.small (minimum)
- **Security Group**: Allow HTTP (80), HTTPS (443), SSH (22)

#### 2. Setup sama seperti VPS deployment di atas

#### 3. RDS untuk Database (Opsional)
```bash
# Jika menggunakan RDS, update .env:
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=your-rds-password
DB_NAME=business_crm
```

### Google Cloud Platform

#### 1. Compute Engine Setup
```bash
# Create instance
gcloud compute instances create vendra-crm \
    --image-family=ubuntu-2004-lts \
    --image-project=ubuntu-os-cloud \
    --machine-type=e2-small \
    --zone=asia-southeast1-a

# SSH to instance
gcloud compute ssh vendra-crm --zone=asia-southeast1-a
```

#### 2. Follow VPS deployment steps

### Azure App Service

#### 1. Create App Service
```bash
# Create resource group
az group create --name vendra-crm-rg --location "Southeast Asia"

# Create app service plan
az appservice plan create --name vendra-plan --resource-group vendra-crm-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group vendra-crm-rg --plan vendra-plan --name vendra-crm --runtime "NODE|18-lts"
```

#### 2. Deploy dari GitHub
```bash
# Configure deployment
az webapp deployment source config --name vendra-crm --resource-group vendra-crm-rg \
    --repo-url https://github.com/Galang0304/vendra --branch main --manual-integration
```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3010

USER node

CMD ["node", "app.js"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3010:3010"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_USER=vendra
      - DB_PASSWORD=password
      - DB_NAME=business_crm
    depends_on:
      - mysql
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: business_crm
      MYSQL_USER: vendra
      MYSQL_PASSWORD: password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./setup/create-database.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  mysql_data:
```

### Deploy dengan Docker
```bash
# Build dan start
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

## 🌐 Platform-as-a-Service Deployment

### Heroku Deployment

#### 1. Prepare Project
```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create vendra-crm-production

# Add MySQL addon
heroku addons:create cleardb:ignite -a vendra-crm-production

# Get database URL
heroku config -a vendra-crm-production
```

#### 2. Configure Environment
```bash
# Set environment variables
heroku config:set NODE_ENV=production -a vendra-crm-production
heroku config:set JWT_SECRET=your-super-secure-secret -a vendra-crm-production

# Set database config dari ClearDB URL
heroku config:set DB_HOST=your-cleardb-host -a vendra-crm-production
heroku config:set DB_USER=your-cleardb-user -a vendra-crm-production
heroku config:set DB_PASSWORD=your-cleardb-password -a vendra-crm-production
heroku config:set DB_NAME=your-cleardb-database -a vendra-crm-production
```

#### 3. Deploy
```bash
# Deploy
git push heroku main

# Setup database
heroku run node setup/setup-database.js -a vendra-crm-production

# Open app
heroku open -a vendra-crm-production
```

### Railway Deployment

#### 1. Connect Repository
- Login ke railway.app
- Connect GitHub repository
- Deploy automatically

#### 2. Environment Variables
Set di Railway dashboard:
```
NODE_ENV=production
JWT_SECRET=your-secure-secret
DB_HOST=railway-mysql-host
DB_USER=root
DB_PASSWORD=generated-password
DB_NAME=railway
```

### Vercel Deployment

⚠️ **Note**: Vercel cocok untuk frontend, tapi untuk full-stack app dengan database, lebih baik gunakan platform lain.

## 🔧 Production Optimizations

### 1. Performance Tuning

#### Node.js Optimizations
```bash
# Increase memory limit
export NODE_OPTIONS="--max-old-space-size=2048"

# Enable production optimizations
export NODE_ENV=production
```

#### PM2 Optimizations
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'vendra-crm',
    script: 'app.js',
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
```

### 2. Database Optimizations

```sql
-- Add indexes untuk performa
CREATE INDEX idx_customer_name ON customer_transactions(customer_name);
CREATE INDEX idx_purchase_date ON customer_transactions(purchase_date);
CREATE INDEX idx_product_type ON customer_transactions(product_type);
CREATE INDEX idx_import_id ON customer_transactions(import_id);

-- Optimize MySQL configuration
-- Edit /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
innodb_buffer_pool_size = 1G
query_cache_size = 128M
max_connections = 200
```

### 3. Security Hardening

#### Firewall Setup
```bash
# UFW (Ubuntu)
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw deny 3010  # Block direct access to app port
```

#### Application Security
```javascript
// app.js - Add security middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);
```

### 4. Monitoring dan Logging

#### Log Rotation
```bash
# Install logrotate
sudo apt install logrotate

# Create logrotate config
sudo nano /etc/logrotate.d/vendra-crm
```

```
/home/vendra/vendra/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

#### Monitoring dengan PM2
```bash
# Install PM2 monitoring
pm2 install pm2-server-monit

# Real-time monitoring
pm2 monit
```

## 🔄 Backup dan Recovery

### 1. Database Backup

```bash
# Create backup script
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/vendra/backups"
DB_NAME="business_crm"

mkdir -p $BACKUP_DIR

mysqldump -u vendra -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql"
```

### 2. Automated Backup
```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /home/vendra/backup.sh
```

### 3. Recovery
```bash
# Restore from backup
mysql -u vendra -p business_crm < /home/vendra/backups/backup_20240115_020000.sql
```

## 📊 Performance Monitoring

### 1. Application Monitoring

#### New Relic (Recommended)
```bash
# Install New Relic agent
npm install newrelic --save

# Add to app.js (first line)
require('newrelic');
```

#### Custom Health Check
```javascript
// Add to app.js
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

### 2. Server Monitoring

```bash
# Install htop
sudo apt install htop

# Monitor resources
htop

# Check disk usage
df -h

# Check memory usage
free -h
```

## 🚨 Troubleshooting Production

### Common Issues

#### 1. Application Won't Start
```bash
# Check PM2 logs
pm2 logs vendra-crm

# Check system logs
sudo journalctl -u nginx
sudo journalctl -f
```

#### 2. Database Connection Issues
```bash
# Test database connection
mysql -u vendra -p -h localhost business_crm

# Check MySQL status
sudo systemctl status mysql
```

#### 3. High Memory Usage
```bash
# Restart application
pm2 restart vendra-crm

# Check memory usage
pm2 monit
```

#### 4. SSL Certificate Issues
```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

## 📞 Production Support

### Monitoring Checklist
- [ ] Application status (PM2)
- [ ] Database connectivity
- [ ] SSL certificate validity
- [ ] Disk space usage
- [ ] Memory usage
- [ ] Log files rotation
- [ ] Backup verification

### Emergency Contacts
- **System Admin**: admin@your-company.com
- **Database Admin**: dba@your-company.com
- **DevOps Team**: devops@your-company.com

---

**🎉 Deployment Completed Successfully!**

Your Vendra CRM is now running in production. Monitor the application regularly and keep backups updated.