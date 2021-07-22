const onConnect = require('./onconnect/onconnect');
const onDisconnect = require('./ondisconnect/ondisconnect');
const onSendMessage = require('./sendmessage/sendmessage');

exports.onConnect = onConnect;

exports.onDisconnect = onDisconnect;

exports.sendMessage = onSendMessage;
