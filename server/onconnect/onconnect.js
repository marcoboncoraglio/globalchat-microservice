const AWS = require('aws-sdk');
const authenticateToken = require('../utils/jwt');

const ddb = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
});

// return last 50 messages for each chatroom where the user is a participant
module.exports = async (event) => {
  let userId;
  try {
    userId = await authenticateToken(event.queryStringParameters.token);
  } catch (e) {
    return {
      statusCode: 500,
      body: 'Failed to connect: ' + JSON.stringify(e),
    };
  }
  console.log('userId: ', userId);

  const putParams = {
    TableName: process.env.CONNECTIONS_TABLE_NAME,
    Item: {
      connectionId: event.requestContext.connectionId, // socket id
      userId,
    },
  };

  try {
    await ddb.put(putParams).promise();
  } catch (err) {
    return {
      statusCode: 500,
      body: 'Failed to connect: ' + JSON.stringify(err),
    };
  }

  return { statusCode: 200, body: 'Connected.' };
};
