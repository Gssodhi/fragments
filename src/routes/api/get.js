// src/routes/api/get.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
module.exports = async (req, res) => {
  if (!req.user) {
    return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
  }
  const ownerId = req.user;
  const expand = req.query.expand === 'true';
  try {
    const fragments = await Fragment.byUser(ownerId, expand);
    res.status(200).json(
      createSuccessResponse({
        fragments: fragments,
      })
    );
  } catch {
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
