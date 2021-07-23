const AWS = require('aws-sdk');
const uuidv4 = require('uuid/v4');

const ddb = new AWS.DynamoDB.DocumentClient({
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

  const newChatRoom = JSON.parse(event.body).newChatRoom;

  // pass name and participants to create new chat room
  if (newChatRoom) {
    chatId = uuidv4();
    const putParams = {
      TableName: CHATROOMS_TABLE_NAME,
      Item: {
        name: newChatRoom.name,
        chatId,
        participants: ddb.createSet(newChatRoom.participants),
      },
    };

    try {
      await ddb.put(putParams).promise();
    } catch (err) {
      return {
        statusCode: 500,
        body: 'Failed to create chatroom in DB: ' + JSON.stringify(err),
      };
    }
  }

  // author, text, chatId (if existing chat)
  const message = JSON.parse(event.body).message;

  const putParams = {
    TableName: MESSAGES_TABLE_NAME,
    Item: {
      ...message,
      chatId: chatId ? chatId : message.chatId,
      time: new Date().getTime().toString(),
    },
  };

  try {
    await ddb.put(putParams).promise();
  } catch (err) {
    return {
      statusCode: 500,
      body: 'Failed to add message to DB: ' + JSON.stringify(err),
    };
  }

  // get all participants (userIds) using chatId
  const participantsParams = {
    AttributesToGet: ['participants'],
    Key: {
      S: 'chatId',
    },
    TableName: CHATROOMS_TABLE_NAME,
  };

  let participants;
  try {
    participants = await ddb.getItem(participantsParams).promise();
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  console.log('participants: ', participants);

  // get all online connection mapped to userId

  // distribute message object to all online participants through socket

  let connectionIds;
  try {
    connectionIds = await ddb
      .scan({
        TableName: CONNECTIONS_TABLE_NAME,
        ProjectionExpression: 'connectionId',
      })
      .promise();
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint:
      event.requestContext.domainName + '/' + event.requestContext.stage,
  });

  const postCalls = connectionIds.Items.map(async ({ connectionId }) => {
    try {
      await apigwManagementApi
        .postToConnection({ ConnectionId: connectionId, Data: message.text })
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
