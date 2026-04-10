const jwt = require('jsonwebtoken');

/**
 * protect — verifies the JWT token sent in the Authorization header.
 * Attach the decoded user payload to req.user for downstream handlers.
 */
const protect = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Expect: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, username, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

/**
 * adminOnly — must be used AFTER protect.
 * Blocks non-admin users from accessing sensitive endpoints.
 */
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden. Admin access required.' });
  }
  next();
};

module.exports = { protect, adminOnly };
