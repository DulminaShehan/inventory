const ProductModel = require('../models/productModel');

// GET /api/products?search=&page=&limit=
const getAllProducts = async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const [products, total] = await Promise.all([
      ProductModel.findAll({ search, limit, offset }),
      ProductModel.count({ search }),
    ]);

    res.json({ success: true, total, page, totalPages: Math.ceil(total / limit), count: products.length, products });
  } catch (err) {
    console.error('[productController.getAllProducts]', err);
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
};

// GET /api/products/low-stock?threshold=10
const getLowStock = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const products  = await ProductModel.findLowStock(threshold);
    res.json({ success: true, threshold, count: products.length, products });
  } catch (err) {
    console.error('[productController.getLowStock]', err);
    res.status(500).json({ success: false, message: 'Failed to fetch low-stock products.' });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product });
  } catch (err) {
    console.error('[productController.getProductById]', err);
    res.status(500).json({ success: false, message: 'Failed to fetch product.' });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, category, brand_id, price, discount = 0, quantity, unit } = req.body;

    if (!name || !category || price == null || quantity == null || !unit)
      return res.status(400).json({ success: false, message: 'Fields required: name, category, price, quantity, unit.' });
    if (price < 0 || quantity < 0)
      return res.status(400).json({ success: false, message: 'Price and quantity must be non-negative.' });
    if (discount < 0 || discount > 100)
      return res.status(400).json({ success: false, message: 'Discount must be between 0 and 100.' });

    const id      = await ProductModel.create({ name, category, brand_id, price, discount, quantity, unit });
    const product = await ProductModel.findById(id);
    res.status(201).json({ success: true, message: 'Product created.', product });
  } catch (err) {
    console.error('[productController.createProduct]', err);
    res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, brand_id, price, discount, quantity, unit } = req.body;

    const existing = await ProductModel.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found.' });

    const newDiscount = discount != null ? parseFloat(discount) : existing.discount;
    if (newDiscount < 0 || newDiscount > 100)
      return res.status(400).json({ success: false, message: 'Discount must be between 0 and 100.' });

    await ProductModel.update(id, {
      name:     name     ?? existing.name,
      category: category ?? existing.category,
      brand_id: brand_id !== undefined ? brand_id : existing.brand_id,
      price:    price    ?? existing.price,
      discount: newDiscount,
      quantity: quantity ?? existing.quantity,
      unit:     unit     ?? existing.unit,
    });

    const updated = await ProductModel.findById(id);
    res.json({ success: true, message: 'Product updated.', product: updated });
  } catch (err) {
    console.error('[productController.updateProduct]', err);
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const affected = await ProductModel.delete(req.params.id);
    if (affected === 0) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2')
      return res.status(409).json({ success: false, message: 'Cannot delete — product is referenced in existing sales.' });
    console.error('[productController.deleteProduct]', err);
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
};

module.exports = { getAllProducts, getLowStock, getProductById, createProduct, updateProduct, deleteProduct };
