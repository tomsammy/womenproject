const mysql = require('mysql2/promise');

let pool;
let verified = false;

async function getDbPool() {
    if (pool) {
        if (!verified) {
            await verifyTables(pool);
        }
        return pool;
    }

    const dbName = process.env.DB_NAME || 'womenproject';
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: parseInt(process.env.DB_PORT || '3306'),
        database: dbName
    };

    try {
        // Step 1: Only attempt to create database if running on localhost (e.g. local XAMPP)
        if (config.host === 'localhost' || config.host === '127.0.0.1') {
            try {
                const connection = await mysql.createConnection({
                    host: config.host,
                    user: config.user,
                    password: config.password,
                    port: config.port
                });
                await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
                await connection.end();
            } catch (err) {
                console.log('Local database auto-creation skipped:', err.message);
            }
        }

        // Step 2: Connect directly using the pool
        pool = mysql.createPool({
            ...config,
            waitForConnections: true,
            connectionLimit: 5,
            queueLimit: 0
        });

        await verifyTables(pool);
        return pool;
    } catch (err) {
        console.error('Failed to initialize database connection:', err);
        throw err;
    }
}

async function verifyTables(dbPool) {
    try {
        const createApplicationsQuery = `
            CREATE TABLE IF NOT EXISTS applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                job_id INT NOT NULL,
                job_title VARCHAR(255) NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50) NOT NULL,
                why_fit TEXT NOT NULL,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        await dbPool.query(createApplicationsQuery);

        const createDonationsQuery = `
            CREATE TABLE IF NOT EXISTS donations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                reference VARCHAR(255) NOT NULL UNIQUE,
                status VARCHAR(50) NOT NULL,
                donated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        await dbPool.query(createDonationsQuery);
        verified = true;
        console.log("Database tables verified successfully.");
    } catch (err) {
        console.error("Error verifying database tables:", err);
    }
}

module.exports = { getDbPool };
