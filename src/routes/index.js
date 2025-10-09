// src/routes/index.js
const express = require('express');
const { version, author } = require('../../package.json');

// Create a router that we can use to mount our API
const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'ok',
    author,
    version,
    githubUrl: 'https://github.com/Gssodhi/fragments'
  });
});

// Mount API routes
router.use('/v1', require('./api'));

module.exports = router;