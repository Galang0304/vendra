#!/bin/bash

echo "===================================="
echo "   VENDRA CRM - AUTO SETUP CLIENT"
echo "===================================="
echo

echo "[1] Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo
echo "[2] Copying environment configuration..."
if [ -f .env.client ]; then
    cp .env.client .env
    echo "SUCCESS: Environment file configured"
else
    echo "ERROR: .env.client not found"
    exit 1
fi

echo
echo "[3] Testing database connection..."
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();
(async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME
        });
        console.log('SUCCESS: Database connected successfully');
        await connection.end();
    } catch (error) {
        console.log('ERROR: Database connection failed - ' + error.message);
        console.log('SOLUTION: Make sure MySQL is running and database is imported');
    }
})();
"

echo
echo "[4] Starting Vendra CRM..."
echo
echo "===================================="
echo "   SETUP COMPLETED!"
echo "===================================="
echo
echo "Your Vendra CRM will start at:"
echo "http://localhost:3010"
echo
echo "Login credentials:"
echo "Username: admin"
echo "Password: admin123"
echo
echo "Press Enter to start the application..."
read

echo
echo "Starting application..."
npm start