const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

// Public appointment booking
router.post('/book-appointment', publicController.bookAppointment);

module.exports = router;
