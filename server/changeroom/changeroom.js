const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
});

const ApiGatewayManagementApi = require('aws-sdk').ApiGatewayManagementApi;

module.exports = async (event) => {
  const body = JSON.parse(event.body);
  const connectionId = event.requestContext.connectionId;
  const { chatUrl } = body;

  const putParams = {
    TableName: process.env.CONNECTIONS_TABLE_NAME,
    Item: {
      connectionId,
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
    TableName: process.env.CONNECTIONS_TABLE_NAME,
    FilterExpression: '#chatUrl = :chatUrl',
    ExpressionAttributeNames: {
      '#chatUrl': 'chatUrl',
    },
    ExpressionAttributeValues: { ':chatUrl': chatUrl },
    // add projection to connectionId
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

  const returnMsg = {
    message: 'Connected to ' + chatUrl,
    roomCount: connectionIds.Items.length,
    connectionId: connectionId,
  };

  try {
    await apigwManagementApi
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify(returnMsg),
      })
      .promise();
  } catch (e) {
    if (e.statusCode === 410) {
      console.log(`Found stale connection, deleting ${connectionId}`);
      await ddb
        .delete({
          TableName: process.env.CONNECTIONS_TABLE_NAME,
          Key: { connectionId },
        })
        .promise();
    } else {
      throw e;
    }
  }

  return { statusCode: 200, body: 'Changed room' };
};
