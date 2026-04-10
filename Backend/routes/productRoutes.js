const express = require('express');
const router  = express.Router();
const {
  getAllProducts,
  getLowStock,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All product routes require authentication
router.use(protect);

// ── Read (available to all authenticated users) ──────────
router.get('/',          getAllProducts);   // ?search=&page=&limit=
router.get('/low-stock', getLowStock);     // ?threshold=10
router.get('/:id',       getProductById);

// ── Write (admin only) ───────────────────────────────────
router.post('/',     adminOnly, createProduct);
router.put('/:id',   adminOnly, updateProduct);
router.delete('/:id',adminOnly, deleteProduct);

module.exports = router;
