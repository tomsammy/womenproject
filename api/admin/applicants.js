const { getDbPool } = require('../db');

module.exports = async (req, res) => {
    // Only allow GET requests
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ 
            success: false, 
            message: `Method ${req.method} Not Allowed` 
        });
    }

    // Authenticate the request using custom Authorization header
    const authHeader = req.headers.authorization;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (!authHeader || authHeader !== adminPassword) {
        return res.status(401).json({ 
            success: false, 
            message: 'Unauthorized. Invalid or missing credentials.' 
        });
    }

    try {
        const dbPool = await getDbPool();
        // Fetch all applications sorted by date
        const [rows] = await dbPool.query('SELECT * FROM applications ORDER BY applied_at DESC');

        return res.status(200).json({
            success: true,
            data: rows
        });
    } catch (err) {
        console.error('Error fetching applications for admin:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'A database error occurred. Please try again later.' 
        });
    }
};
