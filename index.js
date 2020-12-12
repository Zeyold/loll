// Features:
//    Greets users when they join
//    Kick Users
//    Ban Users
//    Mute Users
//    Unmute Users
//    Purge Messages
//    Blacklisted Words
//    Add words to blacklist
//    Ping (for fun i guess)
//    Help/Commands
//    Antispam
'use strict';
const discord = require('discord.js');
const config = require("./config.json");
const client = new discord.Client();
const antispam = require('discord-anti-spam');
const spam = new antispam({
  warnThreshold: 20,
  maxBuffer: 10,
  maxInterval: 2000,
  banThreshold: 70000,
  kickThreshold: 7000,
  warnMessage: '{@user}, stop spamming!',
  kickMessage: '**{user_tag}** has been kicked for spamming!',
  banMessage: '**{user_tag}** has been banned for spamming!',
  maxDuplicatesWarning: 5,
  exemptPermissions: ['ADMINISTRATOR'],
  ignoreBots: true,
  verbose: true,
  ignoredUsers: [],
  exemptRoles: [],
  exemptUsers: ["Zeyold#0001"]
});

var blacklistedWords = ["nigger", "asshole"];
var prefix = 'ff.';

// Client on ready or when it starts
client.on('ready', () => {
  console.log('[#] Logged in as', client.user.tag);
  client.user.setActivity('ff.help', { type: 'LISTENING' });
});

// When someone joins, send a message here
client.on('guildMemberAdd', member => {
  var channel = member.guild.channels.cache.find(ch => ch.name === 'welcome'); // Find channel named "welcome"
  if (!channel) return;
  channel.send(`Welcome to the server, ${member}`); // Send welcome to the server
});

client.on('message', msg => {
  spam.message(msg) // Push each message into the antispam module

  if (!msg.guild) return; // If the message isn't in a server, don't reply

  // Start of Ban Function
  if (msg.content.startsWith(`${prefix}ban`)) {
    var user = msg.mentions.users.first();
    if (user) {
      var member = msg.guild.member(user);
      if (member) {
        if (msg.member.hasPermission('BAN_MEMBERS')) {
          member.ban({
            reason: 'Not following the rules',
          }).then(() => {
            msg.reply('Banned', user.tag);
          }).catch(err => {
            msg.reply('I cannot ban that user');
            console.error(err);
          });
        }
        if (!msg.member.hasPermission('BAN_MEMBERS')) {
          msg.reply('You do not have permissions to do that');
        }
      } else {
        msg.reply("That user isn't in this server");
      }
    } else {
      msg.reply("You didn't mention a user to ban");
    }
  }

  //     _____                    _       _____               _ _       
  //    |  ___| __ ___ _ __   ___| |__   |  ___|_ _ _ __ ___ (_) |_   _ 
  //    | |_ | '__/ _ \ '_ \ / __| '_ \  | |_ / _` | '_ ` _ \| | | | | |
  //    |  _|| | |  __/ | | | (__| | | | |  _| (_| | | | | | | | | |_| |
  //    |_|  |_|  \___|_| |_|\___|_| |_| |_|  \__,_|_| |_| |_|_|_|\__, |
  //                                                               |___/ 
  // Start of kick function
  if (msg.content.startsWith(`${prefix}kick`)) {
    var user = msg.mentions.users.first();
    if (user) {
      var member = msg.guild.member(user);
      if (member) {
        if (msg.member.hasPermission(['KICK_MEMBERS'])) {
          member.kick('Not following the rules').then(() => {
            msg.channel.send('Successfully Kicked!');
          }).catch(err => {
            msg.reply('I cannot kick that user');
            console.error(err);
          });
        }
        if (!msg.member.hasPermission('KICK_MEMBERS')) {
          msg.reply('You do not have permissions to do that');
        }
      } else {
          msg.reply("That user isn't in this server");
        }
    } else {
        msg.reply("You didn't mention a user to kick");
      }
    }

  // Start of mute function
  if (msg.content.startsWith(`${prefix}mute`)) {
    var user = msg.mentions.users.first();
    if (user) {
      var member = msg.guild.member(user);
      if (member) {
        if (msg.member.hasPermission(['MANAGE_ROLES'])) {
          let muted = msg.guild.roles.cache.find(role => role.name === "Muted");
          member.roles.add(muted)
          msg.reply(`Successfully Muted ${member}`);
        }
        if (!msg.member.hasPermission('MANAGE_ROLES')) {
          msg.reply('You do not have permissions to do that');
        }
      } else {
        msg.reply("This user isn't in this server");
      }
    } else {
      msg.reply("You didn't mention a user to mute");
    }
  }

  // Start of unmute function
  if (msg.content.startsWith(`${prefix}unmute`)) {
    var user = msg.mentions.users.first();
    if (user) {
      var member = msg.guild.member(user);
      if (member) {
        if (msg.member.hasPermission(['MANAGE_ROLES'])) {
        let muted = msg.guild.roles.cache.find(role => role.name === "Muted");
        member.roles.remove(muted)
        msg.reply(`Successfully Unmuted ${member}`)
      }
      if (!msg.member.hasPermission('MANAGE_ROLES')) {
        msg.reply('You do not have permissions to do that');
      }
      } else {
        msg.reply("This user isn't in this server");
      }
    } else {
      msg.reply("You didn't mention a user to unmute");
    }
  }

  // Start of purge function
  if (msg.content.startsWith(`${prefix}purge`)) {
    var args = msg.content.split(' ').slice(1);
    var amount = args.join('')

    if (!amount) return msg.reply('You must specify an amount of messages to erase');
    if (isNaN(amount)) return msg.reply('You must give a number');

    if (amount > 100) return msg.reply('You can not delete more than 100 messages');
    if (amount < 1) return msg.reply('You must delete at least 1 message');

    if (msg.member.hasPermission(['MANAGE_MESSAGES'])) {
      msg.channel.messages.fetch({
        limit: amount
      }).then(messages => {
        msg.channel.bulkDelete(messages);
        msg.channel.send(`Successfully Deleted ${amount} Messages!`)
      });
    }
    if (!msg.member.hasPermission('MANAGE_MESSAGES')) {
      msg.reply('You do not have permissions to do that');
    }
  }

  // Start of word blacklist function
  if (blacklistedWords.some(word => msg.content.toLowerCase().includes(word)) ) {
    if (!msg.member.hasPermission(['ADMINISTRATOR'])) {
      msg.delete()
      msg.channel.send(`${msg.member}, that word is now allowed.`);
    } else {
      if (msg.author.id === client.user.id) return;
      msg.reply(`You cannot say that word ${msg.member}! Even though you're admin you cannot say it!!`);
    }
  }

  // Start of add word to blacklist function
  if (msg.content.startsWith(`${prefix}addblacklist`)) {
    var args = msg.content.split(' ').slice(1);
    var word = args.join('')

    if (!word) return msg.reply('You must specify a word to blacklist');
    if (!isNaN(word)) return msg.reply('You cannot blacklist a number');
    blacklistedWords.push(word);
    msg.channel.send(`"${word}" has been blacklisted succesfully!`);
  }

  // Start of follow function
  if (msg.content == `${prefix}follow`) {
    var embed = new discord.MessageEmbed()
      .setTitle('FRENCH FAMILY')
      .setURL('https://discord.gg/vWrKPAp')
      .setColor('#020000')
      .setDescription(`   **YouTube**\nhttps://www.youtube.com/channel/UC7IJ08W5iPHNGCN41AR8JdQ \n\n   **Twitter**\nhttp://mobile.twitter.com/FFcodm \n\n   **Discord**\nhttps://discord.gg/vWrKPAp \n\n   **Linktree**\nhttps://linktr.ee/ffcodm \n\n   **Mail**\nfrenchfamilycod@gmail.com`)
      .setThumbnail('https://cdn.discordapp.com/attachments/674580303498706986/747961795171319908/image0.gif')
      .setImage('https://cdn.discordapp.com/attachments/674580303498706986/747961724933767208/image0.jpg')
      .setFooter('Bot coded by Zeyold#0001');
    msg.channel.send(embed);
  }

  // Start of help/commands function
  if (msg.content == `${prefix}help` || msg.content == `${prefix}commands`) {
    var embed = new discord.MessageEmbed()
        .setTitle('Commands')
        .setColor('#020000')
        .setDescription(`**${prefix}kick** - Kick a member\n\n**${prefix}ban** - Ban a member\n\n**${prefix}mute** - Mute a member (You need a "Muted" Role with all the permissions set correctly)\n\n**${prefix}unmute** Unmute a member (You need a "Muted" Role with all the permissions set correctly)\n\n**${prefix}purge** - Purge messages\n\n**${prefix}addblacklist** - Add word to blacklist\n\n**${prefix}prefix** - Set the bots prefix\n\n**${prefix}follow** - Follow us !`)
        .setFooter('Bot coded by Zeyold#0001');
    msg.channel.send(embed);
  }

  if (msg.content.startsWith(`${prefix}prefix`)) {
    var args = msg.content.split(' ').slice(1);
    var pprefix = args.join('');
    if (!pprefix) return msg.reply('You must specify a character to prefix');
    if (!isNaN(word)) return msg.reply('You cannot set the prefix to a integer');

    prefix = pprefix;
    msg.reply(`Succesfully set the prefix to "${prefix}"`);
  }

  // Just a little fun
  if (msg.content == `${prefix}ping`) {
    msg.channel.send('Pong!');
  }

  // Just fun
  if (msg.content == `${prefix}4k60fps`) {0
    msg.delete()
    msg.channel.send('https://cdn.discordapp.com/attachments/674580303498706986/758382827610832956/749020849381834752.gif');
  }

  if (msg.content == `${prefix}info`) {
    if(message.mentions.users.first()) {
        user = message.mentions.users.first();
   } else{
        user = message.author;
    }
    const member = message.guild.member(user);

    const embed = new Discord.MessageEmbed() 
    .setColor('#ff5555')
    .setThumbnail(user.avatarURL)
    .setTitle(`Information sur ${user.username}#${user.discriminator} :`)
    .addField('ID du compte:', `${user.id}`, true)
    .addField('Pseudo sur le serveur :', `${member.nickname ? member.nickname : 'Aucun'}`, true)
    .addField('A crée son compte le :', `${moment.utc(user.createdAt).format('dddd, MMMM Do YYYY, HH:mm:ss')}`, true)
    .addField('A rejoint le serveur le :', `${moment.utc(member.joinedAt).format('dddd, MMMM Do YYYY, HH:mm:ss')}`, true)
    .addField('Status:', `${user.presence.status}`, true)
    .addField('Joue a :', `${user.presence.game ? user.presence.game.name : 'Rien'}`, true)
    .addField('Roles :', member.roles.cache.map(roles => `${roles.name}`).join(', '), true)
    .addField(`En réponse a :`,`${message.author.username}#${message.author.discriminator}`)
  message.channel.send(embed).then(message => message.delete({ timeout: 15000 }));
  }

});

// discord bot login with token
client.login(config.token);