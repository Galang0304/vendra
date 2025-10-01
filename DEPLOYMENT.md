# Vendra CRM - Deployment Guide

## 🚀 Deployment Options

### 1. **Vercel Deployment** (Recommended for Node.js apps)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Environment Variables to set in Vercel:**
- `DB_HOST` - Your MySQL database host
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name (business_crm)
- `DB_PORT` - Database port (3306)
- `JWT_SECRET` - Your JWT secret key
- `GEMINI_API_KEY` - Your Google Gemini API key

### 2. **Netlify Deployment**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=public
```

### 3. **Docker Deployment**

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t vendra-crm .
docker run -p 3020:3020 vendra-crm
```

### 4. **Heroku Deployment**

```bash
# Install Heroku CLI and login
heroku login

# Create Heroku app
heroku create vendra-crm-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DB_HOST=your-db-host
heroku config:set DB_USER=your-db-user
heroku config:set DB_PASSWORD=your-db-password
heroku config:set DB_NAME=business_crm
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set GEMINI_API_KEY=your-gemini-key

# Deploy
git push heroku main
```

### 5. **Railway Deployment**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## 🗄️ Database Setup for Production

### Option 1: Cloud MySQL (Recommended)
- **PlanetScale** - Serverless MySQL platform
- **AWS RDS** - Amazon's managed MySQL
- **Google Cloud SQL** - Google's managed MySQL
- **DigitalOcean Managed Database** - Affordable managed MySQL

### Option 2: Free Database Options
- **Aiven** - Free MySQL tier
- **FreeSQLDatabase** - Free MySQL hosting
- **db4free.net** - Free MySQL database

## 🔧 Environment Variables

Create these environment variables in your deployment platform:

```env
# Database Configuration
DB_HOST=your-production-db-host
DB_USER=your-db-username
DB_PASSWORD=your-secure-db-password
DB_NAME=business_crm
DB_PORT=3306

# Server Configuration
PORT=3020
NODE_ENV=production

# Security
JWT_SECRET=your-super-secure-jwt-secret-key

# AI Integration
GEMINI_API_KEY=your-google-gemini-api-key

# File Uploads
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

## 📋 Pre-Deployment Checklist

- [ ] Database created and accessible
- [ ] Environment variables configured
- [ ] Google Gemini API key obtained
- [ ] JWT secret generated
- [ ] Domain name configured (optional)
- [ ] SSL certificate setup (automatic on most platforms)

## 🔒 Security Considerations

1. **Never commit .env files** - Use .env.example as template
2. **Use strong JWT secrets** - Generate random 64-character strings
3. **Enable HTTPS** - Most platforms provide this automatically
4. **Secure database** - Use strong passwords and restrict access
5. **API rate limiting** - Configure appropriate limits

## 📊 Database Migration

If deploying with a new database:

```bash
# Run database setup
node setup/setup-chat-history.js

# Import sample data (optional)
mysql -u username -p database_name < setup/sample-data.sql
```

## 🌐 Custom Domain Setup

Most platforms support custom domains:

1. **Vercel**: Add domain in dashboard → Settings → Domains
2. **Netlify**: Site settings → Domain management
3. **Heroku**: Settings → Domains and certificates

## 📈 Monitoring & Logs

- **Vercel**: Built-in analytics and logs
- **Netlify**: Function logs and analytics
- **Heroku**: `heroku logs --tail`
- **Docker**: `docker logs container-name`

## 🚨 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check DB_HOST, DB_USER, DB_PASSWORD
   - Ensure database server allows external connections
   - Verify firewall settings

2. **AI Features Not Working**
   - Verify GEMINI_API_KEY is set correctly
   - Check API key permissions in Google AI Studio
   - Ensure API quotas are not exceeded

3. **File Upload Issues**
   - Check UPLOAD_DIR permissions
   - Verify MAX_FILE_SIZE setting
   - Ensure disk space available

4. **Port Issues**
   - Use PORT environment variable from platform
   - Don't hardcode port numbers

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review application logs
3. Verify environment variables
4. Test database connectivity

---

**Choose the deployment option that best fits your needs and budget!**
