const db = require('../config/db');

const UserModel = {
  /** Find a single user by username */
  async findByUsername(username) {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE username = ? LIMIT 1',
      [username]
    );
    return rows[0] || null;
  },

  /** Find a single user by ID (without password) */
  async findById(id) {
    const [rows] = await db.query(
      'SELECT id, username, role, created_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  },

  /** Insert a new user and return its new ID */
  async create({ username, password, role = 'staff' }) {
    const [result] = await db.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, password, role]
    );
    return result.insertId;
  },

  /** Return all users (without passwords) */
  async findAll() {
    const [rows] = await db.query(
      'SELECT id, username, role, created_at FROM users ORDER BY id'
    );
    return rows;
  },
};

module.exports = UserModel;
