import jwt from 'jsonwebtoken';

export const signToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  if (!secret) throw new Error('JWT_SECRET is not set');
  return jwt.sign({ id: userId }, secret, { expiresIn });
};
