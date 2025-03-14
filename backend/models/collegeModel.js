const pool = require('../config/db');

// Get all colleges
const getAllColleges = async () => {
  const query = 'SELECT * FROM colleges';
  const result = await pool.query(query);
  return result.rows;
};

// Get college by ID
const getCollegeById = async (id) => {
  const query = 'SELECT * FROM colleges WHERE id = $1';
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Get colleges that offer scholarships (Fix: Correct column name)
const getCollegesByScholarship = async (hasScholarship) => {
  const query = 'SELECT * FROM colleges WHERE has_scholarship = $1';
  const values = [hasScholarship]; // Ensure it's passed as boolean (true/false)
  const result = await pool.query(query, values);
  return result.rows;
};

module.exports = {
  getAllColleges,
  getCollegeById,
  getCollegesByScholarship,
};
