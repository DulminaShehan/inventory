const express = require('express');
const router  = express.Router();
const { createSale, getAllSales, getSaleById } = require('../controllers/saleController');
const { protect } = require('../middleware/authMiddleware');

// All sale routes require a valid JWT
router.use(protect);

router.post('/',    createSale);   // Create a new sale (staff + admin)
router.get('/',     getAllSales);   // List all sales
router.get('/:id',  getSaleById);  // Get one sale with its line items

module.exports = router;
