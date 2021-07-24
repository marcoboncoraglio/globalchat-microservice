const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
});

module.exports = async (event) => {
  let userId;
  try {
    userId = await authenticateToken(event.queryStringParameters.token);
  } catch (e) {
    return {
      statusCode: 403,
      body: 'Invalid token: ' + JSON.stringify(e),
    };
  }

  let chatRoomsParams = {
    TableName: CONNECTIONS_TABLE_NAME,
    FilterExpression: 'contains(#participants, :userId)',
    ExpressionAttributeNames: {
      '#participants': 'participants',
    },
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  };

  // get all chatrooms where the user is a participant
  let chatRooms;
  try {
    chatRooms = await ddb.scan(chatRoomsParams).promise();
  } catch (err) {
    return {
      statusCode: 500,
      body: 'Failed to connect: ' + JSON.stringify(err),
    };
  }

  // probably still need to parse the chatroom object
  let messagesParamObject = new Map();
  chatRooms.forEach((room) => messagesParamObject.set('chatId', room.chatId));

  // get all messages for the loaded chatrooms
  let messagesParams = {
    RequestItems: {
      TableName: MESSAGES_TABLE_NAME,
      Keys: [messagesParamObject],
    },
  };

  let messages;
  try {
    messages = await ddb.batchGet(messagesParams).promise();
  } catch (err) {
    return {
      statusCode: 500,
      body: 'Failed to connect: ' + JSON.stringify(err),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ ...chatRooms, ...messages }),
  };
};
