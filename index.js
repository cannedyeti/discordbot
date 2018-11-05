const botconfig = require("./botconfig.json");
const Discord = require('discord.js');
const bot = new Discord.Client();

// trent id
const trentID = botconfig.trentID; 
const nickID = botconfig.nickID;

// shiffle function
function Shuffle(o) {
	for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};

bot.on('ready', async () => {
    console.log(`${bot.user.username} is live!`);
})

// 20% of Nicks posts will automaticall be reposts
const random = function() {
    var num = Math.random();
    if(num > .8){
        return true;
    }
    return false;
}
// react to nicks messages and call out reposts
// nick id = 116707486773280776
bot.on('message', (async function (message) {
    if(message.author.id === trentID) {
        return message.channel.send("Fuck off Trent.")
    }

    // if this is a DM
    if(message.channel.type === "dm") return;

    let prefix = botconfig.prefix;
    let messageArray = message.content.split(' ')
    let cmd = messageArray[0];
    let args = messageArray.slice(1);

    if(cmd === `${prefix}help`) {
        let helpEmbed = new Discord.RichEmbed()
        .setTitle('Command Help')
        .setDescription('Here is a list of commands and usage')
        .setColor('#FF000')
        .addField('?pickTeams', '<teamOneName teamTwoName> - Team names not required')
        .addField('?say', '<message for bot to say>')
        .addField('?purge', '<number of recent messages to delete> - Must be Admin');

        message.channel.send(helpEmbed);
    }

    // Pick teams function
    if(cmd === `${prefix}pickTeams`) {
        var teamOne = "Team Alpha", teamTwo = "Team Beta", response = null;
        let insults = [" you bafoon.", " Dipshit.", ". I bet that really knackers your day.", ". You should know this by now. Stop making me tell you, asshole."]
        let channel = message.member.voiceChannel.members;
        
        if(args.length == 2) {
            teamOne = "Team "+ args[0];
            teamTwo = "Team " + args[1];
        }
        // catch if there are less than 10 people
        if(channel.array().length !== 10) {
            response = message.channel.send(`You need 10 people to pick teams${insults[Math.floor(Math.random()*3)]}`);
        } else  {
            channel = channel.array();
            let users = Shuffle(channel);
            let richEmbed = new Discord.RichEmbed()
            .setDescription("League of Legends Teams")
            .setColor('#FF0000')
            .addField(teamOne, `${users[0]}, ${users[2]}, ${users[4]}, ${users[6]}, ${users[8]}`)
            .addField(teamTwo, `${users[1]}, ${users[3]}, ${users[5]}, ${users[7]}, ${users[9]}`);
            response = message.channel.send(richEmbed);
        }
        message.delete().catch(O_o=>{});
        return response;
    }

    if(cmd === `${prefix}say`) {
        message.delete().catch(O_o=>{});
        return message.channel.send(messageArray.slice(1).join(" "));
    }



    if(cmd === `${prefix}purge`) {
        if(message.member.hasPermission("MANAGE_MESSAGES")) {
            let numberofmessages = messageArray[1];
            let test = parseInt(numberofmessages);
            if (isNaN(test)) {
                return message.channel.send(`What the fuck is ${numberofmessages}? Answer: Not a fucking number, asshole.`);
            }
            let messagecount = parseInt(numberofmessages) + 1;
            message.channel.fetchMessages({ limit: messagecount })
            .then(messages => message.channel.bulkDelete(messages));
            return message.channel.send(`Successfully deleted ${numberofmessages} messages.`)
        } else {
            return message.channel.send(`You can't do that shit you fucking pleb.`);
        }
    }

    if (message.author.id == nickID && (message.attachments.size > 0 || message.content.includes('.com')) && random()) {
        await message.react('🇷');
        await message.react('🇪');
        await message.react('🇵');
        await message.react('🇴');
        await message.react('🇸');
        await message.react('🇹');
   } 
}));


bot.login(botconfig.token);

