const { getDbPool } = require('./db');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ 
            success: false, 
            message: `Method ${req.method} Not Allowed` 
        });
    }

    const { jobId, jobTitle, fullName, email, phone, whyFit } = req.body;

    // Simple validation
    if (!jobId || !jobTitle || !fullName || !email || !phone || !whyFit) {
        return res.status(400).json({ 
            success: false, 
            message: 'All fields are required. Please check your submission.' 
        });
    }

    try {
        const dbPool = await getDbPool();
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

        console.log(`New application received via Serverless! ID: ${result.insertId}, Candidate: ${fullName}`);

        return res.status(201).json({
            success: true,
            message: 'Application submitted successfully! Our team will reach back to you shortly.',
            applicationId: result.insertId
        });
    } catch (err) {
        console.error('Error saving application to database:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'A database error occurred. Please try again later.' 
        });
    }
};
