const PubSub = require('pubsub-js');
const request = require('request');
const config = require('../config/default.json');
const skills = require('./skills');

function receive(messageEvent) {
  console.log('\n\n[BRAIN] RECEIVED MESSAGE ' + JSON.stringify(messageEvent) + '\n\n');
  PubSub.publish('gotNewMessage', messageEvent);
}

function reply(message) {
  console.log('FROM reply(): ', JSON.stringify(message));
  const senderId = message.sender.id;

  return {
    imageMessage: skills.sendImageMessage.bind(null, senderId),
    gifMessage: skills.sendGifMessage.bind(null, senderId),
    audioMessage: skills.sendAudioMessage.bind(null, senderId),
    videoMessage: skills.sendVideoMessage.bind(null, senderId),
    fileMessage: skills.sendFileMessage.bind(null, senderId),
    textMessage: skills.sendTextMessage.bind(null, senderId),
    buttonMessage: skills.sendButtonMessage.bind(null, senderId),
    genericMessage: skills.sendGenericMessage.bind(null, senderId),
    receiptMessage: skills.sendReceiptMessage.bind(null, senderId),
    quickReply: skills.sendQuickReply.bind(null, senderId),
    readReceipt: skills.sendReadReceipt.bind(null, senderId),
    typingOn: skills.sendTypingOn.bind(null, senderId),
    typingOff: skills.sendTypingOff.bind(null, senderId),
    accountLinking: skills.sendAccountLinking.bind(null, senderId),
    textMessage: skills.sendTextMessage.bind(null, senderId),
  }
}

module.exports = {
  receivedMessage: receive,
  onReceivedMessage: function(cb) {
    console.info('\n\nRECEIVED MESSAGE!\n\n');
    PubSub.subscribe('gotNewMessage', function(m, message) {
      cb(message, reply(message));
    });
  },
};
