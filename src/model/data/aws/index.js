
// // src/model/data/aws/index.js
// // const MemoryDB = require('./memory-db');

// // // Create two in-memory databases: one for fragment metadata and the other for raw data
// // const data = new MemoryDB();
// // const metadata = new MemoryDB();
// // XXX: temporary use of memory-db until we add DynamoDB
// const MemoryDB = require('../memory/memory-db');

// // Create two in-memory databases: one for fragment metadata and the other for raw data
// // const data = new MemoryDB();
// const metadata = new MemoryDB();

// // Initialize the S3 client and commands
// const s3Client = require('./s3Client');
// const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
// const logger = require('../../../logger');

// // Write a fragment's metadata to memory db. Returns a Promise<void>
// function writeFragment(fragment) {
//   // Simulate db/network serialization of the value, storing only JSON representation.
//   // This is important because it's how things will work later with AWS data stores.
//   const serialized = JSON.stringify(fragment);
//   return metadata.put(fragment.ownerId, fragment.id, serialized);
// }

// // Read a fragment's metadata from memory db. Returns a Promise<Object>
// async function readFragment(ownerId, id) {
//   // NOTE: this data will be raw JSON, we need to turn it back into an Object.
//   // You'll need to take care of converting this back into a Fragment instance
//   // higher up in the callstack.
//   const serialized = await metadata.get(ownerId, id);
//   return typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
// }

// // // Write a fragment's data buffer to memory db. Returns a Promise
// // // function writeFragmentData(ownerId, id, buffer) {
// // //   return data.put(ownerId, id, buffer);
// // // }

// // Writes a fragment's data to an S3 Object in a Bucket
// // https://github.com/awsdocs/aws-sdk-for-javascript-v3/blob/main/doc_source/s3-example-creating-buckets.md#upload-an-existing-object-to-an-amazon-s3-bucket
// async function writeFragmentData(ownerId, id, data) {
//   // Create the PUT API params from our details
//   const params = {
//     Bucket: process.env.AWS_S3_BUCKET_NAME,
//     // Our key will be a mix of the ownerID and fragment id, written as a path
//     Key: `${ownerId}/${id}`,
//     Body: data,
//   };

//   // Create a PUT Object command to send to S3
//   const command = new PutObjectCommand(params);

//   try {
//     // Use our client to send the command
//     await s3Client.send(command);
//   } catch (err) {
//     const { Bucket, Key } = params;
//     logger.error({ err, Bucket, Key }, 'Error uploading fragment data to S3');
//     throw new Error('unable to upload fragment data');
//   }
// }

// // Convert a stream of data into a Buffer
// const streamToBuffer = (stream) =>
//   new Promise((resolve, reject) => {
//     const chunks = [];
//     stream.on('data', (chunk) => chunks.push(chunk));
//     stream.on('error', reject);
//     stream.on('end', () => resolve(Buffer.concat(chunks)));
//   });

// // Reads a fragment's data from S3 and returns (Promise<Buffer>)
// async function readFragmentData(ownerId, id) {
//   const params = {
//     Bucket: process.env.AWS_S3_BUCKET_NAME,
//     Key: `${ownerId}/${id}`,
//   };

//   const command = new GetObjectCommand(params);

//   try {
//     const data = await s3Client.send(command);
//     return streamToBuffer(data.Body);
//   } catch (err) {
//     const { Bucket, Key } = params;
//     logger.error({ err, Bucket, Key }, 'Error streaming fragment data from S3');
//     throw new Error('unable to read fragment data');
//   }
// }

// // // Read a fragment's data from memory db. Returns a Promise
// // // function readFragmentData(ownerId, id) {
// // //   return data.get(ownerId, id);
// // // }

// // Get a list of fragment ids/objects for the given user
// async function listFragments(ownerId, expand = false) {
//   const fragments = await metadata.query(ownerId);

//   if (!fragments || fragments.length === 0) return [];

//   if (expand) {
//     return fragments.map((fragment) => {
//       const parsed = typeof fragment === 'string' ? JSON.parse(fragment) : fragment;
//       return parsed;
//     });
//   }

//   return fragments.map((fragment) => {
//     const parsed = typeof fragment === 'string' ? JSON.parse(fragment) : fragment;
//     return parsed.id;
//   });
// }

// // Delete a fragment's metadata + its S3 data
// async function deleteFragment(ownerId, id) {
//   const metadataExists = await metadata.get(ownerId, id);
//   if (!metadataExists) {
//     throw new Error(`missing entry for primaryKey=${ownerId} and secondaryKey=${id}`);
//   }

//   await metadata.del(ownerId, id);

//   try {
//     const params = {
//       Bucket: process.env.AWS_S3_BUCKET_NAME,
//       Key: `${ownerId}/${id}`,
//     };
//     const command = new DeleteObjectCommand(params);
//     await s3Client.send(command);
//   } catch (err) {
//     logger.error({ err, ownerId, id }, 'Error deleting fragment data from S3');
//   }
// }

// // // Original in-memory delete fragment method
// // // async function deleteFragment(ownerId, id) {
// // //   const metadataExists = await metadata.get(ownerId, id);
// // //   if (!metadataExists) {
// // //     throw new Error(`missing entry for primaryKey=${ownerId} and secondaryKey=${id}`);
// // //   }
// //
// // //   await metadata.del(ownerId, id);
// //
// // //   const dataExists = await data.get(ownerId, id);
// // //   if (dataExists) {
// // //     await data.del(ownerId, id);
// // //   }
// // // }

// module.exports.listFragments = listFragments;
// module.exports.writeFragment = writeFragment;
// module.exports.readFragment = readFragment;
// module.exports.writeFragmentData = writeFragmentData;
// module.exports.readFragmentData = readFragmentData;
// module.exports.deleteFragment = deleteFragment;
// // src/model/data/aws/index.js
// // const MemoryDB = require('./memory-db');

// // // Create two in-memory databases: one for fragment metadata and the other for raw data
// // const data = new MemoryDB();
// // const metadata = new MemoryDB();
// // XXX: temporary use of memory-db until we add DynamoDB
//const MemoryDB = require('../memory/memory-db');

// Create two in-memory databases: one for fragment metadata and the other for raw data
//const data = new MemoryDB();
// Initialize the S3 client and commands
// src/model/data/aws/index.js
const s3Client = require('./s3Client');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { PutCommand, GetCommand, DeleteCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const dynamodbClient = require('./dynamodbClient');
const logger = require('../../../logger');

// Write a fragment's metadata to DynamoDB. Returns a Promise<void>
async function writeFragment(fragment) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Item: fragment,
  };

  const command = new PutCommand(params);

  try {
    await dynamodbClient.send(command);
  } catch (err) {
    logger.error({ err, TableName: params.TableName }, 'Error writing fragment metadata to DynamoDB');
    throw new Error('unable to write fragment metadata');
  }
}

// Read a fragment's metadata from DynamoDB. Returns a Promise<Object>
async function readFragment(ownerId, id) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };

  const command = new GetCommand(params);

  try {
    const result = await dynamodbClient.send(command);
    return result.Item || null;
  } catch (err) {
    logger.error({ err, TableName: params.TableName, ownerId, id }, 'Error reading fragment metadata from DynamoDB');
    throw new Error('unable to read fragment metadata');
  }
}

// Write a fragment's data buffer to S3. Returns a Promise
// function writeFragmentData(ownerId, id, buffer) {
//   return data.put(ownerId, id, buffer);
// }
// Writes a fragment's data to an S3 Object in a Bucket
async function writeFragmentData(ownerId, id, data) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
    Body: data,
  };

  const command = new PutObjectCommand(params);

  try {
    await s3Client.send(command);
  } catch (err) {
    logger.error({ err, Bucket: params.Bucket, Key: params.Key }, 'Error uploading fragment data to S3');
    throw new Error('unable to upload fragment data');
  }
}

// Convert a stream of data into a Buffer
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

// Reads a fragment's data from S3 and returns (Promise<Buffer>)
// function readFragmentData(ownerId, id) {
//   return data.get(ownerId, id);
// }
async function readFragmentData(ownerId, id) {
  const params = { Bucket: process.env.AWS_S3_BUCKET_NAME, Key: `${ownerId}/${id}` };
  const command = new GetObjectCommand(params);

  try {
    const result = await s3Client.send(command);
    return streamToBuffer(result.Body);
  } catch (err) {
    logger.error({ err, Bucket: params.Bucket, Key: params.Key }, 'Error streaming fragment data from S3');
    if (err.message.includes('NoSuchKey') || err.message.includes('fragment not found') || err.message.includes('missing entry')) {
      throw new Error('fragment not found');
    }
    throw new Error('unable to read fragment data');
  }
}

// Get a list of fragment ids/objects for the given user from DynamoDB. Returns a Promise
async function listFragments(ownerId, expand = false) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    KeyConditionExpression: 'ownerId = :ownerId',
    ExpressionAttributeValues: { ':ownerId': ownerId },
  };

  const command = new QueryCommand(params);

  try {
    const result = await dynamodbClient.send(command);
    const fragments = result.Items || [];

    if (!fragments.length) return [];

    if (expand) return fragments;

    return fragments.map((fragment) => fragment.id);
  } catch (err) {
    logger.error({ err, ownerId }, 'Error listing fragments from DynamoDB');
    throw new Error('unable to list fragments');
  }
}

// Delete a fragment's metadata and data from DynamoDB + S3
async function deleteFragment(ownerId, id) {
  try {
    const meta = await readFragment(ownerId, id);
    if (!meta) throw new Error('fragment not found');

    const params = { TableName: process.env.AWS_DYNAMODB_TABLE_NAME, Key: { ownerId, id } };
    await dynamodbClient.send(new DeleteCommand(params));

    try {
      await deleteFragmentData(ownerId, id);
    } catch (err) {
      if (!err.message.includes('NoSuchKey') && !err.message.includes('not found')) {
        logger.warn({ err, ownerId, id }, 'Error deleting fragment data from S3, continuing');
      }
    }
  } catch (err) {
    if (err.message.includes('fragment not found') || err.message.includes('missing entry')) {
      throw new Error('fragment not found');
    }
    throw err;
  }

  logger.debug(`deleteFragment called - ownerId: ${ownerId}, id: ${id}`);
}

// Delete only the raw data object from S3
async function deleteFragmentData(ownerId, id) {
  const params = { Bucket: process.env.AWS_S3_BUCKET_NAME, Key: `${ownerId}/${id}` };
  const command = new DeleteObjectCommand(params);

  try {
    await s3Client.send(command);
  } catch (err) {
    logger.error({ err, Bucket: params.Bucket, Key: params.Key }, 'Error deleting fragment data from S3');
    throw new Error('unable to delete fragment data');
  }
}

// Export all functions
module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;
