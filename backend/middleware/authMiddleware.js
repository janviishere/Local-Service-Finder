import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwt';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};
