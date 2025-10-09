// src/routes/api/get.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * GET /fragments - List fragments for the current user
 */
module.exports = async (req, res) => {
  if (!req.user) {
    return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
  }

  try {
    // Use Fragment model to get user's fragments
    const expand = req.query.expand === '1' || req.query.expand === 'true';
    const fragments = await Fragment.byUser(req.user, expand);
    
    res.status(200).json(
      createSuccessResponse({
        fragments: fragments
      })
    );
  } catch (err) {
    console.error('Error listing fragments:', err);
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};