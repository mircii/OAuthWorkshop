const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const router = express.Router();

// OAuth token endpoint implementation
router.post('/token', async (req, res) => {
  try {
    // 1. Read client_id and client_secret from request headers
    const clientId = req.headers['client-id'];
    const clientSecret = req.headers['client-secret'];
    console.log(`Received client_id: ${clientId}, client_secret: ${clientSecret}`); // Debugging line

    if (!clientId || !clientSecret) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'client-id and client-secret headers are required'
      });
    }

    // 2. Validate against oauth_clients table in PostgreSQL
    const pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'postgres',
      password: 'sebi',
      port: 5432,
    });

    // Ensure table exists
    await pool.query(`CREATE TABLE IF NOT EXISTS oauth_clients (
      id SERIAL PRIMARY KEY,
      client_id VARCHAR(255) UNIQUE NOT NULL,
      client_secret VARCHAR(255) NOT NULL
    );`);

    // Check if client exists
    const result = await pool.query(
      'SELECT * FROM oauth_clients WHERE client_id = $1 AND client_secret = $2',
      [clientId, clientSecret]
    );

    
    // Only return JWT if user exists in DB
    if (!validClient) {
      await pool.end();
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Client ID and secret combination not found in database'
      });
    }

    // 3. Generate JWT token with 1-minute expiration
    const payload = {
      client_id: clientId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 // 1 minute expiration
    };

    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(payload, jwtSecret);

    // 4. Store JWT token in jwt.txt file with expiry timestamp
    const expiryTimestamp = payload.exp;
    const jwtFilePath = path.join(__dirname, '../jwt.txt');
    const tokenEntry = `${token}:${expiryTimestamp}\n`;
    fs.appendFileSync(jwtFilePath, tokenEntry);

    // Return the token
    res.json({
      access_token: token,
      token_type: 'Bearer',
      expires_in: 60,
      expires_at: expiryTimestamp
    });

    await pool.end();
  } catch (error) {
    console.error('Error in /oauth/token:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate token'
    });
  }
});

module.exports = router; 