// src/routes/index.js
const express = require('express');
const { version, author } = require('../../package.json');
const { authenticate } = require('../auth');
// Create a router that we can use to mount our API
const router = express.Router();


router.use(`/v1`, authenticate(), require('./api'));

router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'ok',
    author,
    githubUrl: 'https://github.com/Gssodhi/fragments',
    version
  });
});
module.exports = router;