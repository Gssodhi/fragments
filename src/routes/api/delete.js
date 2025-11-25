// src/routes/api/delete.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

/**
 * DELETE /fragments/:id
 * Delete a fragment by ID for the current user
 */
module.exports = async (req, res) => {
  // Check if user is authenticated
  if (!req.user) {
    logger.warn('Unauthorized attempt to delete fragment');
    return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
  }

  const ownerId = req.user;
  const { id } = req.params;

  try {
    logger.debug(`Deleting fragment ${id} for user ${ownerId}`);

    // Delete the fragment
    await Fragment.delete(ownerId, id);

    logger.debug(`Fragment ${id} deleted successfully`);

    res.status(200).json(
      createSuccessResponse({
        status: 'ok',
      })
    );
  } catch (err) {
    if (err.message.includes('missing entry')) {
      logger.warn(`Fragment not found for deletion: ${id}`);
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    logger.error({ err }, 'Error deleting fragment');
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};