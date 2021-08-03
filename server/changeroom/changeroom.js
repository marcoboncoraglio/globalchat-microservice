const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
});

module.exports = async (event) => {
  const chatUrl = JSON.parse(event.body.chatUrl);

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
      body: 'Failed to change room: ' + JSON.stringify(err),
    };
  }

  const connectionsParams = {
    TableName: CONNECTIONS_TABLE_NAME,
    FilterExpression: '#chatUrl = :chatUrl',
    ExpressionAttributeNames: {
      '#chatUrl': 'chatUrl',
    },
    ExpressionAttributeValues: { ':chatUrl': chatUrl },
  };

  // TODO: make query instead of scan
  let connectionIds;
  try {
    connectionIds = await ddb.scan(connectionsParams).promise();
  } catch (e) {
    console.log('error: ', e);
    return { statusCode: 500, body: e.stack };
  }

  //return number of connections from query
  return { statusCode: 200, body: 'Connected.' };
};
