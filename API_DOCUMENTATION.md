# 🔌 API Documentation - Vendra CRM

## 📋 Daftar Isi
- [Pengenalan](#pengenalan)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Auth APIs](#auth-apis)
  - [Dashboard APIs](#dashboard-apis)
  - [Import APIs](#import-apis)
  - [Statistics APIs](#statistics-apis)
  - [AI Analytics APIs](#ai-analytics-apis)

## 📖 Pengenalan

Vendra CRM menyediakan RESTful API yang memungkinkan integrasi dengan sistem eksternal. API ini menggunakan JSON format untuk request dan response.

### Fitur API:
- ✅ RESTful design pattern
- ✅ JSON request/response format
- ✅ JWT-based authentication
- ✅ Comprehensive error handling
- ✅ Rate limiting
- ✅ CORS support

## 🔐 Authentication

### Login untuk Mendapatkan Token
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@vendra.com",
    "role": "admin"
  }
}
```

### Menggunakan Token
Sertakan token di header untuk setiap request yang memerlukan autentikasi:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🌐 Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:3010/api
```

## ❌ Error Handling

### Format Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## 🔗 Endpoints

### Auth APIs

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@vendra.com",
    "role": "admin"
  }
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

#### Verify Token
```http
GET /api/auth/verify
Authorization: Bearer {token}
```

### Dashboard APIs

#### Get Dashboard Statistics
```http
GET /api/dashboard/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 1250,
    "totalTransactions": 3420,
    "totalRevenue": 15750000,
    "monthlyGrowth": 12.5,
    "recentTransactions": [
      {
        "id": 1,
        "customer_name": "John Doe",
        "purchase_amount": 150000,
        "purchase_date": "2024-01-15",
        "product_type": "Electronics"
      }
    ]
  }
}
```

#### Get Charts Data
```http
GET /api/dashboard/charts
Authorization: Bearer {token}
```

**Query Parameters:**
- `period` - daily, weekly, monthly (default: daily)
- `days` - number of days (default: 30)

### Import APIs

#### Upload CSV File
```http
POST /api/import/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData:
- file: [CSV file]
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "filename": "transactions_20240115.csv",
    "rowCount": 1000,
    "preview": [
      {
        "customer_name": "John Doe",
        "email": "john@email.com",
        "purchase_amount": 150000
      }
    ]
  }
}
```

#### Get Import History
```http
GET /api/import/history
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Records per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "imports": [
      {
        "id": 1,
        "original_filename": "data.csv",
        "total_rows": 1000,
        "successful_rows": 995,
        "failed_rows": 5,
        "import_date": "2024-01-15T10:30:00Z",
        "status": "completed"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalRecords": 100
    }
  }
}
```

#### Get Import Detail
```http
GET /api/import/detail/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "import_info": {
      "id": 1,
      "original_filename": "data.csv",
      "total_rows": 1000,
      "successful_rows": 995,
      "failed_rows": 5,
      "import_date": "2024-01-15T10:30:00Z"
    },
    "transactions": [
      {
        "id": 1,
        "customer_name": "John Doe",
        "email": "john@email.com",
        "purchase_amount": 150000,
        "purchase_date": "2024-01-15"
      }
    ]
  }
}
```

#### Download Import Report
```http
GET /api/import/report/{id}
Authorization: Bearer {token}
```

**Response:**
- Content-Type: text/csv
- File download dengan data hasil import

### Statistics APIs

#### Get Statistics Overview
```http
GET /api/statistics/overview
Authorization: Bearer {token}
```

**Query Parameters:**
- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)  
- `category` - Product category filter

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 15750000,
      "totalTransactions": 3420,
      "averageOrderValue": 4605,
      "topCategory": "Electronics"
    },
    "trends": {
      "daily": [...],
      "monthly": [...]
    },
    "categories": [
      {
        "category": "Electronics",
        "count": 1200,
        "revenue": 8500000,
        "percentage": 54.0
      }
    ]
  }
}
```

#### Get Top Customers
```http
GET /api/statistics/top-customers
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` - Number of customers (default: 10)
- `period` - Time period filter

#### Get Sales Performance
```http
GET /api/statistics/sales-performance
Authorization: Bearer {token}
```

### AI Analytics APIs

#### Send Chat Message
```http
POST /api/ai/chat
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Analisis penjualan bulan ini",
  "sessionId": "unique_session_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Berdasarkan data penjualan bulan ini...",
    "sessionId": "unique_session_id",
    "suggestions": [
      "Lihat tren penjualan harian",
      "Bandingkan dengan bulan lalu",
      "Analisis per kategori produk"
    ]
  }
}
```

#### Get Chat History
```http
GET /api/ai/chat/history
Authorization: Bearer {token}
```

**Query Parameters:**
- `sessionId` - Session ID
- `limit` - Number of messages

#### Generate Insights
```http
POST /api/ai/insights
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "sales_trend",
  "period": "monthly",
  "category": "Electronics"
}
```

### Transaction APIs

#### Get All Transactions
```http
GET /api/transactions
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` - Page number
- `limit` - Records per page
- `search` - Search query
- `category` - Filter by category
- `startDate` - Start date filter
- `endDate` - End date filter

#### Get Transaction by ID
```http
GET /api/transactions/{id}
Authorization: Bearer {token}
```

#### Create Transaction
```http
POST /api/transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "customer_name": "John Doe",
  "email": "john@email.com",
  "phone": "08123456789",
  "product_type": "Electronics",
  "purchase_amount": 1500000,
  "purchase_date": "2024-01-15",
  "payment_method": "Credit Card",
  "sales_rep": "Sarah"
}
```

#### Update Transaction
```http
PUT /api/transactions/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "customer_name": "John Doe Updated",
  "purchase_amount": 1600000
}
```

#### Delete Transaction
```http
DELETE /api/transactions/{id}
Authorization: Bearer {token}
```

## 📊 Rate Limiting

API menggunakan rate limiting untuk mencegah abuse:

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**:
  - `X-RateLimit-Limit`: Total limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

## 🔍 Filtering dan Search

### Query Parameters untuk Filtering:

```http
GET /api/transactions?search=john&category=Electronics&startDate=2024-01-01&endDate=2024-01-31&page=1&limit=20
```

### Supported Operators:
- `search` - Full text search
- `category` - Exact match
- `startDate` / `endDate` - Date range
- `sort` - Sort field (default: created_at)
- `order` - Sort order (asc/desc, default: desc)

## 📝 Webhook (Coming Soon)

Vendra CRM akan mendukung webhook untuk notifikasi real-time:

- Import completion
- New transaction added
- System alerts
- Custom events

## 🧪 Testing API

### Using cURL:

```bash
# Login
curl -X POST http://localhost:3010/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get Dashboard Stats
curl -X GET http://localhost:3010/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Upload CSV
curl -X POST http://localhost:3010/api/import/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@data.csv"
```

### Using Postman:

1. Import collection dari file `postman_collection.json`
2. Set environment variable untuk base_url dan token
3. Test semua endpoints

## 🚨 Security Best Practices

1. **Selalu gunakan HTTPS** di production
2. **Simpan token dengan aman** (tidak di localStorage)
3. **Implement refresh token** untuk session management
4. **Validate input** sebelum mengirim request
5. **Handle error** dengan proper error handling
6. **Monitor API usage** untuk detect abuse

## 📱 SDK dan Wrapper

### JavaScript/Node.js SDK (Coming Soon)
```javascript
import VendraCRM from 'vendra-crm-sdk';

const crm = new VendraCRM({
  baseUrl: 'http://localhost:3010/api',
  token: 'your_jwt_token'
});

// Get dashboard stats
const stats = await crm.dashboard.getStats();

// Upload CSV
const result = await crm.import.uploadCSV(file);
```

### Python SDK (Planned)
### PHP SDK (Planned)

## 📞 Support

Untuk pertanyaan terkait API:

- **Email**: api-support@vendra-crm.com
- **Documentation**: https://docs.vendra-crm.com
- **GitHub Issues**: https://github.com/Galang0304/vendra/issues

---

**© 2024 Vendra CRM API Documentation**