const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const { Client, Util } = require('discord.js');
const getYoutubeID = require('get-youtube-id');
const fetchVideoInfo = require('youtube-info');
const YouTube = require('simple-youtube-api');
const youtube = new YouTube("AIzaSyAdORXg7UZUo7sePv97JyoDqtQVi3Ll0b8");
const queue = new Map();
const client = new Discord.Client();

/*
ÇáÈßÌÂÊ
npm install discord.js
npm install ytdl-core
npm install get-youtube-id
npm install youtube-info
npm install simple-youtube-api
npm install queue
*/

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`in ${client.guilds.size} servers `)
    console.log(`[Codes] ${client.users.size}`)
    client.user.setStatus("idle")
});
//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
const prefix = "M"
client.on('message', async msg => { // eslint-disable-line
	if (msg.author.bot) return undefined;
	//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
	if (!msg.content.startsWith(prefix)) return undefined;
	const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
	//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);
//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
	let command = msg.content.toLowerCase().split(" ")[0];
	command = command.slice(prefix.length)
//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
	if (command === `play`) {
		const voiceChannel = msg.member.voiceChannel;
		if (!voiceChannel) return msg.channel.send('íÌÈ ÊæÂÌÏ ÍÖÑÊß ÈÑæã ÕæÊí .');
		const permissions = voiceChannel.permissionsFor(msg.client.user);
		if (!permissions.has('CONNECT')) {
			//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
			return msg.channel.send('áÇ íÊæÂÌÏ áÏí ÕáÇÍíÉ ááÊßáã ÈåĞÂ ÇáÑæã');
		}//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
		if (!permissions.has('SPEAK')) {
			return msg.channel.send('áÇ íÊæÂÌÏ áÏí ÕáÇÍíÉ ááÊßáã ÈåĞÂ ÇáÑæã');
		}//by ,$ ReBeL Á , ??#4777 'CODES SERVER'

		if (!permissions.has('EMBED_LINKS')) {
			return msg.channel.sendMessage("**íÌÈ ÊæÂİÑ ÈÑãÔä `EMBED LINKS`áÏí **")
		}

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
			for (const video of Object.values(videos)) {
				const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
				await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
			}//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
			return msg.channel.send(` **${playlist.title}** Êã ÇáÅÖÂİÉ Åáì ŞÃÆãÉ ÇáÊÔÛíá`);
		} else {
			try {//by ,$ ReBeL Á , ??#4777 'CODES SERVER'

				var video = await youtube.getVideo(url);
			} catch (error) {
				try {//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
					var videos = await youtube.searchVideos(searchString, 5);
					let index = 0;
					const embed1 = new Discord.RichEmbed()
			        .setDescription(`**ÇáÑÌÂÁ ãä ÍÖÑÊß ÅÎÊíÂÑ ÑŞã ÇáãŞØÚ** :
${videos.map(video2 => `[**${++index} **] \`${video2.title}\``).join('\n')}`)
//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
					.setFooter(" - MaF , ` $")
					msg.channel.sendEmbed(embed1).then(message =>{message.delete(20000)})
					
					// eslint-disable-next-line max-depth
					try {
						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
							maxMatches: 1,
							time: 15000,
							errors: ['time']
						});//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
					} catch (err) {
						console.error(err);
						return msg.channel.send('áã íÊã ÅÎÊíÂÑ ãŞØÚ ÕæÊí');
					}
					const videoIndex = parseInt(response.first().content);
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
				} catch (err) {
					console.error(err);
					return msg.channel.send(':X: áÇ íÊæİÑ äÊÂÆÌ ÈÍË ');
				}
			}//by ,$ ReBeL Á , ??#4777 'CODES SERVER'

			return handleVideo(video, msg, voiceChannel);
		}//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
	} else if (command === `skip`) {
		if (!msg.member.voiceChannel) return msg.channel.send('ÃäÊ áÓÊ ÈÑæã ÕæÊí .');
		if (!serverQueue) return msg.channel.send('áÇ íÊæİÑ ãŞØÚ áÊÌÂæÒå');
		serverQueue.connection.dispatcher.end('Êã ÊÌÂæÒ åĞÂ ÇáãŞØÚ');
		return undefined;
	} else if (command === `stop`) {//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
		if (!msg.member.voiceChannel) return msg.channel.send('ÃäÊ áÓÊ ÈÑæã ÕæÊí .');
		if (!serverQueue) return msg.channel.send('áÇ íÊæİÑ ãŞØÚ áÅíŞÂİå');
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('Êã ÅíŞÂİ åĞÂ ÇáãŞØÚ');
		return undefined;
	} else if (command === `vol`) {
		if (!msg.member.voiceChannel) return msg.channel.send('ÃäÊ áÓÊ ÈÑæã ÕæÊí .');
		if (!serverQueue) return msg.channel.send('áÇ íæÌÏ ÔíÁ ÔÛÂá.');
		if (!args[1]) return msg.channel.send(`:loud_sound: ãÓÊæì ÇáÕæÊ **${serverQueue.volume}**`);
		serverQueue.volume = args[1];//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
		serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 50);
		return msg.channel.send(`:speaker: Êã ÊÛíÑ ÇáÕæÊ Çáí **${args[1]}**`);
	} else if (command === `np`) {
		if (!serverQueue) return msg.channel.send('áÇ íæÌÏ ÔíÁ ÍÇáí İ ÇáÚãá.');
		const embedNP = new Discord.RichEmbed()
	.setDescription(`:notes: ÇáÇä íÊã ÊÔÛíá : **${serverQueue.songs[0].title}**`)
		return msg.channel.sendEmbed(embedNP);
	} else if (command === `queue`) {
		//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
		if (!serverQueue) return msg.channel.send('áÇ íæÌÏ ÔíÁ ÍÇáí İ ÇáÚãá.');
		let index = 0;
		//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
		const embedqu = new Discord.RichEmbed()
//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
.setDescription(`**Songs Queue**
${serverQueue.songs.map(song => `**${++index} -** ${song.title}`).join('\n')}
**ÇáÇä íÊã ÊÔÛíá** ${serverQueue.songs[0].title}`)
		return msg.channel.sendEmbed(embedqu);
	} else if (command === `pause`) {
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return msg.channel.send('Êã ÅíŞÇİ ÇáãæÓíŞì ãÄŞÊÇ!');
		}//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
		return msg.channel.send('áÇ íæÌÏ ÔíÁ ÍÇáí İ ÇáÚãá.');
	} else if (command === "resume") {
		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
			return msg.channel.send('ÇÓÊÃäİÊ ÇáãæÓíŞì ÈÇáäÓÈÉ áß !');
		}//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
		return msg.channel.send('áÇ íæÌÏ ÔíÁ ÍÇáí İí ÇáÚãá.');
	}

	return undefined;
});
//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = queue.get(msg.guild.id);
	console.log(video);
	//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
//	console.log('yao: ' + Util.escapeMarkdown(video.thumbnailUrl));
	const song = {
		id: video.id,
		title: Util.escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`
	};//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
		queue.set(msg.guild.id, queueConstruct);
//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
		queueConstruct.songs.push(song);
//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`I could not join the voice channel: ${error}`);
			queue.delete(msg.guild.id);
			return msg.channel.send(`áÇ ÃÓÊØíÚ ÏÎæá åĞÂ ÇáÑæã ${error}`);
		}
	} else {//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return msg.channel.send(` **${song.title}** Êã ÇÖÇİå ÇáÇÛäíÉ Çáí ÇáŞÇÆãÉ!`);
	}
	return undefined;
}//by ,$ ReBeL Á , ??#4777 'CODES SERVER'

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
	}//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
	console.log(serverQueue.songs);
//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
			play(guild, serverQueue.songs[0]);
		})//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
		.on('error', error => console.error(error));//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);//by ,$ ReBeL Á , ??#4777 'CODES SERVER'

	serverQueue.textChannel.send(`ÈÏÁ ÊÔÛíá : **${song.title}**`);
}//by ,$ ReBeL Á , ??#4777 'CODES SERVER'

client.on('message', message => {
    var prefix = "M";
    
      if (!message.content.startsWith(prefix)) return;
      var args = message.content.split(' ').slice(1);
      var argresult = args.join(' ');
      if (message.author.id == 411564557027508235) return;
    
    
    if (message.content.startsWith(prefix + 'playing')) {
    if (message.author.id !== '411564557027508235') return message.reply('** åĞÇ ÇáÃãÑ İŞØ áÕÇÍÈ ÇáÈæÊ æ ÔßÑÇğğ **')
    client.user.setGame(argresult);
        message.channel.sendMessage(`**${argresult}** : Êã ÊÛííÑ ÇáÍÇáÉ`)
    } else
    
     
    if (message.content.startsWith(prefix + 'streem')) {
    if (message.author.id !== '422403573767340043') return message.reply('** åĞÇ ÇáÃãÑ İŞØ áÕÇÍÈ ÇáÈæÊ æ ÔßÑÇğğ **')
    client.user.setGame(argresult, "http://twitch.tv/HA");
        message.channel.sendMessage(`**${argresult}** :Êã ÊÛííÑ ÇáÍÇáÉ Çáì ÓÊÑíãäÌ`)
    } else
    
    if (message.content.startsWith(prefix + 'setname')) {
    if (message.author.id !== '422403573767340043') return message.reply('** åĞÇ ÇáÃãÑ İŞØ áÕÇÍÈ ÇáÈæÊ æ ÔßÑÇğğ **')
      client.user.setUsername(argresult).then
          message.channel.sendMessage(`**${argresult}** : Êã ÊÛíÑ ÇáÃÓã`)
      return message.reply("**áÇ ÊÓÊØíÚ ÊÛíÑ ÇáÃÓã ÇáÇ ÈÚÏ ÓÇÚÊíä**");
    } else
        
    if (message.content.startsWith(prefix + 'setavatar')) {
    if (message.author.id !== '422403573767340043') return message.reply('** åĞÇ ÇáÃãÑ İŞØ áÕÇÍÈ ÇáÈæÊ æ ÔßÑÇğğ **')
    client.user.setAvatar(argresult);
        message.channel.sendMessage(`**${argresult}** : Êã ÊÛíÑ ÕæÑÉ ÇáÈæÊ`);
    } else
    
    
    if (message.content.startsWith(prefix + 'watching')) {
    if (message.author.id !== '234454368072630283') return message.reply('** åĞÇ ÇáÃãÑ İŞØ áÕÇÍÈ ÇáÈæÊ æ ÔßÑÇğğ **')
        client.user.setActivity(argresult, {type : 'watching'});
     message.channel.sendMessage(`**${argresult}** : Êã ÊÛííÑ ÇáææÊÔíäŞ Çáì`)
    }
    
     });

client.on("message", message => {
 if (message.content === `${prefix}help`) {
  const embed = new Discord.RichEmbed() //by ,$ ReBeL Á , ??#4777 'CODES SERVER'
      .setColor("#000000")//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
      .setDescription(`
${prefix}play ? áÊÔÛíá ÃÛäíÉ ÈÑÂÈØ Ãæ ÈÃÓã
${prefix}skip ? áÊÌÂæÒ ÇáÃÛäíÉ ÇáÍÂáíÉ
${prefix}pause ? ÅíŞÂİ ÇáÃÛäíÉ ãÄŞÊÇ
${prefix}resume ? áãæÂÕáÉ ÇáÅÛäíÉ ÈÚÏ ÅíŞÂİåÂ ãÄŞÊÇ
${prefix}vol ? áÊÛííÑ ÏÑÌÉ ÇáÕæÊ 100 - 0
${prefix}stop ? áÅÎÑÂÌ ÇáÈæÊ ãä ÇáÑæã
${prefix}np ? áãÚÑİÉ ÇáÃÛäíÉ ÇáãÔÛáÉ ÍÂáíÇ
${prefix}queue ? áãÚÑİÉ ŞÂÆãÉ ÇáÊÔÛíá
 `)//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
   message.channel.sendEmbed(embed)//by ,$ ReBeL Á , ??#4777 'CODES SERVER'
    
   }
   }); 
   
client.login(process.env.BOT_TOKEN);