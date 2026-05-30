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

    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: parseInt(process.env.DB_PORT || '3306')
    };

    try {
        // Step 1: Connect to MySQL server without a database to create it if it doesn't exist
        const connection = await mysql.createConnection(config);
        const dbName = process.env.DB_NAME || 'womenproject';
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.end();

        // Step 2: Create pool
        pool = mysql.createPool({
            ...config,
            database: dbName,
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
