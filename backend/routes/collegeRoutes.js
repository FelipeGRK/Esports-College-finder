const express = require('express');
const { getAll, getById, getByScholarship } = require('../controllers/collegecontroller');
const { aiSearch } = require('../controllers/aiController'); // Ensure AI controller is imported


const router = express.Router();

// Fetch all colleges
router.get('/', getAll);

// Fetch college by ID
router.get('/:id', getById);

// Filter by scholarship
router.get('/scholarship/filter', getByScholarship);

// AI-powered search
router.post('/ai-search', aiSearch);  // 

module.exports = router;
