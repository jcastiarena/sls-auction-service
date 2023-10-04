import AWS from 'aws-sdk';
import validator from '@middy/validator';
import { transpileSchema } from '@middy/validator/transpile';
import createError from 'http-errors';
import getAuctionsSchema from '../lib/schemas/getAuctionsSchema';
import commonMiddleware from '../lib/commonMiddleware';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  const { status } = event.queryStringParameters;
  let auctions;

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusAndEndingAt',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeValues: {
      ':status': status
    },
    ExpressionAttributeNames: {
      '#status': 'status'
    }
  };

  try {
    console.log('Querying auctions with status: ' + status);
    const result = await dynamodb.query(params).promise();

    auctions = result.Items;
  } catch (error) {
    console.error('Error found: ' + error);
    throw createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions)
  };
}

export const handler = commonMiddleware(getAuctions).use(validator({
  eventSchema: transpileSchema(getAuctionsSchema),
  ajvOptions: {
    useDefaults: true,
    strict: true
  }
}));