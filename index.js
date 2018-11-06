require('es6-promise').polyfill();
require('isomorphic-fetch');
const botconfig = require("./botconfig.json");
const Discord = require('discord.js');
const bot = new Discord.Client();
const ascii = require('ascii-art');

const trentID = botconfig.trentID; 
const nickID = botconfig.nickID;
const riotKey = botconfig.riotAPIKey;
const ggKey = botconfig.champggKey;
var currentPatch, leagueChampionData, leagueItemData;

// get static league data and current patch
fetch('https://ddragon.leagueoflegends.com/api/versions.json')
.then(function(res) {
    return res.json();
}).then(function(patch) {
    return currentPatch = patch[0];
}).then(function() {
    fetch('http://ddragon.leagueoflegends.com/cdn/' + currentPatch + '/data/en_US/champion.json')
    .then(function(response) {
        return response.json();
    })
    .then(function(json) {
        return leagueChampionData = json;
    })
}).then(function() {
    fetch('http://ddragon.leagueoflegends.com/cdn/' + currentPatch + '/data/en_US/item.json')
    .then(res => {
        return res.json();
    }).then(res => {
        return leagueItemData = res;
    })
})


// shuffle function
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

bot.on('message', (async function (message) {
    if(message.author.id === trentID && random()) {
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
        .addField('?say', '<message for bot to say>')
        .addField('?purge', '<number of recent messages to delete> - Must be Admin')
        .addField('?ascii', '<text to make into ascii-art>')
        .addField('?pickTeams', '<teamOneName teamTwoName> - Team names not required')
        .addField('?mastery', '<summoner name>')
        .addField('?build', '<champname>')
        .addField('?champ', '<league champion info>')

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

    // react to nicks messages and call out reposts
    if (message.author.id == nickID && (message.attachments.size > 0 || message.content.includes('.com')) && random()) {
        await message.react('🇷');
        await message.react('🇪');
        await message.react('🇵');
        await message.react('🇴');
        await message.react('🇸');
        await message.react('🇹');
    }
    if(cmd === `${prefix}champ`) {
        var champ = args[0].toLowerCase();
        champ = champ.charAt(0).toUpperCase() + champ.slice(1);
        var champData = leagueChampionData.data[champ];
        let richEmbed = new Discord.RichEmbed()
        .setTitle(champ)
        .setColor("#0000ff")
        .addField("About", champData.blurb)
        .setImage("http://ddragon.leagueoflegends.com/cdn/" + currentPatch + "/img/champion/" + champ + ".png")
        message.channel.send(richEmbed)
    } 
    if(cmd === `${prefix}mastery`) {
        var summoner = args.join(''), champArr;
        fetch('https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/' + summoner + '?api_key=' + riotKey)
        .then(res => {
            return res.json();
        }).then(res => {
            var name = res.name;
            var sID = res.id;
            fetch('https://na1.api.riotgames.com/lol/champion-mastery/v3/champion-masteries/by-summoner/' + sID + '?api_key=' + riotKey)
            .then(res => {
                return res.json();
            }).then(res => {
                champArr = res.slice(0, 5);
                var topChamps = [];
                champArr.forEach(single => {
                    for(champ in leagueChampionData.data){
                        if(leagueChampionData.data[champ].key == single.championId) {
                            topChamps.push({"champion": leagueChampionData.data[champ], "points": single.championPoints})
                        }
                    }
                })
                let richEmbed = new Discord.RichEmbed()
                .setTitle(name + "'s Top Played Champions")
                .setColor("#0000ff")
                .addField(topChamps[0].champion.id, topChamps[0].points + " mastery points")
                .addField(topChamps[1].champion.id, topChamps[1].points + " mastery points")
                .addField(topChamps[2].champion.id, topChamps[2].points + " mastery points")
                .addField(topChamps[3].champion.id, topChamps[3].points + " mastery points")
                .addField(topChamps[4].champion.id, topChamps[4].points + " mastery points")
                .setImage("http://ddragon.leagueoflegends.com/cdn/" + currentPatch + "/img/champion/" + topChamps[0].champion.id + ".png")
                message.channel.send(richEmbed)
            })
        })
    }
    if(cmd === `${prefix}ascii`) {
        ascii.font(args.join(' '), 'Doom', function(rendered){
            rendered = rendered.trimRight();
            message.channel.send(rendered, {
                code: 'md'
            })
        })
    }
    if(cmd === `${prefix}build`) {
        var champ = args[0].toLowerCase(), champId;
        champ = champ.charAt(0).toUpperCase() + champ.slice(1);
        champId = leagueChampionData.data[champ].key;
        var build = {"most": [], "highest": [], skillOrder: ''};
        fetch('http://api.champion.gg/v2/champions/' + champId + '?limit=200&champData=hashes&api_key=' + ggKey)
        .then(res=> {
            return res.json();
        }).then(res => {
            var mostBuiltHash = res[0].hashes.finalitemshashfixed.highestCount.hash;
            var highestBuildHash = res[0].hashes.finalitemshashfixed.highestWinrate.hash;
            build.skillOrder = res[0].hashes.skillorderhash.highestCount.hash.split("-").slice(1);
            mostBuiltHash = mostBuiltHash.split("-").slice(1);
            highestBuildHash = highestBuildHash.split("-").slice(1);
            mostBuiltHash.forEach(item => {
                build.most.push(leagueItemData.data[item].name);
            })
            highestBuildHash.forEach(item => {
                build.highest.push(leagueItemData.data[item].name);
            })
        }).then(() => {
            console.log(champId)
            let richEmbed = new Discord.RichEmbed()
            .setTitle(champ + "'s Items")
            .setColor("#0000ff")
            .addField("Most built", build.most[0] + ", " + build.most[1] + ", " + build.most[2] + ", " + build.most[3] + ", " + build.most[4] + ", " + build.most[5])
            .addField("Highest winrate", build.highest[0] + ", " + build.highest[1] + ", " + build.highest[2] + ", " + build.highest[3] + ", " + build.highest[4] + ", " + build.highest[5])
            .addField("Skillorder", build.skillOrder.join("->"))
            .setImage("http://ddragon.leagueoflegends.com/cdn/" + currentPatch + "/img/champion/" + champ + ".png")
            message.channel.send(richEmbed)
        }) //end fetch
    }

}));


bot.login(botconfig.token);

