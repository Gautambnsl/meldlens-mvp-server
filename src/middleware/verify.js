const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Get token from the header

  if (!token) {
    return res.status(403).send('A token is required for authentication');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.userId = decoded.userId; // Attach user ID to request
    next(); // Proceed to the next middleware/route
  } catch (err) {
    return res.status(401).send('Invalid Token');
  }
};


module.exports = { verifyToken };
