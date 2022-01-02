// import TOKEN from the .env file using dotenv
require('dotenv').config();
const TOKEN = process.env.TOKEN;

const PREFIX = '&&';

// import discord.js
const Discord = require('discord.js');

const ytdl = require('ytdl-core');

// login to discord
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

// display message when bot is ready
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// listen to messages
client.on('message', msg => {
    // ignore messages that don't start with the PREFIX
    if (!msg.content.startsWith(PREFIX)) return;
    
    // get the command and the args
    const args = msg.content.slice(PREFIX.length).split(/ +/);
    const command = args.shift().toLowerCase();

    // if the command is ping
    if (command === 'ping') {
        // send a message
        msg.reply('Pong');
    }

    // if command is help
    if (command === 'help') {
        // send a message
        const message = 'Here are the commands: \n' + 'ping - pong \n' + 'help - this message' + '\n' + 'say - say something' + '\n' + 'clear - bulk delete messages' + '\n' + 'avatar - returns avatar' + '\n' + 'embed - embeds avatar'; 
        msg.reply(message);
    }

    // if command is say
    if (command === 'say') {
        // send a message
        const message = args.join(' ');
        msg.reply(message);
    }

    // if command is kick
    if (command === 'kick') {
        // get the user to kick
        const user = msg.mentions.users.first();
        // get the reason
        const reason = args.slice(1).join(' ');
        // kick the user
        msg.guild.member(user).kick(reason);
    }

    // if command is ban
    if (command === 'ban') {
        // get the user to ban
        const user = msg.mentions.users.first();
        // get the reason
        const reason = args.slice(1).join(' ');
        // ban the user
        msg.guild.member(user).ban(reason);
    }

    // if command is avatar
    if (command === 'avatar') {
        // get the user's avatar
        const avatar = msg.author.avatarURL();
        // send the avatar
        msg.channel.send(avatar);
    }

    // send embed with user avatar
    if (command === 'embed') {
        // create an embed
        const embed = new Discord.MessageEmbed()
            .setTitle('Avatar')
            .setColor('#0099ff')
            .setImage(msg.author.avatarURL())
            .setTimestamp();
        // send the embed
        msg.channel.send({ embeds: [embed] });
    }

});


// play songs

var servers = {};

client.on('message', message => {
  
  let args = message.content.substring(PREFIX.length).split(" ");

  switch (args[0]) {

    case "play":

      function play(connection, message) {
        var server = servers[message.guild.id];
        server.dispatcher = connection.playStream(ytdl(server.queue[0], {filter: "audioonly"}));
        server.queue.shift();
        server.dispatcher.on("end", function() {
          if (server.queue[0]) play(connection, message);
          else connection.disconnect();
        });
      }

      if (!args[1]) {
        message.channel.send("Please provide a link");
        return;
      }
      if (!message.member.voiceChannel) {
        message.channel.send("You must be in a voice channel to play music");
        return;
      }

      if (!servers[message.guild.id]) servers[message.guild.id] = {
        queue: []
      }

      var server = servers[message.guild.id];

      server.queue.push(args[1]);

      if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
        play(connection, message);
      });
      break;

    case "skip":
      var server = servers[message.guild.id];

      if (server.dispatcher) server.dispatcher.end();
      break;

    case "stop":
      var server = servers[message.guild.id];

      if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
      break;
  }

        
});
      



client.login(TOKEN);