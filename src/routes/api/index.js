// src/routes/api/index.js
const express = require('express');

const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      const contentType = req.headers['content-type'];
      return contentType && contentType.includes('text/plain');
    },
  });

const router = express.Router();


router.get('/fragments', require('./get'));  

router.post('/fragments', rawBody(), require('./post'));
module.exports = router;