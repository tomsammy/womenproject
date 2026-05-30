const { getDbPool } = require('./db');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ 
            success: false, 
            message: `Method ${req.method} Not Allowed` 
        });
    }

    const { fullName, email, amount, reference, status } = req.body;

    // Simple validation
    if (!fullName || !email || !amount || !reference || !status) {
        return res.status(400).json({
            success: false,
            message: 'All fields (fullName, email, amount, reference, status) are required.'
        });
    }

    try {
        const dbPool = await getDbPool();
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

        console.log(`New donation recorded via Serverless! ID: ${result.insertId}, Amount: NGN ${amount}, Donor: ${fullName}`);

        return res.status(201).json({
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
        return res.status(500).json({
            success: false,
            message: 'A database error occurred. Please try again later.'
        });
    }
};
