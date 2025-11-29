//src/model/data/aws/dynamodbClient.js
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const logger = require('../../../logger');

const fetchCredentials = () => {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    const creds = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN,
    };
    logger.debug('Applying custom DynamoDB credentials');
    return creds;
  }
};

const fetchEndpoint = () => {
  if (process.env.AWS_DYNAMODB_ENDPOINT_URL) {
    logger.debug(
      { endpoint: process.env.AWS_DYNAMODB_ENDPOINT_URL },
      'Using custom DynamoDB endpoint'
    );
    return process.env.AWS_DYNAMODB_ENDPOINT_URL;
  }
};

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: fetchCredentials(),
  endpoint: fetchEndpoint(),
});

// Create a Document Client for simplified object handling
module.exports = DynamoDBDocumentClient.from(dynamoClient);
