const SaleModel = require('../models/saleModel');

// ─────────────────────────────────────────────────
// POST /api/sales
// Body: { items: [{ product_id, quantity }] }
// ─────────────────────────────────────────────────
const createSale = async (req, res) => {
  try {
    const { items } = req.body;

    // ── Validate request body ────────────────────
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request must include a non-empty "items" array.',
      });
    }

    for (const item of items) {
      if (!item.product_id || !item.quantity) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have "product_id" and "quantity".',
        });
      }
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `Quantity for product_id ${item.product_id} must be a positive integer.`,
        });
      }
    }

    // req.user is set by the protect middleware
    const userId = req.user.id;

    const result = await SaleModel.createSale(userId, items);

    // Fetch the full sale (with line-item details) to return in the response
    const sale = await SaleModel.findById(result.saleId);

    res.status(201).json({
      success: true,
      message: 'Sale created and stock updated successfully.',
      sale,
    });
  } catch (err) {
    // Business-logic errors (insufficient stock, product not found) thrown by the model
    // are plain Error objects with a clear message — return 400.
    console.error('[saleController.createSale]', err.message);

    const isBusinessError =
      err.message.includes('Insufficient stock') ||
      err.message.includes('not found') ||
      err.message.includes('Stock update failed');

    res.status(isBusinessError ? 400 : 500).json({
      success: false,
      message: err.message || 'Failed to create sale.',
    });
  }
};

// ─────────────────────────────────────────────────
// GET /api/sales
// ─────────────────────────────────────────────────
const getAllSales = async (req, res) => {
  try {
    const sales = await SaleModel.findAll();
    res.json({ success: true, count: sales.length, sales });
  } catch (err) {
    console.error('[saleController.getAllSales]', err);
    res.status(500).json({ success: false, message: 'Failed to fetch sales.' });
  }
};

// ─────────────────────────────────────────────────
// GET /api/sales/:id
// ─────────────────────────────────────────────────
const getSaleById = async (req, res) => {
  try {
    const sale = await SaleModel.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale not found.' });
    }
    res.json({ success: true, sale });
  } catch (err) {
    console.error('[saleController.getSaleById]', err);
    res.status(500).json({ success: false, message: 'Failed to fetch sale.' });
  }
};

module.exports = { createSale, getAllSales, getSaleById };
