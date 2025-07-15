const jwt = require('jsonwebtoken');

exports.authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;          // Bearer <token>
  const token = auth && auth.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing.' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid / expired token.' });
  }
};
