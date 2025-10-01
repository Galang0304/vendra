const { pool } = require('./src/utils/database');
const bcrypt = require('bcryptjs');

async function checkUser() {
    try {
        console.log('🔍 Checking users in database...');
        
        // Check if users exist
        const [users] = await pool.execute('SELECT * FROM users');
        console.log('Users found:', users.length);
        
        if (users.length > 0) {
            console.log('User details:');
            users.forEach(user => {
                console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
            });
            
            // Test password for admin user
            const adminUser = users.find(u => u.username === 'admin');
            if (adminUser) {
                console.log('\n🔐 Testing admin password...');
                const isValid = await bcrypt.compare('admin123', adminUser.password);
                console.log('Password valid:', isValid);
                
                if (!isValid) {
                    console.log('❌ Password mismatch! Creating new admin user...');
                    
                    // Delete old admin and create new one
                    await pool.execute('DELETE FROM users WHERE username = ?', ['admin']);
                    
                    const hashedPassword = await bcrypt.hash('admin123', 10);
                    await pool.execute(`
                        INSERT INTO users (username, email, password, full_name, role, phone) 
                        VALUES (?, ?, ?, ?, ?, ?)
                    `, ['admin', 'admin@businesscrm.com', hashedPassword, 'System Administrator', 'admin', '+62-812-3456-7890']);
                    
                    console.log('✅ New admin user created successfully!');
                }
            }
        } else {
            console.log('❌ No users found! Creating admin user...');
            
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await pool.execute(`
                INSERT INTO users (username, email, password, full_name, role, phone) 
                VALUES (?, ?, ?, ?, ?, ?)
            `, ['admin', 'admin@businesscrm.com', hashedPassword, 'System Administrator', 'admin', '+62-812-3456-7890']);
            
            console.log('✅ Admin user created successfully!');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit(0);
    }
}

checkUser();
