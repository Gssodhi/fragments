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
const { Fragment } = require('../../model/fragment');
//const logger = require('../../logger');
const { createErrorResponse } = require('../../response');
const markdownIt = require('markdown-it')();
const sharp = require('sharp');

module.exports = async (req, res) => {
  console.log('🔍 === GET-CONVERT DEBUG START ===');
  console.log('🔍 Full URL:', req.originalUrl);
  console.log('🔍 Method:', req.method);
  console.log('🔍 Params:', req.params);
  console.log('🔍 User:', req.user);
  
  // Check if user is authenticated
  if (!req.user) {
    console.log('🔍 No user found - unauthorized');
    return res.status(401).json(createErrorResponse(401, 'Unauthorized'));
  }

  const ownerId = req.user;
  const { id, ext } = req.params;

  console.log('🔍 Conversion request details:', { ownerId, id, ext });

  try {
    console.log('🔍 Step 1: Calling Fragment.byId...');
    
    // Get the fragment
    const fragment = await Fragment.byId(ownerId, id);
    console.log('🔍 Step 1 SUCCESS - Fragment found:', fragment.id, fragment.type);

    console.log('🔍 Step 2: Calling fragment.getData()...');
    const fragmentData = await fragment.getData();
    console.log('🔍 Step 2 SUCCESS - Data size:', fragmentData.length, 'bytes');

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
    console.log('🔍 Target MIME type:', targetMimeType);

    if (!targetMimeType) {
      console.log('🔍 Unsupported extension');
      return res.status(415).json(createErrorResponse(415, `Unsupported extension: ${ext}`));
    }

    console.log('🔍 Step 3: Checking supported formats...');
    console.log('🔍 Fragment formats:', fragment.formats);
    console.log('🔍 Target format supported?', fragment.formats.includes(targetMimeType));

    // Check if conversion is supported
    if (!fragment.formats.includes(targetMimeType)) {
      console.log('🔍 Conversion not supported');
      return res.status(415).json(createErrorResponse(415, `Conversion not supported from ${fragment.type} to ${targetMimeType}`));
    }

    let convertedData = fragmentData;
    let contentType = targetMimeType;

    console.log('🔍 Step 4: Performing conversion...');
    console.log('🔍 Conversion type:', fragment.type, '->', targetMimeType);

    // Perform text-based conversions
    if (fragment.type === 'text/markdown' && targetMimeType === 'text/html') {
      convertedData = Buffer.from(markdownIt.render(fragmentData.toString()));
      console.log('🔍 Converted Markdown to HTML');
    } else if (fragment.type === 'text/markdown' && targetMimeType === 'text/plain') {
      convertedData = Buffer.from(fragmentData.toString().replace(/[#*`~_\]()]/g, ''));
      console.log('🔍 Converted Markdown to plain text');
    } else if (fragment.type === 'application/json' && targetMimeType === 'text/plain') {
      try {
        const jsonObj = JSON.parse(fragmentData.toString());
        convertedData = Buffer.from(JSON.stringify(jsonObj, null, 2));
        console.log('🔍 Converted JSON to formatted text');
      } catch {
        console.log('🔍 Invalid JSON data');
        return res.status(415).json(createErrorResponse(415, 'Invalid JSON data'));
      }
    } else if (fragment.type === 'text/html' && targetMimeType === 'text/plain') {
      convertedData = Buffer.from(fragmentData.toString().replace(/<[^>]*>/g, ''));
      console.log('🔍 Converted HTML to plain text');
    } else if (fragment.type.startsWith('image/') && targetMimeType.startsWith('image/')) {
      try {
        console.log('🔍 Starting image conversion...');
        convertedData = await convertImage(fragmentData, targetMimeType);
        console.log('🔍 Image conversion successful');
      } catch (err) {
        console.log('🔍 Image conversion failed:', err.message);
        return res.status(415).json(createErrorResponse(415, `Image conversion failed: ${err.message}`));
      }
    } else {
      console.log('🔍 No conversion needed - returning original data');
    }

    console.log('🔍 Step 5: Sending response...');
    
    // Set appropriate Content-Type header
    res.setHeader('Content-Type', contentType);

    // Return the converted data
    res.status(200).send(convertedData);
    console.log('🔍 === GET-CONVERT DEBUG END - SUCCESS ===');
    
  } catch (err) {
    console.log('🔍 === GET-CONVERT DEBUG END - ERROR ===');
    console.log('🔍 Error message:', err.message);
    console.log('🔍 Error stack:', err.stack);
    
    if (err.message === 'fragment not found') {
      console.log('🔍 Fragment not found - additional debugging:');
      console.log('🔍 OwnerId:', ownerId);
      console.log('🔍 Fragment ID:', id);
      
      // Try to list all fragments for this user to see what's available
      try {
        const userFragments = await Fragment.byUser(ownerId, true);
        console.log('🔍 All fragments for user:', userFragments.map(f => ({ id: f.id, type: f.type })));
        console.log('🔍 Looking for fragment in list:', id, '- Found:', userFragments.some(f => f.id === id));
      } catch (debugErr) {
        console.log('🔍 Error listing user fragments:', debugErr.message);
      }
      
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    console.log('🔍 Unknown error:', err);
    res.status(500).json(createErrorResponse(500, 'Internal server error'));
  }
};

async function convertImage(data, toType) {
  console.log('🔍 Starting image conversion with sharp...');
  let image = sharp(data);

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
}