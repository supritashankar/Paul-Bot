const
  brain = require('./brain'),
  Wit = require('node-wit').Wit,
  log = require('node-wit').log,
  config = require('config'),
  skills = require('./skills');


const WIT_TOKEN = config.get('WIT').serverAccessToken;

const sessions = {};

const findOrCreateSession = (fbid) => {
  var sessionId;
  // Let's see if we already have a session for the user fbid
  Object.keys(sessions).forEach(k => {
    if (sessions[k].fbid === fbid) {
      // Yep, got it!
      sessionId = k;
    }
  });
  if (!sessionId) {
    // No session found for user fbid, let's create a new one
    sessionId = new Date().toISOString();
    sessions[sessionId] = {fbid: fbid, context: {}};
  }
  return sessionId;
};

// Our bot actions
const actions = {
  send(request, response) {
    const sessionId = request.sessionId;
    const text = response.text;
    const recipientId = sessions[sessionId].fbid;
    if (recipientId) {
      return skills.sendTextMessage(recipientId, text)
    } else {
      console.error('Oops! Couldn\'t find user for session:', sessionId);
      // Giving the wheel back to our bot
      return Promise.resolve()
    }
  },
  getMessage(request){
    var context = request.context;
    return new Promise(function(resolve, reject) {
      var result = {
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"button",
            "text": "Here are some things people typically ask me:",
            "buttons":[
              {
                "type":"postback",
                "title":"Forgot password",
                "payload":"FORGOT_PASSWORD"
              },
              {
                "type":"postback",
                "title":"Forgot account info",
                "payload":"FORGOT_ACCOUNT"
              },
              {
                "type":"postback",
                "title":"Issue with refund",
                "payload":"REFUND_ISSUE"
              }
            ]
          }
        }
      };
      context.newmessage = JSON.stringify(result);
      return resolve(context);
    });
  }
};

const wit = new Wit({
  accessToken: WIT_TOKEN,
  actions,
  logger: new log.Logger(log.INFO)
});

brain.onReceivedMessage(function(message, reply) {
  console.log('\n\n [messageHandler] GOT A MESSAGE: ' + JSON.stringify(message) + '\n\n');

  if (!message.message) {
    return;
  }

  const text = message.message.text;

  console.log('Got this: "', text, '"');
  const sessionId = findOrCreateSession(message.sender.id);

  wit.runActions(
      sessionId, // the user's current session
      text, // the user's message
      sessions[sessionId].context // the user's current session state
    ).then((context) => {
      console.log('Waiting for next user messages');
      sessions[sessionId].context = context;
    })
    .catch((err) => {
      console.error('Oops! Got an error from Wit: ', err.stack || err);
    });

  // switch (text) {
  //   case "knock knock": {
  //     reply.textMessage("Who's there?");
  //     break;
  //   }
  //   case "help": {
      // reply.genericMessage({
      //   "attachment":{
      //     "type":"template",
      //     "payload":{
      //       "template_type":"button",
      //       "text": "Here are some things people typically ask me:",
      //       "buttons":[
      //         {
      //           "type":"postback",
      //           "title":"Forgot password",
      //           "payload":"FORGOT_PASSWORD"
      //         },
      //         {
      //           "type":"postback",
      //           "title":"Forgot account info",
      //           "payload":"FORGOT_ACCOUNT"
      //         },
      //         {
      //           "type":"postback",
      //           "title":"Issue with refund",
      //           "payload":"REFUND_ISSUE"
      //         }
      //       ]
      //     }
  //       }
  //     });
  //
  //     setTimeout(function() {
  //       reply.typingOn();
  //     }, 1000);
  //
  //     setTimeout(function() {
  //       reply.quickReply('Did any of that help? :)', [
  //         {
  //           "content_type":"text",
  //           "title":"Yus, thank you ^_^",
  //           "payload":"CONCLUSION"
  //         },
  //         {
  //           "content_type":"text",
  //           "title":"Moarrr help!",
  //           "payload":"NEED_MORE_HELP"
  //         }
  //       ]);
  //       reply.typingOff();
  //     }, 3500);
  //     break;
  //   }
  //   default: {
  //     reply.textMessage("Hmm, does any of this help? :O");
  //     reply.genericMessage(
  //       {
  //         attachment: {
  //             type: "template",
  //             payload: {
  //                 template_type: "generic",
  //                 elements: [{
  //                     title: "Forgot my password",
  //                     subtitle: "Help resetting your password.",
  //                     item_url: "https://paypal.com/support/forgotPassword",
  //                     buttons: [{
  //                         type: "web_url",
  //                         url: "https://paypal.com",
  //                         title: "View in browser"
  //                     }, {
  //                         type: "postback",
  //                         title: "Help me with this",
  //                         payload: "FORGOT_PASSWORD",
  //                     }],
  //                 }, {
  //                     title: "Forgot my account details",
  //                     subtitle: "Help remembering your PayPal account details.",
  //                     item_url: "https://www.oculus.com/en-us/touch/",
  //                     buttons: [{
  //                         type: "web_url",
  //                         url: "https://paypal.com",
  //                         title: "View in browser"
  //                     }, {
  //                         type: "postback",
  //                         title: "Help me with this",
  //                         payload: "FORGOT_ACCOUNT_DETAILS",
  //                     }]
  //                 }, {
  //                     title: "Where's my refund?",
  //                     subtitle: "Help tracking your refund status.",
  //                     item_url: "https://www.oculus.com/en-us/touch/",
  //                     buttons: [{
  //                         type: "web_url",
  //                         url: "https://paypal.com",
  //                         title: "View in browser"
  //                     }, {
  //                         type: "postback",
  //                         title: "Help me with this",
  //                         payload: "HELP_WITH_REFUNDS",
  //                     }]
  //                 }]
  //             }
  //         }
  //     }
  //     )
  //   }
  // }
});
