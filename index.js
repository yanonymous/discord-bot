// import TOKEN from the .env file using dotenv
require('dotenv').config();
const TOKEN = process.env.TOKEN;

const PREFIX = 'YOG!';

// import discord.js
const Discord = require('discord.js');

// login to discord
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

// display message when bot is ready
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// listen to messages
client.on('message', msg => {
    // ignore messages that don't start with the prefix
    if (!msg.content.startsWith(PREFIX)) return;
    
    // get the command and the args
    const args = msg.content.slice(PREFIX.length).split(/ +/);
    const command = args.shift().toLowerCase();

    // if the command is ping
    if (command === 'ping') {
        // send a message
        msg.reply('Pong');
    }

});


client.login(TOKEN);