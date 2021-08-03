const DynamoDB = require('aws-sdk').DynamoDB;
const ApiGatewayManagementApi = require('aws-sdk').ApiGatewayManagementApi;

const ddb = new DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
});

const { CONNECTIONS_TABLE_NAME } = process.env;

module.exports = async (event) => {
  const message = JSON.parse(event.body).message;

  const connectionsParams = {
    TableName: CONNECTIONS_TABLE_NAME,
    FilterExpression: '#chatUrl = :chatUrl',
    ExpressionAttributeNames: {
      '#chatUrl': 'chatUrl',
    },
    ExpressionAttributeValues: { ':chatUrl': message.chatUrl },
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
          Data: JSON.stringify(message),
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
