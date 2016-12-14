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

var eateries = [
    {
        "name": "another pizza place",
        "proximity": "closest",
        "url": "www.burgers.com"
    },
    {
        "name": "pizzas-r-us",
        "proximity": "close",
        "url": "www.pizza.com"
    },
    {
        "name": "pizza unite",
        "proximity": "far",
        "url": "www.icecream.com"
    },
    {
        "name": "some pizza place",
        "proximity": "close",
        "url": "www.pizza.com"
    },
    {
        "name": "another burgers place",
        "proximity": "closest",
        "url": "www.burgers.com"
    },
    {
        "name": "burgers-r-us",
        "proximity": "close",
        "url": "www.pizza.com"
    },
    {
        "name": "burgers unite",
        "proximity": "far",
        "url": "www.icecream.com"
    },
    {
        "name": "some burgers place",
        "proximity": "close",
        "url": "www.pizza.com"
    },
    {
        "name": "another dessert place",
        "proximity": "closest",
        "url": "www.burgers.com"
    },
    {
        "name": "dessert-r-us",
        "proximity": "close",
        "url": "www.pizza.com"
    },
    {
        "name": "dessert unite",
        "proximity": "far",
        "url": "www.icecream.com"
    },
    {
        "name": "some dessert place",
        "proximity": "close",
        "url": "www.pizza.com"
    }
];


var eateryTypes = [
    {
        "pizza": ["some pizza place", "another pizza place", "pizzas-r-us", "pizza unite"]
    },
    {
        "burger": ["some burger place", "another burger place", "burgers-r-us", "burger unite"]
    },
    {
        "dessert": ["some desserts place", "another desserts place", "desserts-r-us", "desserts unite"]
    }
];


controller.on('bot_channel_join', function (bot, message) {
    bot.reply(message, "I'm here!")
});

//controller.hears(['hungry', 'feed me', 'food'], ['direct_mention', 'mention', 'direct_message'], function(bot,message) {

controller.hears(['pizza', 'za'], 'direct_message', function (bot, message) {
    getRec(bot, message, 'pizza');
});

controller.hears(['sweet', 'dessert'], 'direct_message', function (bot, message) {
    getRec(bot, message, 'dessert');
});

controller.hears(['burger', 'burgers'], 'direct_message', function (bot, message) {
    getRec(bot, message, 'burger');
});


function getRec(bot, message, foodType) {
    var pick = Math.floor( Math.random() * (eateryTypes['pizza'].length - 1 ) );

    var msg = eateries[pick]['name'];

    bot.reply(message, msg);   

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
