const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
});

// return amount of people currently connected to the chat
module.exports = async (event) => {
  let chatUrl;
  try {
    chatUrl = event.queryStringParameters.chatUrl;
  } catch (e) {
    return {
      statusCode: 403,
      body: 'Invalid token: ' + JSON.stringify(e),
    };
  }

  const putParams = {
    TableName: process.env.CONNECTIONS_TABLE_NAME,
    Item: {
      connectionId: event.requestContext.connectionId, // socket id
      chatUrl,
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
