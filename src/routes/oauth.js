const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const router = express.Router();
const redisClient = require('../redisClient');

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

    // 2. Validate against oauth_clients table using Sequelize
    const sequelize = new Sequelize('postgres', 'postgres', 'sebi', {
      host: 'localhost',
      dialect: 'postgres',
      port: 5432,
      logging: false,
    });

    const OAuthClient = sequelize.define('oauth_clients', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      client_id: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      client_secret: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }, {
      timestamps: false,
      freezeTableName: true,
    });

    await OAuthClient.sync();

    // Check if client exists
    const validClient = await OAuthClient.findOne({
      where: {
        client_id: clientId,
        client_secret: clientSecret
      }
    });

    // Only return JWT if user exists in DB
    if (!validClient) {
      await sequelize.close();
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

    // 4. Store JWT token in redis with expiry times
    await redisClient.set(token, JSON.stringify(payload), {EX: 60 });


    // Return the token
    res.json({
      access_token: token,
      token_type: 'Bearer',
      expires_in: 60
      // Note: The expiree timestamp is currently not returned in the response,
      //expires_at: expiryTimestamp
    });

    await sequelize.close();
  } catch (error) {
    console.error('Error in /oauth/token:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate token'
    });
  }
});

module.exports = router; 