import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

export async function closeAuction(auction) {
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: {id: auction.id},
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeValues: {
      ':status': 'CLOSED',
      },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  };

  await dynamodb.update(params).promise();
  
  const { title, seller, highestBid } = auction;
  const { amount, bidder } = highestBid;

  if (amount === 0) {
    await sqs.sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        'subject': `Your item "${title}" did not sell.`,
        'recipient': seller,
        'body': `Sorry! Your item "${title}" did not sell.`,
      }),
    }).promise();
    
    return;
  } 
  
  const notifyBidder = await sqs.sendMessage({
    QueueUrl: process.env.MAIL_QUEUE_URL,
    MessageBody: JSON.stringify({
      'subject': 'You won an auction!',
      'recipient': bidder,
      'body': `Congrats! You got yourself a "${title}" for $${amount}.`,
    }),
  }).promise();

  const notifySeller = await sqs.sendMessage({
    QueueUrl: process.env.MAIL_QUEUE_URL,
    MessageBody: JSON.stringify({
      'subject': `Your item "${title}" has been sold!`,
      'recipient': seller,
      'body': `Congrats! Your item "${title}" has been sold for $${amount}.`,
    }),
  }).promise();

  return Promise.all([notifySeller, notifyBidder]);
}
