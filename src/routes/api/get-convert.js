// src/routes/api/get-convert.js
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { createErrorResponse } = require('../../response');
const markdownIt = require('markdown-it')();
const sharp = require('sharp');

// Map file extensions to MIME types
const extensionToMime = {
  txt: 'text/plain',
  md: 'text/markdown',
  html: 'text/html',
  json: 'application/json',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

/**
 * GET /fragments/:id.:ext
 * Returns a fragment's data converted to the type implied by the extension.
 */
module.exports = async (req, res) => {
  if (!req.user) {
    return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
  }

  const ownerId = req.user;
  const { id, ext } = req.params;
  logger.debug({ id, ext }, 'Fragment conversion requested');

  try {
    const fragment = await Fragment.byId(ownerId, id);
    const fragmentData = await fragment.getData();

    const targetMimeType = extensionToMime[ext];
    if (!targetMimeType) {
      logger.warn({ ext }, 'Unsupported extension');
      return res.status(415).json(createErrorResponse(415, `Unsupported extension: ${ext}`));
    }

    if (!fragment.formats.includes(targetMimeType)) {
      return res
        .status(415)
        .json(
          createErrorResponse(
            415,
            `Conversion not supported from ${fragment.type} to ${targetMimeType}`
          )
        );
    }

    let convertedData = fragmentData;

    if (fragment.type === 'text/markdown' && targetMimeType === 'text/html') {
      convertedData = Buffer.from(markdownIt.render(fragmentData.toString()));
    } else if (fragment.type === 'text/markdown' && targetMimeType === 'text/plain') {
      convertedData = Buffer.from(fragmentData.toString().replace(/[#*`~_\]()]/g, ''));
    } else if (fragment.type === 'application/json' && targetMimeType === 'text/plain') {
      try {
        const jsonObj = JSON.parse(fragmentData.toString());
        convertedData = Buffer.from(JSON.stringify(jsonObj, null, 2));
      } catch {
        return res.status(415).json(createErrorResponse(415, 'Invalid JSON data'));
      }
    } else if (fragment.type === 'text/html' && targetMimeType === 'text/plain') {
      convertedData = Buffer.from(fragmentData.toString().replace(/<[^>]*>/g, ''));
    } else if (fragment.type.startsWith('image/') && targetMimeType.startsWith('image/')) {
      try {
        convertedData = await convertImage(fragmentData, targetMimeType);
      } catch (err) {
        logger.warn({ err, id }, 'Image conversion failed');
        return res
          .status(415)
          .json(createErrorResponse(415, `Image conversion failed: ${err.message}`));
      }
    }

    logger.debug({ id, from: fragment.type, to: targetMimeType }, 'Fragment converted');
    res.setHeader('Content-Type', targetMimeType);
    res.status(200).send(convertedData);
  } catch (err) {
    if (err.message === 'fragment not found') {
      logger.warn({ id }, 'Fragment not found');
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    logger.error({ err }, 'Error converting fragment');
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

async function convertImage(data, toType) {
  const image = sharp(data);

  switch (toType) {
    case 'image/png':
      return image.png().toBuffer();
    case 'image/jpeg':
      return image.jpeg().toBuffer();
    case 'image/webp':
      return image.webp().toBuffer();
    case 'image/gif':
      return image.gif().toBuffer();
    default:
      throw new Error(`Unsupported image target type: ${toType}`);
  }
}
