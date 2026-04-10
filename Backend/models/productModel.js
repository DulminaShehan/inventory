const db = require('../config/db');

// discounted_price computed in SQL so every response includes it
const SELECT_COLS = `
  p.*,
  b.name AS brand_name,
  ROUND(p.price * (1 - p.discount / 100), 2) AS discounted_price
`;
const FROM_JOIN = `FROM products p LEFT JOIN brands b ON b.id = p.brand_id`;

const ProductModel = {
  async findAll({ search = '', limit = 20, offset = 0 } = {}) {
    const like = `%${search}%`;
    const [rows] = await db.query(
      `SELECT ${SELECT_COLS} ${FROM_JOIN}
       WHERE p.name LIKE ? OR p.category LIKE ? OR b.name LIKE ?
       ORDER BY p.name LIMIT ? OFFSET ?`,
      [like, like, like, limit, offset]
    );
    return rows;
  },

  async count({ search = '' } = {}) {
    const like = `%${search}%`;
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total ${FROM_JOIN}
       WHERE p.name LIKE ? OR p.category LIKE ? OR b.name LIKE ?`,
      [like, like, like]
    );
    return total;
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT ${SELECT_COLS} ${FROM_JOIN} WHERE p.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, category, brand_id, price, discount = 0, quantity, unit }) {
    const [result] = await db.query(
      'INSERT INTO products (name, category, brand_id, price, discount, quantity, unit) VALUES (?,?,?,?,?,?,?)',
      [name, category, brand_id || null, price, discount, quantity, unit]
    );
    return result.insertId;
  },

  async update(id, { name, category, brand_id, price, discount, quantity, unit }) {
    const [result] = await db.query(
      'UPDATE products SET name=?, category=?, brand_id=?, price=?, discount=?, quantity=?, unit=? WHERE id=?',
      [name, category, brand_id || null, price, discount, quantity, unit, id]
    );
    return result.affectedRows;
  },

  async delete(id) {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows;
  },

  async findLowStock(threshold = 10) {
    const [rows] = await db.query(
      `SELECT ${SELECT_COLS} ${FROM_JOIN} WHERE p.quantity < ? ORDER BY p.quantity ASC`,
      [threshold]
    );
    return rows;
  },

  async decrementStock(conn, productId, qty) {
    const [result] = await conn.query(
      'UPDATE products SET quantity = quantity - ? WHERE id = ? AND quantity >= ?',
      [qty, productId, qty]
    );
    return result.affectedRows;
  },
};

module.exports = ProductModel;
