// // //src/model/data/memory/index.js
// // const MemoryDB = require('./memory-db');

// // // Create two in-memory databases: one for fragment metadata and the other for raw data
// // const data = new MemoryDB();
// // const metadata = new MemoryDB();

// // // Write a fragment's metadata to memory db. Returns a Promise<void>
// // function writeFragment(fragment) {
// //   // Simulate db/network serialization of the value, storing only JSON representation.
// //   // This is important because it's how things will work later with AWS data stores.
// //   const serialized = JSON.stringify(fragment);
// //   return metadata.put(fragment.ownerId, fragment.id, serialized);
// // }

// // // Read a fragment's metadata from memory db. Returns a Promise<Object>
// // async function readFragment(ownerId, id) {
// //   // NOTE: this data will be raw JSON, we need to turn it back into an Object.
// //   // You'll need to take care of converting this back into a Fragment instance
// //   // higher up in the callstack.
// //   const serialized = await metadata.get(ownerId, id);
// //   return typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
// // }

// // // Write a fragment's data buffer to memory db. Returns a Promise
// // function writeFragmentData(ownerId, id, buffer) {
// //   return data.put(ownerId, id, buffer);
// // }

// // // Read a fragment's data from memory db. Returns a Promise
// // function readFragmentData(ownerId, id) {
// //   return data.get(ownerId, id);
// // }

// // // Get a list of fragment ids/objects for the given user from memory db. Returns a Promise
// // async function listFragments(ownerId, expand = false) {
// //   const fragments = await metadata.query(ownerId);

// //   // If we don't get anything back, or are supposed to give expanded fragments, return
// //   if (expand || !fragments) {
// //     return fragments;
// //   }

// //   // Otherwise, map to only send back the ids
// //   return fragments.map((fragment) => JSON.parse(fragment).id);
// // }

// // // Delete a fragment's metadata and data from memory db. Returns a Promise
// // function deleteFragment(ownerId, id) {
// //   return Promise.all([
// //     // Delete metadata
// //     metadata.del(ownerId, id),
// //     // Delete data
// //     data.del(ownerId, id),
// //   ]);
// // }

// // module.exports.listFragments = listFragments;
// // module.exports.writeFragment = writeFragment;
// // module.exports.readFragment = readFragment;
// // module.exports.writeFragmentData = writeFragmentData;
// // module.exports.readFragmentData = readFragmentData;
// // module.exports.deleteFragment = deleteFragment;
// // src/model/data/aws/index.js
// // const MemoryDB = require('./memory-db');

// // // Create two in-memory databases: one for fragment metadata and the other for raw data
// // const data = new MemoryDB();
// // const metadata = new MemoryDB();
// // XXX: temporary use of memory-db until we add DynamoDB
// const MemoryDB = require('../memory/memory-db');

// // Create two in-memory databases: one for fragment metadata and the other for raw data
// //const data = new MemoryDB();
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

// // Write a fragment's data buffer to memory db. Returns a Promise
// // function writeFragmentData(ownerId, id, buffer) {
// //   return data.put(ownerId, id, buffer);
// // }
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
//     // If anything goes wrong, log enough info that we can debug
//     const { Bucket, Key } = params;
//     logger.error({ err, Bucket, Key }, 'Error uploading fragment data to S3');
//     throw new Error('unable to upload fragment data');
//   }
// }
// // Convert a stream of data into a Buffer, by collecting
// // chunks of data until finished, then assembling them together.
// // We wrap the whole thing in a Promise so it's easier to consume.
// const streamToBuffer = (stream) =>
//   new Promise((resolve, reject) => {
//     // As the data streams in, we'll collect it into an array.
//     const chunks = [];

//     // Streams have events that we can listen for and run
//     // code.  We need to know when new `data` is available,
//     // if there's an `error`, and when we're at the `end`
//     // of the stream.

//     // When there's data, add the chunk to our chunks list
//     stream.on('data', (chunk) => chunks.push(chunk));
//     // When there's an error, reject the Promise
//     stream.on('error', reject);
//     // When the stream is done, resolve with a new Buffer of our chunks
//     stream.on('end', () => resolve(Buffer.concat(chunks)));
//   });
// // Reads a fragment's data from S3 and returns (Promise<Buffer>)
// // https://github.com/awsdocs/aws-sdk-for-javascript-v3/blob/main/doc_source/s3-example-creating-buckets.md#getting-a-file-from-an-amazon-s3-bucket
// async function readFragmentData(ownerId, id) {
//   // Create the GET API params from our details
//   const params = {
//     Bucket: process.env.AWS_S3_BUCKET_NAME,
//     // Our key will be a mix of the ownerID and fragment id, written as a path
//     Key: `${ownerId}/${id}`,
//   };

//   // Create a GET Object command to send to S3
//   const command = new GetObjectCommand(params);

//   try {
//     // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
//     const data = await s3Client.send(command);
//     // Convert the ReadableStream to a Buffer
//     return streamToBuffer(data.Body);
//   } catch (err) {
//     const { Bucket, Key } = params;
//     logger.error({ err, Bucket, Key }, 'Error streaming fragment data from S3');
//     throw new Error('unable to read fragment data');
//   }
// }
// // Read a fragment's data from memory db. Returns a Promise
// // function readFragmentData(ownerId, id) {
// //   return data.get(ownerId, id);
// // }

// // Get a list of fragment ids/objects for the given user from memory db. Returns a Promise
// async function listFragments(ownerId, expand = false) {
//   const fragments = await metadata.query(ownerId);

//   // If we don't get anything back, return empty array
//   if (!fragments || fragments.length === 0) {
//     return [];
//   }

//   // If we're supposed to give expanded fragments, parse them from JSON strings
//   if (expand) {
//     return fragments.map((fragment) => {
//       const parsed = typeof fragment === 'string' ? JSON.parse(fragment) : fragment;
//       return parsed;
//     });
//   }

//   // Otherwise, map to only send back the ids
//   return fragments.map((fragment) => {
//     const parsed = typeof fragment === 'string' ? JSON.parse(fragment) : fragment;
//     return parsed.id;
//   });
// }

// // Delete a fragment's metadata and data from memory db. Returns a Promise
// // Delete a fragment's metadata and data from memory db and S3. Returns a Promise
// async function deleteFragment(ownerId, id) {
//   // Check if metadata exists - if not, throw error to match expected behavior
//   const metadataExists = await metadata.get(ownerId, id);
//   if (!metadataExists) {
//     throw new Error(`missing entry for primaryKey=${ownerId} and secondaryKey=${id}`);
//   }

//   // Delete metadata (we know it exists)
//   await metadata.del(ownerId, id);

//   // Delete data from S3 if it exists
//   try {
//     const params = {
//       Bucket: process.env.AWS_S3_BUCKET_NAME,
//       Key: `${ownerId}/${id}`,
//     };
//     const command = new DeleteObjectCommand(params);
//     await s3Client.send(command);
//   } catch (err) {
//     // Log the error but don't throw - the metadata is already deleted
//     // and we don't want to fail the operation if S3 deletion fails
//     logger.error({ err, ownerId, id }, 'Error deleting fragment data from S3');
//   }
// }
// // async function deleteFragment(ownerId, id) {
// //   // Check if metadata exists - if not, throw error to match expected behavior
// //   const metadataExists = await metadata.get(ownerId, id);
// //   if (!metadataExists) {
// //     throw new Error(`missing entry for primaryKey=${ownerId} and secondaryKey=${id}`);
// //   }

// //   // Delete metadata (we know it exists)
// //   await metadata.del(ownerId, id);

// //   // Delete data if it exists (don't throw if data doesn't exist)
// //   const dataExists = await data.get(ownerId, id);
// //   if (dataExists) {
// //     await data.del(ownerId, id);
// //   }
// // }

// module.exports.listFragments = listFragments;
// module.exports.writeFragment = writeFragment;
// module.exports.readFragment = readFragment;
// module.exports.writeFragmentData = writeFragmentData;
// module.exports.readFragmentData = readFragmentData;
// module.exports.deleteFragment = deleteFragment;
const s3Client = require('./s3Client');
const dynamodbClient = require('./dynamodbClient');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { PutCommand, GetCommand, DeleteCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
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
    logger.error(
      { err, TableName: params.TableName },
      'Error writing fragment metadata to DynamoDB'
    );
    throw new Error('unable to write fragment metadata');
  }
}

// Read a fragment's metadata from DynamoDB. Returns a Promise<Object>
async function readFragment(ownerId, id) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: {
      ownerId: ownerId,
      id: id,
    },
  };

  const command = new GetCommand(params);

  try {
    const result = await dynamodbClient.send(command);
    return result.Item || null;
  } catch (err) {
    logger.error(
      { err, TableName: params.TableName, ownerId, id },
      'Error reading fragment metadata from DynamoDB'
    );
    throw new Error('unable to read fragment metadata');
  }
}

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
    logger.error(
      { err, Bucket: params.Bucket, Key: params.Key },
      'Error uploading fragment data to S3'
    );
    throw new Error('unable to upload fragment data');
  }
}

// Convert S3 stream to Buffer
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

// Reads a fragment's data from S3 and returns (Promise<Buffer>)
async function readFragmentData(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const command = new GetObjectCommand(params);

  try {
    const data = await s3Client.send(command);
    return streamToBuffer(data.Body);
  } catch (err) {
    logger.error(
      { err, Bucket: params.Bucket, Key: params.Key },
      'Error streaming fragment data from S3'
    );

    // REQUIRED ERROR HANDLING — matches assignment spec
    if (
      err.message.includes('missing entry') ||
      err.message.includes('fragment not found') ||
      err.message.includes('NoSuchKey')
    ) {
      throw new Error('fragment not found');
    }

    throw new Error('unable to read fragment data');
  }
}

// Delete only the raw data object from S3
async function deleteFragmentData(ownerId, id) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  const command = new DeleteObjectCommand(params);

  try {
    await s3Client.send(command);
  } catch (err) {
    logger.error(
      { err, Bucket: params.Bucket, Key: params.Key },
      'Error deleting fragment data from S3'
    );
    throw new Error('unable to delete fragment data');
  }
}

// Get a list of fragments from DynamoDB
async function listFragments(ownerId, expand = false) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    KeyConditionExpression: 'ownerId = :ownerId',
    ExpressionAttributeValues: {
      ':ownerId': ownerId,
    },
  };

  const command = new QueryCommand(params);

  try {
    const result = await dynamodbClient.send(command);
    const fragments = result.Items || [];

    if (fragments.length === 0) {
      return [];
    }

    if (expand) {
      return fragments;
    }

    return fragments.map((fragment) => fragment.id);
  } catch (err) {
    logger.error({ err, ownerId }, 'Error listing fragments from DynamoDB');
    throw new Error('unable to list fragments');
  }
}

// Delete fragment metadata and data
async function deleteFragment(ownerId, id) {
  try {
    // Check if metadata exists first
    const metadata = await readFragment(ownerId, id);
    if (!metadata) {
      throw new Error('fragment not found');
    }

    // Delete metadata from DynamoDB
    const params = {
      TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
      Key: {
        ownerId: ownerId,
        id: id,
      },
    };

    const command = new DeleteCommand(params);
    await dynamodbClient.send(command);

    // Attempt S3 delete
    try {
      await deleteFragmentData(ownerId, id);
    } catch (err) {
      // If S3 object does not exist, still treat as deleted
      if (err.message.includes('NoSuchKey') || err.message.includes('not found')) {
        // do nothing
      } else {
        logger.warn(
          { err, ownerId, id },
          'Error deleting fragment data from S3, continuing with metadata deletion'
        );
      }
    }
  } catch (err) {
    if (err.message.includes('missing entry') || err.message.includes('fragment not found')) {
      throw new Error('fragment not found');
    }
    throw err;
  }

  logger.debug(`deleteFragment called - ownerId: ${ownerId}, id: ${id}`);
}

module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;
