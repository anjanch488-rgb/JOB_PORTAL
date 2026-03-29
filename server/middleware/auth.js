import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Verifies JWT from Authorization: Bearer <token> and attaches req.user (lean user doc).
 */
export const protect = async (req, res, next) => {
  try {
    let token;
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      token = header.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'Server misconfiguration' });
    }
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};
