const onConnect = require('./onconnect/onconnect');
const onDisconnect = require('./ondisconnect/ondisconnect');
const onSendMessage = require('./sendmessage/sendmessage');
const messagesApi = require('./messagesapi/messagesapi');

exports.onConnect = onConnect;

exports.onDisconnect = onDisconnect;

exports.sendMessage = onSendMessage;

exports.messagesApi = messagesApi;