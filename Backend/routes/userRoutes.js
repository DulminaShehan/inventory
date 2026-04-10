const express    = require('express');
const router     = express.Router();
const { register, login, getMe, getAllUsers } = require('../controllers/authController');
const { protect, adminOnly }                  = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login',    login);

// Protected routes
router.get('/me',    protect,            getMe);
router.get('/',      protect, adminOnly, getAllUsers); // admin: list all users

module.exports = router;
