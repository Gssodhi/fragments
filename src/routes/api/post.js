
// src/routes/api/post.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
//const contentType = require('content-type');

module.exports = async (req, res) => {
   if (!req.user) {
      return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
    }
  try {
    let type;
    

    // Check if supported
    if (!Fragment.isSupportedType(type)) {
      return res.status(415).json(createErrorResponse(415, `Unsupported type: ${type}`));
    }

    // Validate raw body
    if (!Buffer.isBuffer(req.body)) {
      return res.status(400).json(createErrorResponse(400, 'Body must be a Buffer'));
    }
    const fragment = new Fragment({
      ownerId: req.user,
      type,
      size: req.body.length,
    });
    await fragment.save();
    await fragment.setData(req.body);

    // Build Location header using environment variable or request host
    const baseUrl = process.env.API_URL || `${req.protocol}${req.get('host')}`;
    const location = `${baseUrl}/v1/fragments/${fragment.id}`;
    res.setHeader('Location', location);

    return res.status(201).json(createSuccessResponse({ fragment }));
  } catch (err) {
    console.error('POST /fragments error:', err);
    return res.status(500).json(createErrorResponse(500, err.message || 'Internal Server Error'));
  }
};
