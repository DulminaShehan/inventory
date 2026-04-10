const db = require('../config/db');

const SaleModel = {
  /**
   * createSale — the heart of the billing system.
   *
   * This entire operation runs inside a single MySQL TRANSACTION so that:
   *  - stock is only reduced if ALL items are available
   *  - the sale header and all line items are inserted atomically
   *  - a failure at any step rolls back everything
   *
   * @param {number}   userId  - the staff/admin creating the sale
   * @param {Array}    items   - [{ product_id, quantity }]
   * @returns {object}         - { saleId, total, items }
   */
  async createSale(userId, items) {
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      let total = 0;
      const enrichedItems = [];

      // ── Step 1: validate stock and lock rows ─────────────────────────
      for (const item of items) {
        // SELECT ... FOR UPDATE locks the row for the duration of this transaction,
        // preventing concurrent sales from over-selling the same stock.
        const [rows] = await conn.query(
          'SELECT id, name, price, quantity FROM products WHERE id = ? FOR UPDATE',
          [item.product_id]
        );

        if (rows.length === 0) {
          throw new Error(`Product with ID ${item.product_id} not found.`);
        }

        const product = rows[0];

        if (product.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}". ` +
            `Available: ${product.quantity}, Requested: ${item.quantity}.`
          );
        }

        const subtotal = product.price * item.quantity;
        total += subtotal;

        enrichedItems.push({
          product_id: item.product_id,
          quantity:   item.quantity,
          price:      product.price, // capture price at time of sale
        });
      }

      // ── Step 2: insert the sale header ───────────────────────────────
      const [saleResult] = await conn.query(
        'INSERT INTO sales (total, created_by) VALUES (?, ?)',
        [total, userId]
      );
      const saleId = saleResult.insertId;

      // ── Step 3: insert all line items and reduce stock ───────────────
      for (const item of enrichedItems) {
        // Insert line item
        await conn.query(
          'INSERT INTO sales_items (sale_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [saleId, item.product_id, item.quantity, item.price]
        );

        // Reduce stock atomically — the WHERE quantity >= qty guard is a
        // second safety net against race conditions even with the row lock.
        const [upd] = await conn.query(
          'UPDATE products SET quantity = quantity - ? WHERE id = ? AND quantity >= ?',
          [item.quantity, item.product_id, item.quantity]
        );

        if (upd.affectedRows === 0) {
          throw new Error(`Stock update failed for product ID ${item.product_id}.`);
        }
      }

      await conn.commit();

      return { saleId, total, items: enrichedItems };
    } catch (err) {
      await conn.rollback();
      throw err; // re-throw so the controller can respond with the right message
    } finally {
      conn.release();
    }
  },

  /** Fetch all sales with the name of the staff member who created them */
  async findAll() {
    const [rows] = await db.query(
      `SELECT s.id, s.total, s.created_at,
              u.username AS created_by
       FROM   sales s
       LEFT JOIN users u ON u.id = s.created_by
       ORDER BY s.created_at DESC`
    );
    return rows;
  },

  /** Fetch a single sale with all its line items */
  async findById(id) {
    // Sale header
    const [[sale]] = await db.query(
      `SELECT s.id, s.total, s.created_at,
              u.username AS created_by
       FROM   sales s
       LEFT JOIN users u ON u.id = s.created_by
       WHERE  s.id = ?`,
      [id]
    );

    if (!sale) return null;

    // Line items
    const [items] = await db.query(
      `SELECT si.id, si.quantity, si.price, si.subtotal,
              p.name AS product_name, p.unit
       FROM   sales_items si
       JOIN   products p ON p.id = si.product_id
       WHERE  si.sale_id = ?`,
      [id]
    );

    return { ...sale, items };
  },
};

module.exports = SaleModel;
