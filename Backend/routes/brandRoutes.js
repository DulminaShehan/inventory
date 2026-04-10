const express = require('express');
const router  = express.Router();
const { getAllBrands, getBrandById, createBrand, updateBrand, deleteBrand } = require('../controllers/brandController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/',     getAllBrands);
router.get('/:id',  getBrandById);
router.post('/',    adminOnly, createBrand);
router.put('/:id',  adminOnly, updateBrand);
router.delete('/:id', adminOnly, deleteBrand);

module.exports = router;
