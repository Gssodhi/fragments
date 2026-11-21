// src/routes/api/put.js
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  // Check if user is authenticated
  if (!req.user) {
    logger.warn('Unauthorized attempt to update fragment');
    return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
  }

  const ownerId = req.user;
  const { id } = req.params;

  logger.debug({ id }, 'Updating fragment');
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

    // Get the existing fragment
    const fragment = await Fragment.byId(ownerId, id);

    // Check if the type is being changed (we don't allow changing fragment type)
    if (type !== fragment.type) {
      return res
        .status(400)
        .json(createErrorResponse(400, 'Cannot change fragment type after creation'));
    }

    // Update fragment data
    await fragment.setData(req.body);

    logger.debug(`Fragment ${id} updated successfully`);

    res.status(200).json(
      createSuccessResponse({
        fragment: fragment,
      })
    );
  } catch (err) {
    if (err.message === 'fragment not found') {
      logger.warn(`Fragment not found for update: ${id}`);
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    logger.error({ err }, 'Error updating fragment');
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};
