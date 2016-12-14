/**
 * A Bot for Slack!
 */


/**
 * Define a function for initiating a conversation on installation
 * With custom integrations, we don't have a way to find out who installed us, so we can't message them :(
 */

function onInstallation(bot, installer) {
    if (installer) {
        bot.startPrivateConversation({user: installer}, function (err, convo) {
            if (err) {
                console.log(err);
            } else {
                convo.say('I am a bot that has just joined your team');
                convo.say('You must now /invite me to a channel so that I can be of use!');
            }
        });
    }
}


/**
 * Configure the persistence options
 */

var config = {};
if (process.env.MONGOLAB_URI) {
    var BotkitStorage = require('botkit-storage-mongo');
    config = {
        storage: BotkitStorage({mongoUri: process.env.MONGOLAB_URI}),
    };
} else {
    config = {
        json_file_store: ((process.env.TOKEN)?'./db_slack_bot_ci/':'./db_slack_bot_a/'), //use a different name if an app or CI
    };
}

/**
 * Are being run as an app or a custom integration? The initialization will differ, depending
 */

if (process.env.TOKEN || process.env.SLACK_TOKEN) {
    //Treat this as a custom integration
    var customIntegration = require('./lib/custom_integrations');
    var token = (process.env.TOKEN) ? process.env.TOKEN : process.env.SLACK_TOKEN;
    var controller = customIntegration.configure(token, config, onInstallation);
} else if (process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.PORT) {
    //Treat this as an app
    var app = require('./lib/apps');
    var controller = app.configure(process.env.PORT, process.env.CLIENT_ID, process.env.CLIENT_SECRET, config, onInstallation);
} else {
    console.log('Error: If this is a custom integration, please specify TOKEN in the environment. If this is an app, please specify CLIENTID, CLIENTSECRET, and PORT in the environment');
    process.exit(1);
}


/**
 * A demonstration for how to handle websocket events. In this case, just log when we have and have not
 * been disconnected from the websocket. In the future, it would be super awesome to be able to specify
 * a reconnect policy, and do reconnections automatically. In the meantime, we aren't going to attempt reconnects,
 * WHICH IS A B0RKED WAY TO HANDLE BEING DISCONNECTED. So we need to fix this.
 *
 * TODO: fixed b0rked reconnect behavior
 */
// Handle events related to the websocket connection to Slack
controller.on('rtm_open', function (bot) {
    console.log('** The RTM api just connected!');
});

controller.on('rtm_close', function (bot) {
    console.log('** The RTM api just closed');
    // you may want to attempt to re-open
});


/**
 * Core bot logic
 */

var burgers = [
    {
        "location": "https://www.google.com/maps/dir/160+Varick+Street,+New+York,+NY/The+Kati+Roll+Company,+99+Macdougal+Street,+New+York,+NY+10012/@40.7282033,-74.0055599,17z/data=!3m1!4b1!4m13!4m12!1m5!1m1!1s0x89c259f494b711c5:0xc0df2dedc3840f1e!2m2!1d-74.0053737!2d40.7267926!1m5!1m1!1s0x89c2599227e6cc1b:0xb4d5e12eaca2e69!2m2!1d-74.001022!2d40.729614",
        "restaurant": "The Kati Roll Company"
    },
    {
        "location": "https://www.google.com/maps/place/Better+Being+Underground/@40.730283,-74.005134,17z/data=!3m1!4b1!4m2!3m1!1s0x89c25992c2fb95f7:0x34aad58f90284bb7",
        "restaurant": "Better Being Underground",
        "details": "Today's menu is <https://betterbeingunderground.wordpress.com/|here>. Better hurry, though. They start to run out of things after 1 p.m."
    },
    {
        "location": "https://www.google.com/maps/place/Better+Being+Underground/@40.730283,-74.005134,17z/data=!3m1!4b1!4m2!3m1!1s0x89c25992c2fb95f7:0x34aad58f90284bb7",
        "restaurant": "something",
        "details": "Today's menu is <https://betterbeingunderground.wordpress.com/|here>. Better hurry, though. They start to run out of things after 1 p.m."
    },
    {
        "location": "https://www.google.com/maps/place/Better+Being+Underground/@40.730283,-74.005134,17z/data=!3m1!4b1!4m2!3m1!1s0x89c25992c2fb95f7:0x34aad58f90284bb7",
        "restaurant": "something else",
        "details": "Today's menu is <https://betterbeingunderground.wordpress.com/|here>. Better hurry, though. They start to run out of things after 1 p.m."
    }
];



controller.on('bot_channel_join', function (bot, message) {
    bot.reply(message, "I'm here!")
});

//controller.hears(['hungry', 'feed me', 'food'], ['direct_mention', 'mention', 'direct_message'], function(bot,message) {

controller.hears(['pizza', 'za'], 'direct_message', function (bot, message) {
    getRec('pizza');
});

controller.hears('burger', 'direct_message', function (bot, message) {
    // Pick a number, 0 to the length of the restaurant list less one

    //bot.reply(message, burgers[pick]['restaurant']);
    getRec('burger');

});


function getRec(foodType) {
    var pick = Math.floor( Math.random() * (burgers.length - 1 ) );

    bot.reply(message, foodType);   

    return;
}


/**
 * AN example of what could be:
 * Any un-handled direct mention gets a reaction and a pat response!
 */
//controller.on('direct_message,mention,direct_mention', function (bot, message) {
//    bot.api.reactions.add({
//        timestamp: message.ts,
//        channel: message.channel,
//        name: 'robot_face',
//    }, function (err) {
//        if (err) {
//            console.log(err)
//        }
//        bot.reply(message, 'I heard you loud and clear boss.');
//    });
//});
