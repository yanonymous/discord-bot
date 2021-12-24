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

client.once("ready", () => {
    console.log("Ready!");
  });
  
  client.once("reconnecting", () => {
    console.log("Reconnecting!");
  });
  
  client.once("disconnect", () => {
    console.log("Disconnect!");
  });

const queue = new Map();

client.on("message", async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;
  
    const serverQueue = queue.get(message.guild.id);
  
    if (message.content.startsWith(`${PREFIX}play`)) {
      execute(message, serverQueue);
      return;
    } else if (message.content.startsWith(`${PREFIX}skip`)) {
      skip(message, serverQueue);
      return;
    } else if (message.content.startsWith(`${PREFIX}stop`)) {
      stop(message, serverQueue);
      return;
    } else {
      message.channel.send("You need to enter a valid command!");
    }
  });
  
  async function execute(message, serverQueue) {
    const args = message.content.split(" ");
  
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send(
        "You need to be in a voice channel to play music!"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "I need the permissions to join and speak in your voice channel!"
      );
    }
  
    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
     };
  
    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
      };
  
      queue.set(message.guild.id, queueContruct);
  
      queueContruct.songs.push(song);
  
      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        play(message.guild, queueContruct.songs[0]);
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(`${song.title} has been added to the queue!`);
    }
  }
  
  function skip(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
    if (!serverQueue)
      return message.channel.send("There is no song that I could skip!");
    serverQueue.connection.dispatcher.end();
  }
  
  function stop(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "You have to be in a voice channel to stop the music!"
      );
      
    if (!serverQueue)
      return message.channel.send("There is no song that I could stop!");
      
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
  }
  
  function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }
  
    const dispatcher = serverQueue.connection
      .play(ytdl(song.url))
      .on("finish", () => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`Start playing: **${song.title}**`);
  }



client.login(TOKEN);