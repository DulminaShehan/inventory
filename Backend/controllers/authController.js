const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const UserModel = require('../models/userModel');

/**
 * Generate a signed JWT for the given user payload.
 */
const signToken = (user) =>
  jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// ─────────────────────────────────────────────────
// POST /api/users/register
// ─────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    // Check for duplicate usernames
    const existing = await UserModel.findByUsername(username);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Username already taken.' });
    }

    // Hash the password — cost factor 12 is a good production balance
    const hashed = await bcrypt.hash(password, 12);

    const id = await UserModel.create({ username, password: hashed, role });

    // Return the token immediately so the user is logged in after registering
    const token = signToken({ id, username, role: role || 'staff' });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: { id, username, role: role || 'staff' },
    });
  } catch (err) {
    console.error('[authController.register]', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// ─────────────────────────────────────────────────
// POST /api/users/login
// ─────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const user = await UserModel.findByUsername(username);

    // Use a constant-time comparison to avoid timing attacks
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = signToken(user);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error('[authController.login]', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ─────────────────────────────────────────────────
// GET /api/users/me  (requires protect middleware)
// ─────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error('[authController.getMe]', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─────────────────────────────────────────────────
// GET /api/users  (admin only)
// ─────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.findAll();
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    console.error('[authController.getAllUsers]', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { register, login, getMe, getAllUsers };
