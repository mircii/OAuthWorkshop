const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const fishData = require('../data/fishData')
const redisClient = require('../redisClient');

// JWT validation endpoint
router.get('/data', async (req, res) => {
  try {

    // 1. Read JWT token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Missing or invalid Authorization header. Expected format: Bearer <token>' 
      });
    }

    const token = authHeader.substring(7); 

    const exists = await redisClient.exists(token);
    if (!exists) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has expired or is invalidated'
      });
    }

    // 2. Validate JWT token and check expiration
    // Use a secret key for JWT verification (in production, use environment variable)
    const JWT_SECRET = process.env.JWT_SECRET || 'workshop_secret_key_2024';
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // JWT library automatically checks expiration, but we can also manually verify
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Token has expired' 
      });
    }

    res.json({
      success: true,
      message: 'Access granted',
      user: decoded,
      data: fishData
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Token has expired' 
      });
    }

    console.error('Error in JWT validation:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: 'Failed to validate token' 
    });
  }
});

module.exports = router; 