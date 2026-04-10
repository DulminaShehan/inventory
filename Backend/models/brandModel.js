const db = require('../config/db');

const BrandModel = {
  async findAll() {
    const [rows] = await db.query(
      `SELECT b.*, COUNT(p.id) AS product_count
       FROM brands b LEFT JOIN products p ON p.brand_id = b.id
       GROUP BY b.id ORDER BY b.name`
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query('SELECT * FROM brands WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async create({ name }) {
    const [result] = await db.query('INSERT INTO brands (name) VALUES (?)', [name]);
    return result.insertId;
  },

  async update(id, { name }) {
    const [result] = await db.query('UPDATE brands SET name = ? WHERE id = ?', [name, id]);
    return result.affectedRows;
  },

  async delete(id) {
    const [result] = await db.query('DELETE FROM brands WHERE id = ?', [id]);
    return result.affectedRows;
  },
};

module.exports = BrandModel;
