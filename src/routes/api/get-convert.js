// //src/routes/api/get-convert.js

// const { Fragment } = require('../../model/fragment');
// const logger = require('../../logger');
// const {createErrorResponse } = require('../../response');
// const markdownIt = require('markdown-it')();

// /**
//  * GET /fragments/:id.:ext
//  * Get a fragment's data converted to the requested format
//  */
// module.exports = async (req, res) => {
//   // Check if user is authenticated
//   if (!req.user) {
//     logger.warn('Unauthorized attempt to convert fragment');
//     return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
//   }

//   const ownerId = req.user;
//   const { id, ext } = req.params;

//   try {
//     logger.debug(`Converting fragment ${id} to .${ext} for user ${ownerId}`);

//     // Get the fragment
//     const fragment = await Fragment.byId(ownerId, id);
//     const fragmentData = await fragment.getData();

//     // Map file extensions to MIME types
//     const extensionToMime = {
//       txt: 'text/plain',
//       md: 'text/markdown',
//       html: 'text/html',
//       json: 'application/json',
//     };

//     const targetMimeType = extensionToMime[ext];

//     if (!targetMimeType) {
//       logger.warn(`Unsupported extension: ${ext}`);
//       return res.status(415).json(createErrorResponse(415, `Unsupported extension: ${ext}`));
//     }

//     // Check if conversion is supported
//     if (!fragment.formats.includes(targetMimeType)) {
//       logger.warn(`Conversion not supported: ${fragment.type} to ${targetMimeType}`);
//       return res
//         .status(415)
//         .json(
//           createErrorResponse(
//             415,
//             `Conversion not supported from ${fragment.type} to ${targetMimeType}`
//           )
//         );
//     }

//     let convertedData = fragmentData;
//     let contentType = fragment.type;

//     // Perform conversions
//     if (fragment.type === 'text/markdown' && targetMimeType === 'text/html') {
//       // Convert Markdown to HTML
//       convertedData = Buffer.from(markdownIt.render(fragmentData.toString()));
//       contentType = 'text/html';
//       logger.debug('Converted Markdown to HTML');
//     } else if (fragment.type === 'text/markdown' && targetMimeType === 'text/plain') {
//       // Convert Markdown to plain text (strip markdown)
//       convertedData = Buffer.from(fragmentData.toString().replace(/[#*`~_\]()]/g, ''));
//       contentType = 'text/plain';
//       logger.debug('Converted Markdown to plain text');
//     } else if (fragment.type === 'application/json' && targetMimeType === 'text/plain') {
//       // Convert JSON to pretty-printed string
//       try {
//         const jsonObj = JSON.parse(fragmentData.toString());
//         convertedData = Buffer.from(JSON.stringify(jsonObj, null, 2));
//         contentType = 'text/plain';
//         logger.debug('Converted JSON to formatted text');
//       } catch {
//         logger.warn('Invalid JSON data for conversion');
//         return res.status(415).json(createErrorResponse(415, 'Invalid JSON data'));
//       }
//     }
//     // Add more conversion logic here as needed

//     // Set appropriate Content-Type header
//     res.setHeader('Content-Type', contentType);

//     // Return the converted data
//     res.status(200).send(convertedData);
//   } catch (err) {
//     if (err.message === 'fragment not found') {
//       logger.warn(`Fragment not found: ${id}`);
//       return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
//     }

//     logger.error({ err }, 'Error converting fragment');
//     res.status(500).json(createErrorResponse(500, 'Internal server error'));
//   }
// };
// src/routes/api/get-convert.js
// src/routes/api/get-convert.js
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { createErrorResponse } = require('../../response');
const markdownIt = require('markdown-it')();
const sharp = require('sharp');

/**
 * GET /fragments/:id.:ext
 * Get a fragment's data converted to the requested format
 */
module.exports = async (req, res) => {
  // Check if user is authenticated
  if (!req.user) {
    logger.warn('Unauthorized attempt to convert fragment');
    return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
  }

  const ownerId = req.user;
  const { id, ext } = req.params;

  try {
    logger.debug(`Converting fragment ${id} to .${ext} for user ${ownerId}`);

    // Get the fragment
    const fragment = await Fragment.byId(ownerId, id);
    const fragmentData = await fragment.getData();

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
      gif: 'image/gif'
    };

    const targetMimeType = extensionToMime[ext];

    if (!targetMimeType) {
      logger.warn(`Unsupported extension: ${ext}`);
      return res.status(415).json(createErrorResponse(415, `Unsupported extension: ${ext}`));
    }

    // Check if conversion is supported
    if (!fragment.formats.includes(targetMimeType)) {
      logger.warn(`Conversion not supported: ${fragment.type} to ${targetMimeType}`);
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
    let contentType = targetMimeType;

    // Perform text-based conversions
    if (fragment.type === 'text/markdown' && targetMimeType === 'text/html') {
      // Convert Markdown to HTML
      convertedData = Buffer.from(markdownIt.render(fragmentData.toString()));
      logger.debug('Converted Markdown to HTML');
    } else if (fragment.type === 'text/markdown' && targetMimeType === 'text/plain') {
      // Convert Markdown to plain text (strip markdown)
      convertedData = Buffer.from(fragmentData.toString().replace(/[#*`~_\]()]/g, ''));
      logger.debug('Converted Markdown to plain text');
    } else if (fragment.type === 'application/json' && targetMimeType === 'text/plain') {
      // Convert JSON to pretty-printed string
      try {
        const jsonObj = JSON.parse(fragmentData.toString());
        convertedData = Buffer.from(JSON.stringify(jsonObj, null, 2));
        logger.debug('Converted JSON to formatted text');
      } catch {
        logger.warn('Invalid JSON data for conversion');
        return res.status(415).json(createErrorResponse(415, 'Invalid JSON data'));
      }
    } else if (fragment.type === 'text/html' && targetMimeType === 'text/plain') {
      // Convert HTML to plain text (strip tags)
      convertedData = Buffer.from(fragmentData.toString().replace(/<[^>]*>/g, ''));
      logger.debug('Converted HTML to plain text');
    } else if (fragment.type.startsWith('image/') && targetMimeType.startsWith('image/')) {
      // Handle image conversions
      try {
        convertedData = await convertImage(fragmentData, targetMimeType);
        logger.debug(`Converted image from ${fragment.type} to ${targetMimeType}`);
      } catch (err) {
        logger.error({ err }, 'Image conversion failed');
        return res.status(415).json(createErrorResponse(415, `Image conversion failed: ${err.message}`));
      }
    }

    // Set appropriate Content-Type header
    res.setHeader('Content-Type', contentType);

    // Return the converted data
    res.status(200).send(convertedData);
  } catch (err) {
    if (err.message === 'fragment not found') {
      logger.warn(`Fragment not found: ${id}`);
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    logger.error({ err }, 'Error converting fragment');
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

/**
 * Convert image data between formats using sharp
 */
async function convertImage(data, toType) {
  try {
    let image = sharp(data);

    // Convert to target format
    switch (toType) {
      case 'image/png':
        return await image.png().toBuffer();
      case 'image/jpeg':
        return await image.jpeg().toBuffer();
      case 'image/webp':
        return await image.webp().toBuffer();
      case 'image/gif':
        return await image.gif().toBuffer();
      default:
        throw new Error(`Unsupported image target type: ${toType}`);
    }
  } catch (err) {
    throw new Error(`Image conversion failed: ${err.message}`);
  }
}