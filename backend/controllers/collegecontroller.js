const pool = require('../config/db');

// Get all colleges
const getAll = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM colleges'); // ✅ Correct table name
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching colleges:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get college by ID
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM colleges WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'College not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching college by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Filter colleges by scholarship (Fix: Ensure Boolean Query)
const getByScholarship = async (req, res) => {
    try {
        const { scholarship } = req.query; // Expecting "true" or "false" as query param
        const isScholarship = scholarship === 'true'; // Convert to boolean
        const result = await pool.query('SELECT * FROM colleges WHERE has_scholarship = $1', [isScholarship]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error filtering colleges by scholarship:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getAll,
    getById,
    getByScholarship
};
