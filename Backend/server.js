/**
 * server.js — Entry point for the Hardware Store Inventory & Billing API
 *
 * Architecture: MVC (Models → Controllers → Routes)
 * Database:     MySQL (connection pool via mysql2/promise)
 * Auth:         JWT (Bearer tokens)
 */

require('dotenv').config(); // Load .env before anything else

const express      = require('express');
const cors         = require('cors');

// Route modules
const userRoutes    = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const saleRoutes    = require('./routes/saleRoutes');
const brandRoutes   = require('./routes/brandRoutes');

// Initialise the DB pool (side-effect: logs connection status on startup)
require('./config/db');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────────
// Global Middleware
// ─────────────────────────────────────────────────
app.use(cors());                         // allow cross-origin requests
app.use(express.json());                 // parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────
app.use('/api/users',    userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales',    saleRoutes);
app.use('/api/brands',   brandRoutes);

// Health-check endpoint (useful for load balancers / Docker health checks)
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ─────────────────────────────────────────────────
// 404 handler — catch unknown routes
// ─────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─────────────────────────────────────────────────
// Global error handler — last resort for unhandled errors
// ─────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ─────────────────────────────────────────────────
// Start the server
// ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  Hardware Store API running on http://localhost:${PORT}`);
  console.log(`    Environment: ${process.env.NODE_ENV || 'development'}`);
});
