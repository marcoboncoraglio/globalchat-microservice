const DynamoDB = require('aws-sdk').DynamoDB;
const ApiGatewayManagementApi = require('aws-sdk').ApiGatewayManagementApi;
const uuidv4 = require('uuid/v4');

const ddb = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
});

const {
  CONNECTIONS_TABLE_NAME,
  CHATROOMS_TABLE_NAME,
  MESSAGES_TABLE_NAME,
} = process.env;

module.exports = async (event) => {
  let chatId;
  const reqBody = JSON.parse(event.body);
  const newChatRoom = reqBody.newChatRoom;

  // pass name and participants to create new chat room if optional newChatRoom attribute is passed in body
  if (newChatRoom) {
    chatId = uuidv4();
    const chatRoomParams = {
      TableName: CHATROOMS_TABLE_NAME,
      Item: {
        ...newChatRoom,
        chatId,
        participants: ddb.createSet(newChatRoom.participants),
      },
    };

    try {
      await ddb.put(chatRoomParams).promise();
    } catch (err) {
      return {
        statusCode: 500,
        body: 'Failed to create chatroom in DB: ' + JSON.stringify(err),
      };
    }
  }

  // author, text
  const message = JSON.parse(event.body).message;
  if (!chatId) {
    chatId = message.chatId;
  }

  const messageParams = {
    TableName: MESSAGES_TABLE_NAME,
    Item: {
      ...message,
      chatId,
      time: new Date().getTime().toString(),
    },
  };

  try {
    await ddb.put(messageParams).promise();
  } catch (err) {
    return {
      statusCode: 500,
      body: 'Failed to add message to DB: ' + JSON.stringify(err),
    };
  }

  // get all participants (userIds) in chat where the message was sent
  const participantsParams = {
    AttributesToGet: ['participants'],
    Key: {
      chatId,
    },
    TableName: CHATROOMS_TABLE_NAME,
  };

  let participants;
  try {
    participants = await ddb.get(participantsParams).promise();
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  // there has to be a way that is better than this...
  participants = JSON.parse(JSON.stringify(participants))
    .Item.participants.toString()
    .split(',');

  // build query
  var connectionsParamObject = {};
  var index = 0;
  participants.forEach(function (value) {
    index++;
    var titleKey = ':participant' + index;
    connectionsParamObject[titleKey.toString()] = value;
  });

  const connectionsParams = {
    TableName: CONNECTIONS_TABLE_NAME,
    FilterExpression:
      'userId IN (' + Object.keys(connectionsParamObject).toString() + ')',
    ExpressionAttributeValues: connectionsParamObject,
    ProjectionExpression: 'connectionId',
  };

  // TODO: make query instead of scan
  let connectionIds;
  try {
    connectionIds = await ddb.scan(connectionsParams).promise();
  } catch (e) {
    console.log('error: ', e);
    return { statusCode: 500, body: e.stack };
  }

  const apigwManagementApi = new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint:
      event.requestContext.domainName + '/' + event.requestContext.stage,
  });

  const postCalls = connectionIds.Items.map(async ({ connectionId }) => {
    try {
      await apigwManagementApi
        .postToConnection({
          ConnectionId: connectionId,
          Data: JSON.stringify({ ...message, chatId }),
        })
        .promise();
    } catch (e) {
      if (e.statusCode === 410) {
        console.log(`Found stale connection, deleting ${connectionId}`);
        await ddb
          .delete({ TableName: CONNECTIONS_TABLE_NAME, Key: { connectionId } })
          .promise();
      } else {
        throw e;
      }
    }
  });

  try {
    await Promise.all(postCalls);
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  return { statusCode: 200, body: 'Data sent.' };
};
