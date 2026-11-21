// src/routes/api/post.js
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
  }

  const ownerId = req.user;

  try {
    // Parse and validate Content-Type
    let type;
    try {
      const parsed = contentType.parse(req);
      type = parsed.type;
    } catch {
      return res.status(415).json(createErrorResponse(415, 'Invalid Content-Type'));
    }

    // Check if the type is supported
    if (!Fragment.isSupportedType(type)) {
      return res.status(415).json(createErrorResponse(415, `Unsupported media type: ${type}`));
    }

    // Check if body was parsed correctly as Buffer
    if (!Buffer.isBuffer(req.body)) {
      return res.status(415).json(createErrorResponse(415, 'Unsupported media type'));
    }

    // Create new fragment
    const fragment = new Fragment({
      ownerId,
      type,
      size: req.body.length,
    });

    // Save fragment metadata and data
    await fragment.save();
    await fragment.setData(req.body);
    logger.debug({ id: fragment.id, type, size: req.body.length }, 'Fragment created');

    const apiUrl = process.env.API_URL?.startsWith('http')
      ? process.env.API_URL
      : `http://${req.headers.host}`;
    const fragmentUrl = new URL(`/v1/fragments/${fragment.id}`, apiUrl).href;

    // Set Location header and return success response
    res.setHeader('Location', fragmentUrl);
    res.status(201).json(
      createSuccessResponse({
        fragment: fragment,
      })
    );
  } catch (err) {
    logger.error({ err }, 'Error creating fragment');
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
