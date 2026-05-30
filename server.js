const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from the current directory
app.use(express.static(__dirname));

let dbPool;

// Initialize Database connection and tables
async function initDatabase() {
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
        console.log(`Checking if database "${dbName}" exists...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.end();

        // Step 2: Create a connection pool for the specific database
        dbPool = mysql.createPool({
            ...config,
            database: dbName,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        console.log(`Connected to database "${dbName}" successfully!`);

        // Step 3: Create the applications table if it doesn't exist
        const createTableQuery = `
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
        
        await dbPool.query(createTableQuery);
        console.log('Verified database table "applications" exists.');

        // Step 4: Create the donations table if it doesn't exist
        const createDonationsTableQuery = `
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
        await dbPool.query(createDonationsTableQuery);
        console.log('Verified database table "donations" exists.');

    } catch (err) {
        console.error('Error during database initialization:', err);
        process.exit(1);
    }
}

// Route to handle job applications
app.post('/api/apply', async (req, res) => {
    const { jobId, jobTitle, fullName, email, phone, whyFit } = req.body;

    // Simple validation
    if (!jobId || !jobTitle || !fullName || !email || !phone || !whyFit) {
        return res.status(400).json({ 
            success: false, 
            message: 'All fields are required. Please check your submission.' 
        });
    }

    try {
        const insertQuery = `
            INSERT INTO applications (job_id, job_title, full_name, email, phone, why_fit)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await dbPool.query(insertQuery, [
            jobId, 
            jobTitle, 
            fullName, 
            email, 
            phone, 
            whyFit
        ]);

        console.log(`New application received! ID: ${result.insertId}, Candidate: ${fullName}`);

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully! Our team will reach back to you shortly.',
            applicationId: result.insertId
        });
    } catch (err) {
        console.error('Error saving application to database:', err);
        res.status(500).json({ 
            success: false, 
            message: 'A database error occurred. Please try again later.' 
        });
    }
});

// Route to get Paystack public key config
app.get('/api/config', (req, res) => {
    res.json({
        paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || ''
    });
});

// Route to record successful donations
app.post('/api/donations', async (req, res) => {
    const { fullName, email, amount, reference, status } = req.body;

    // Simple validation
    if (!fullName || !email || !amount || !reference || !status) {
        return res.status(400).json({
            success: false,
            message: 'All fields (fullName, email, amount, reference, status) are required.'
        });
    }

    try {
        const insertQuery = `
            INSERT INTO donations (full_name, email, amount, reference, status)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const [result] = await dbPool.query(insertQuery, [
            fullName,
            email,
            amount,
            reference,
            status
        ]);

        console.log(`New donation recorded! ID: ${result.insertId}, Amount: NGN ${amount}, Donor: ${fullName}`);

        res.status(201).json({
            success: true,
            message: 'Donation recorded successfully!',
            donationId: result.insertId
        });
    } catch (err) {
        console.error('Error saving donation to database:', err);
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'This donation reference has already been recorded.'
            });
        }
        res.status(500).json({
            success: false,
            message: 'A database error occurred. Please try again later.'
        });
    }
});

// Serve frontend for all other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server after initializing database
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
});
