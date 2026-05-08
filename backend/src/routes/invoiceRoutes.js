// backend/routes/invoiceRoutes.js

const express = require('express');
const router = express.Router();

const { writeToFile } = require('../controllers/invoiceController');

router.post('/write-to-file', writeToFile);

module.exports = router;