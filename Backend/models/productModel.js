const db = require('../config/db');

const ProductModel = {
  /**
   * Get all products with optional search and pagination.
   * @param {string}  search   - partial name/category match
   * @param {number}  limit    - rows per page
   * @param {number}  offset   - rows to skip
   */
  async findAll({ search = '', limit = 20, offset = 0 } = {}) {
    const like = `%${search}%`;
    const [rows] = await db.query(
      `SELECT * FROM products
       WHERE name LIKE ? OR category LIKE ?
       ORDER BY name
       LIMIT ? OFFSET ?`,
      [like, like, limit, offset]
    );
    return rows;
  },

  /** Count matching products (for pagination metadata) */
  async count({ search = '' } = {}) {
    const like = `%${search}%`;
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM products WHERE name LIKE ? OR category LIKE ?',
      [like, like]
    );
    return total;
  },

  /** Fetch a single product by ID */
  async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM products WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  /** Create a product and return its new ID */
  async create({ name, category, price, quantity, unit }) {
    const [result] = await db.query(
      'INSERT INTO products (name, category, price, quantity, unit) VALUES (?, ?, ?, ?, ?)',
      [name, category, price, quantity, unit]
    );
    return result.insertId;
  },

  /** Update a product by ID */
  async update(id, { name, category, price, quantity, unit }) {
    const [result] = await db.query(
      `UPDATE products
       SET name = ?, category = ?, price = ?, quantity = ?, unit = ?
       WHERE id = ?`,
      [name, category, price, quantity, unit, id]
    );
    return result.affectedRows;
  },

  /** Soft-check: does this product exist? */
  async exists(id) {
    const [[{ c }]] = await db.query(
      'SELECT COUNT(*) AS c FROM products WHERE id = ?',
      [id]
    );
    return c > 0;
  },

  /** Delete a product by ID */
  async delete(id) {
    const [result] = await db.query(
      'DELETE FROM products WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  },

  /** Products whose stock is below the given threshold (default 10) */
  async findLowStock(threshold = 10) {
    const [rows] = await db.query(
      'SELECT * FROM products WHERE quantity < ? ORDER BY quantity ASC',
      [threshold]
    );
    return rows;
  },

  /**
   * Decrement stock for a product using an atomic UPDATE.
   * Must be called inside a transaction — see SaleModel.
   * Returns affectedRows (0 = product not found or insufficient stock).
   */
  async decrementStock(conn, productId, qty) {
    const [result] = await conn.query(
      `UPDATE products
       SET quantity = quantity - ?
       WHERE id = ? AND quantity >= ?`,
      [qty, productId, qty]
    );
    return result.affectedRows;
  },
};

module.exports = ProductModel;
