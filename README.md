# Vendra CRM - Business Customer Relationship Management System

🚀 **Modern CRM System with AI Analytics powered by Google Gemini**

## ✨ Features

### 📊 **Core CRM Features**
- **Customer Management** - Complete customer database with profiles
- **Transaction Tracking** - Sales and transaction history
- **Product Management** - Product catalog and inventory
- **Statistics & Analytics** - Business insights and reporting
- **Data Import/Export** - CSV import and export functionality

### 🤖 **AI-Powered Analytics**
- **Google Gemini Integration** - Advanced AI assistant for business insights
- **Real-time Chat** - Interactive AI conversations about your business data
- **Chat History** - ChatGPT-like conversation persistence
- **Data-Driven Responses** - AI analyzes real CRM data for insights
- **Bahasa Indonesia Support** - Native Indonesian language responses

### 📱 **Modern UI/UX**
- **Responsive Design** - Mobile-first approach
- **Bootstrap 5** - Modern and clean interface
- **Mobile Navigation** - Touch-friendly burger menu
- **Real-time Updates** - Live data synchronization
- **Professional Theme** - Business-ready design

## 🛠️ **Technology Stack**

### **Backend**
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MySQL** - Database
- **Google Gemini API** - AI integration
- **JWT** - Authentication
- **Multer** - File uploads

### **Frontend**
- **HTML5/CSS3** - Modern web standards
- **Bootstrap 5** - UI framework
- **Vanilla JavaScript** - No framework dependencies
- **Chart.js** - Data visualization
- **Font Awesome** - Icons

### **Database**
- **MySQL** - Relational database
- **Structured Schema** - Normalized data design
- **Foreign Keys** - Data integrity
- **Indexes** - Optimized queries

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js (v14+)
- MySQL (v8+)
- Google Gemini API Key

### **Installation**

1. **Clone Repository**
```bash
git clone https://github.com/Galang0304/vendra.git
cd vendra
```

2. **Install Dependencies**
```bash
npm install
```

3. **Database Setup**
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE business_crm;"

# Import schema
mysql -u root -p business_crm < setup/database-setup.sql

# Setup chat history
node setup/setup-chat-history.js
```

4. **Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=business_crm
GEMINI_API_KEY=your_gemini_api_key
```

5. **Start Application**
```bash
npm start
```

6. **Access Application**
- Open browser: `http://localhost:3010`
- Login: `admin` / `admin123`

## 📁 **Project Structure**

```
vendra/
├── public/                 # Static files
│   ├── assets/            # CSS, JS, images
│   ├── views/             # HTML pages
│   └── components/        # Reusable components
├── src/                   # Source code
│   ├── controllers/       # Business logic
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── utils/            # Utility functions
├── setup/                # Database setup scripts
├── uploads/              # File uploads
├── app.js               # Main application
├── package.json         # Dependencies
└── README.md           # This file
```

## 🔑 **Key Features**

### **AI Analytics Dashboard**
- Real-time business insights
- Interactive AI chat interface
- Data-driven recommendations
- Performance metrics visualization

### **Customer Management**
- Complete customer profiles
- Transaction history tracking
- Customer segmentation
- Communication logs

### **Business Intelligence**
- Sales analytics
- Revenue tracking
- Product performance
- Customer insights
- Trend analysis

### **Mobile-First Design**
- Responsive across all devices
- Touch-optimized interface
- Mobile navigation menu
- Optimized performance

## 🤖 **AI Integration**

### **Google Gemini Features**
- Natural language processing
- Business data analysis
- Intelligent recommendations
- Multi-language support (Indonesian)
- Context-aware responses

### **Chat System**
- Persistent conversation history
- Real-time responses
- Formatted message display
- Error handling and retry logic
- API usage monitoring

## 📊 **Database Schema**

### **Core Tables**
- `customers` - Customer information
- `products` - Product catalog
- `transactions` - Sales transactions
- `users` - System users

### **AI Features**
- `chat_sessions` - Conversation sessions
- `chat_messages` - Message history
- `api_usage` - Usage tracking

## 🔧 **Configuration**

### **Environment Variables**
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=business_crm
DB_PORT=3306

# AI Configuration
GEMINI_API_KEY=your_api_key_here

# Server Configuration
PORT=3010
NODE_ENV=production
```

### **API Keys Setup**
1. Get Gemini API key from [Google AI Studio](https://aistudio.google.com/)
2. Add to `.env` file
3. Test connection via `/api/ai/usage` endpoint

## 📱 **Mobile Support**

- **iOS Safari** - Full compatibility
- **Android Chrome** - Optimized performance
- **Touch Navigation** - Gesture-friendly interface
- **Responsive Layout** - Adapts to all screen sizes

## 🔒 **Security Features**

- **JWT Authentication** - Secure user sessions
- **Input Validation** - SQL injection prevention
- **CORS Protection** - Cross-origin security
- **Error Handling** - Secure error responses
- **API Rate Limiting** - Abuse prevention

## 📈 **Performance**

- **Optimized Queries** - Fast database operations
- **Caching Strategy** - Improved response times
- **Minified Assets** - Reduced load times
- **Lazy Loading** - On-demand resource loading

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 **Author**

**Galang** - [GitHub](https://github.com/Galang0304)

## 🙏 **Acknowledgments**

- Google Gemini AI for intelligent analytics
- Bootstrap team for UI framework
- MySQL for reliable database
- Node.js community for excellent ecosystem

---

**Built with ❤️ for modern businesses**
