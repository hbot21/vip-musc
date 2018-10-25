const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');
const request = require('request');
const fs = require('fs');
const getYoutubeID = require('get-youtube-id');
const fetchVideoInfo = require('youtube-info');
 
const yt_api_key = "AIzaSyDeoIH0u1e72AtfpwSKKOSy3IPp2UHzqi4";
const prefix = '$';
client.on('ready', function() {
    console.log(`i am ready ${client.user.username}`);
});
 

/*
////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\
*/
var servers = [];
var queue = [];
var guilds = [];
var queueNames = [];
var isPlaying = false;
var dispatcher = null;
var voiceChannel = null;
var skipReq = 0;
var skippers = [];
var now_playing = [];
/*
\\\\\\\\\\\\\\\\\\\\\\\\V/////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\V/////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\V/////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\V/////////////////////////
*/
client.on('ready', () => {});
var download = function(uri, filename, callback) {
    request.head(uri, function(err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);
 
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};
 
client.on('message', function(message) {
    const member = message.member;
    const mess = message.content.toLowerCase();
    const args = message.content.split(' ').slice(1).join(' ');
 
    if (mess.startsWith(prefix + 'play')) {
        if (!message.member.voiceChannel) return message.channel.send('You must be in my audio room :microphone2:');
        // if user is not insert the URL or song title
        if (args.length == 0) {
message.channel.send('Add a song name or song link :drum: ')
            return;
        }
        if (queue.length > 0 || isPlaying) {
            getID(args, function(id) {
                add_to_queue(id);
                fetchVideoInfo(id, function(err, videoInfo) {
                    if (err) throw new Error(err);
message.channel.send(`aded : **( ${videoInfo.title} )** on the list :musical_note:`)
                    queueNames.push(videoInfo.title);
                    now_playing.push(videoInfo.title);
 
                });
            });
        }
        else {
 
            isPlaying = true;
            getID(args, function(id) {
                queue.push('placeholder');
                playMusic(id, message);
                fetchVideoInfo(id, function(err, videoInfo) {
                    if (err) throw new Error(err);
message.channel.send(`Now playing : **( ${videoInfo.title} )** :musical_note: `)
                    // client.user.setGame(videoInfo.title,'https://www.twitch.tv/Abdulmohsen');
                });
            });
        }
    }
    else if (mess.startsWith(prefix + 'skip')) {
        if (!message.member.voiceChannel) return message.channel.send('You must be in my audio room :microphone2:');
        message.channel.send('**Done , :white_check_mark: **').then(() => {
            skip_song(message);
            var server = server = servers[message.guild.id];
            if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
        });
    }
    else if (message.content.startsWith(prefix + 'vol')) {
        if (!message.member.voiceChannel) return message.channel.send('You must be in my audio room :microphone2:');
        // console.log(args)
        if (args > 100) return message.channel.send('Only : 1 || 100 :microphone2:')
        if (args < 1) return message.channel.send('Only : 1 || 100 :microphone2:')
        dispatcher.setVolume(1 * args / 50);
        message.channel.sendMessage(`Now vol : ${dispatcher.volume*50}% :musical_note: `);
    }
    else if (mess.startsWith(prefix + 'pause')) {
        if (!message.member.voiceChannel) return message.channel.send('You must be in my audio room :microphone2:');
        message.channel.send('**Done , :white_check_mark: **').then(() => {
            dispatcher.pause();
        });
    }
    else if (mess.startsWith(prefix + 'resume')) {
        if (!message.member.voiceChannel) return message.channel.send('You must be in my audio room :microphone2:');
            message.channel.send('**Done , :white_check_mark: **').then(() => {
            dispatcher.resume();
        });
    }
    else if (mess.startsWith(prefix + 'stop')) {
        if (!message.member.voiceChannel) return message.channel.send('You must be in my audio room :microphone2:');
        message.channel.send('**Done , :white_check_mark: **');
        var server = server = servers[message.guild.id];
        if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
    }
    else if (mess.startsWith(prefix + 'join')) {
        if (!message.member.voiceChannel) return message.channel.send('You must be in my audio room :microphone2:');
        message.member.voiceChannel.join().then(message.channel.send('**Done , ::white_check_mark: **'));
    }
    else if (mess.startsWith(prefix + 'play')) {
        if (!message.member.voiceChannel) return message.channel.send('You must be in my audio room :microphone2:');
        if (isPlaying == false) return message.channel.send('**Done , :white_check_mark: **');
message.channel.send('Now playing : ${videoInfo.title} :musical_note:')
    }
});
 
function skip_song(message) {
    if (!message.member.voiceChannel) return message.channel.send('You must be in my audio room :microphone2:');
    dispatcher.end();
}
 
function playMusic(id, message) {
    voiceChannel = message.member.voiceChannel;
 
 
    voiceChannel.join().then(function(connectoin) {
        let stream = ytdl('https://www.youtube.com/watch?v=' + id, {
            filter: 'audioonly'
        });
        skipReq = 0;
        skippers = [];
 
        dispatcher = connectoin.playStream(stream);
        dispatcher.on('end', function() {
            skipReq = 0;
            skippers = [];
            queue.shift();
            queueNames.shift();
            if (queue.length === 0) {
                queue = [];
                queueNames = [];
                isPlaying = false;
            }
            else {
                setTimeout(function() {
                    playMusic(queue[0], message);
                }, 500);
            }
        });
    });
}
 
function getID(str, cb) {
    if (isYoutube(str)) {
        cb(getYoutubeID(str));
    }
    else {
        search_video(str, function(id) {
            cb(id);
        });
    }
}
 
function add_to_queue(strID) {
    if (isYoutube(strID)) {
        queue.push(getYoutubeID(strID));
    }
    else {
        queue.push(strID);
    }
}
 
function search_video(query, cb) {
    request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(query) + "&key=" + yt_api_key, function(error, response, body) {
        var json = JSON.parse(body);
        cb(json.items[0].id.videoId);
    });
}
 
 
function isYoutube(str) {
    return str.toLowerCase().indexOf('youtube.com') > -1;
}
 client.on('message', message => {
  if (message.content === `${prefix}`) {
    const embed = new Discord.RichEmbed()
     .setColor("RANDOM")
.setFooter('شكرا استخدام البوت ! .')
      message.channel.send({embed});
     }
    });


const devs = ["466425075487342615"];
const adminprefix = ["$v"];
client.on('message', message => {
    var argresult = message.content.split(` `).slice(1).join(' ');
      if (!devs.includes(message.author.id)) return;

  if (message.content.startsWith(adminprefix + 'g')) {
    client.user.setGame(argresult);
      message.channel.send(`**✅ تم تغيير الحالة بنجاح ${argresult}**`)
  } else
     if (message.content === (adminprefix + "lev")) {
    message.guild.leave();
  } else
  if (message.content.startsWith(adminprefix + 'w')) {
  client.user.setActivity(argresult, {type:'WATCHING'});
      message.channel.send(`**✅ تم تغيير الحالة بنجاح ${argresult}**`)
  } else
  if (message.content.startsWith(adminprefix + 'l')) {
  client.user.setActivity(argresult , {type:'LISTENING'});
      message.channel.send(`**✅ تم تغيير الحالة بنجاح ${argresult}**`)
  } else
  if (message.content.startsWith(adminprefix + 's')) {
    client.user.setGame(argresult, "https://www.twitch.tv/idk");
      message.channel.send(`**✅ تم تغيير الحالة بنجاح **`)
  }
  if (message.content.startsWith(adminprefix + 'name')) {
  client.user.setUsername(argresult).then
      message.channel.send(`**✅ تم تغير الاسم بنجاح ${argresult}** `)
} else
if (message.content.startsWith(adminprefix + 'avatar')) {
  client.user.setAvatar(argresult);
    message.channel.send(`**✅ تم تغير الصور بنجاح ${argresult}** `);
}
});

client.on('message' , message => {
  if(message.author.bot) return;
  if(message.content.startsWith(prefix + "ping")) {
 message.channel.send('pong').then((msg) => {
var PinG = `${Date.now() - msg.createdTimestamp}`
var ApL = `${Math.round(client.ping)}`
      msg.edit(`\`\`\`javascript\nTime taken: ${PinG} ms.\nDiscord API: ${ApL} ms.\`\`\``);
 })
  }  
 });

client.on('message', message => {
    if (message.content.startsWith("$bot")) {
    message.channel.send({
        embed: new Discord.RichEmbed()
            .setAuthor(client.user.username,client.user.avatarURL)
            .setThumbnail(client.user.avatarURL)
            .setColor('RANDOM')
            .setTitle('**``Vip Bot``**')
            .addField('``My Ping``' , [`${Date.now() - message.createdTimestamp}` + 'MS'], true)
            .addField('``RAM Usage``', `[${(process.memoryUsage().rss / 1048576).toFixed()}MB]`, true)
            .addField('``servers``', [client.guilds.size], true)
            .addField('``channels``' , `[ ${client.channels.size} ]` , true)
            .addField('``Users``' ,`[ ${client.users.size} ]` , true)
            .addField('``My Name``' , `[ ${client.user.tag} ]` , true)
            .addField('``My ID``' , `[ <@466425075487342615>]` , true)
			      .addField('``My Prefix``' , `[ $ ]` , true)
			      .addField('``My Language``' , `[ Java Script ]` , true)
			      .setFooter('By | <@466425075487342615>')
    })
}
});

 




client.on('message', message => {
    if (message.author.bot) return;
     if (message.content === prefix + "help") {
		 message.channel.send('**تم ارسال ألاومر في الخاص**');
            
	
		 


 message.author.sendMessage(`
 **
__Vip Bot__

بأمكانك دعوة البوت  : 
https://discordapp.com/oauth2/authorize?client_id=481622608534831104&permissions=8&scope=bot


 الأوامر العامة 
 $id   : الهوية


 أوامر ادارة السيرفرات 
$mute : اعطاء عضو ميوت
$unmute : لفك عن العضو الميوت
$role  : عطاء عضو رتبة
$role all : اعطاء رتبة حميع الاعضاء

 أوامر الميوزك 
$join -  دخول البوت الي الروم
$play -  لتشغيل أغنية برآبط أو بأسم
$skip - لتجآوز الأغنية الحآلية
$pause -  إيقآف الأغنية مؤقتا
$resume -  لموآصلة الإغنية بعد إيقآفهآ مؤقتا
$vol - لتغيير درجة الصوت 100 - 0
$stop -  لإخرآج البوت من الروم

الشرح عن البوت
' Vip Bot Discord.
$help - لرؤية الأوامر :comet: 
$inv - لدعوة البوت :wine_glass: 
معلومات عن البوت :thinking:
صيانة دورية :stopwatch: :wrench: 
24 ساعة :point_up:
اضافات يومية :link: 
الدعم الفني للمساعدةة : https://discord.gg/sskCJk5
**
`);

    }
});


client.on('message', message => {
    if (message.author.bot) return;
     if (message.content === prefix + "inv") {
		 message.channel.send('**تم ارسال رابط البوت في الخاص**');
            
	
		 


 message.author.sendMessage(`
 **
**__Vip Bot__**

رابط البوت
https://discordapp.com/oauth2/authorize?client_id=481622608534831104&permissions=8&scope=bot
معلومات عن البوت :thinking:
صيانة دورية :stopwatch: :wrench: 
24 ساعة :point_up:
اضافات يومية :link: 
الدعم الفني للمساعدةة : https://discord.gg/3RJNUuk
**
`);

    }
});



client.on('message', message => {
            if(!message.channel.guild) return;
let args = message.content.split(' ').slice(1).join(' ');
if (message.content.startsWith('$bc')){
 if (message.author.id !== '466425075487342615') return message.reply('** هذا الأمر قفط لصاحب البوت و شكراًً **')
 if(!message.author.id === '466425075487342615') return;
message.channel.sendMessage('جار ارسال الرسالة |✅')
client.users.forEach(m =>{
m.sendMessage(args)
})
}
});

const dateFormat = require('dateformat');
var Canvas = require('canvas')
var jimp = require('jimp')
var moment = require("moment");
//ALPHACODE

client.on('message', message => {

    if(message.content.startsWith(prefix + 'id')) {
if(!message.channel.guild) return;
      var args = message.content.split(" ").slice(1);
      let user = message.mentions.users.first();
      var men = message.mentions.users.first();
         var heg;
         if(men) {
             heg = men
         } else {
             heg = message.author
         }
       var mentionned = message.mentions.members.first();
          var h;
         if(mentionned) {
             h = mentionned
         } else {
             h = message.member
         }
  moment.locale('ar');
     const w = ['./img/id1.png','./img/id2.png','./img/id3.png','./img/id4.png','./img/id5.png'];
        let Image = Canvas.Image,
            canvas = new Canvas(500, 500),
            ctx = canvas.getContext('2d');
        ctx.patternQuality = 'bilinear';
        ctx.filter = 'bilinear';
        ctx.antialias = 'subpixel';
        ctx.shadowColor = 'rgba(0, 0, 0, 0)';
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 2;
        fs.readFile(`${w[Math.floor(Math.random() * w.length)]}`, function (err, Background) {
            if (err) return console.log(err);
            let BG = Canvas.Image;
            let ground = new Image;
            ground.src = Background;
            ctx.drawImage(ground, 0, 0, 500, 500);

})
                let url = h.user.displayAvatarURL.endsWith(".webp") ? h.user.displayAvatarURL.slice(5, -20) + ".png" : h.user.displayAvatarURL;
                jimp.read(url, (err, ava) => {
                    if (err) return console.log(err);
                    ava.getBuffer(jimp.MIME_PNG, (err, buf) => {
                        if (err) return console.log(err);
  //time dateformet
  const millis = new Date().getTime() - h.user.createdAt.getTime();
  const now = new Date();
  dateFormat(now, 'dddd, mmmm dS, yyyy');
  const stats2 = ['online', 'Low', 'Medium', 'Insane'];
  const days = millis / 1000 / 60 / 60 / 24;
            dateFormat(now, 'dddd, mmmm dS, yyyy');
            
        
                          //دخولك الديسكورد
                          var day = ` ${days.toFixed(0)} `
                          ctx.font = '27px Arial Bold';
                          ctx.fontSize = '30px';
                          ctx.fillStyle = "#030000";
                          ctx.textAlign = "center";
                          ctx.fillText(day, 109, 97)
              //wl
              var millis1;
        if(mentionned){
            var millis1 = new Date().getTime() - mentionned.joinedAt
        } else {
            var millis1 = new Date().getTime() - moment(message.member.joinedAt);;
            
        }

  const days1 = millis1 / 1000 / 60 / 60 / 24;
  
                        //دخولك السيرفر
                        var day2 = ` ${days1.toFixed(0)} `
                        ctx.font = '27px Arial Bold';
                        ctx.fontSize = '20px';
                        ctx.fillStyle = "#030000";
                        ctx.textAlign = "center";
                        ctx.fillText(day2, 388, 97); 

                        //ur name
                        ctx.font = '27px BlowBrush';
                        ctx.fontSize = '30px';
                        ctx.fillStyle = "#030000";
                        ctx.textAlign = "center";
                        ctx.fillText(h.user.username, 245, 365);
                        //tag
                        ctx.font = '27px Arial Bold';
                        ctx.fontSize = '45px';
                        ctx.fillStyle = "#030000";
                        ctx.textAlign = "center";
                        ctx.fillText(`#${heg.discriminator}`, 120, 450);
                        
                        //حالتك
                           let status;
    if (h.presence.status === 'online') {
        status = 'Online';
    } else if (h.presence.status === 'dnd') {
        status = 'Dnd';
    } else if (h.presence.status === 'idle') {
        status = 'Idle';
    } else if (h.presence.status === 'offline') {
        status = 'Offline';
    }
                        ctx.font = '27px Arial Bold';//ALPHACODE
                        ctx.fontSize = '30px';
                        ctx.fillStyle = "#030000";
                        ctx.textAlign = "center";
                        ctx.fillText(`${status}`, 380, 450);//ALPHACODE
                        
                        //Avatar
                        let Avatar = Canvas.Image;
                        let ava = new Avatar;
                        ava.src = buf;
                        ctx.beginPath();
                        ctx.arc(250, 238, 64, 0, Math.PI*2, true); //ALPHACODE
                        ctx.closePath();
                        ctx.clip();
                        ctx.drawImage(ava, 185, 172, 130, 130 );
                         
     message.channel.sendFile(canvas.toBuffer())//ALPHACODE
})
   })

} });





client.on('message', async message =>{
const ms = require("ms");
if (message.author.omar) return;
if (!message.content.startsWith(prefix)) return;
if(!message.guild.member(client.user).hasPermission("MANAGE_ROLES")) return message.reply("**I Don't Have `MANAGE_ROLES` Permission**").then(msg => msg.delete(6000))
var command = message.content.split(" ")[0];
command = command.slice(prefix.length);
var args = message.content.split(" ").slice(1);
    if(command == "mute") {
    let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!tomute) return message.reply("https://i.imgur.com/aTNsBda.png") .then(m => m.delete(5000));
    if(tomute.hasPermission("MANAGE_MESSAGES"))return      message.channel.send('**:x:  لاتستطيع اعطاء ميوت لأحد ادارة السيرفر **');
    let muterole = message.guild.roles.find(`name`, "Muted");
    //start of create role
    if(!muterole){
      try{
        muterole = await message.guild.createRole({
          name: "Muted",
          color: "#070000",
          permissions:[]
        })
        message.guild.channels.forEach(async (channel, id) => {
          await channel.overwritePermissions(muterole, {
            SEND_MESSAGES: false,
            ADD_REACTIONS: false,
            SPEAK : false
          });
        });
      }catch(e){
        console.log(e.stack);
      }
    }
    //end of create role
let mutetime = args[1];
    if(!mutetime) return message.reply("**يرجى تحديد وقت الميوت**:x:");
 
    await(tomute.addRole(muterole.id));
message.reply(`:white_check_mark:<@${tomute.id}> ${ms(ms(mutetime))} : **تم اعطائه ميوت ومدة الميوت :zipper_mouth:**`);
setTimeout(function(){
      tomute.removeRole(muterole.id);
      message.channel.send(`<@${tomute.id}> **انقضى الوقت وتم فك الميوت عن الشخص**:white_check_mark: `);
    }, ms(mutetime));
 
 
 
  }
if(command === `unmute`) {
  if(!message.member.hasPermission("MANAGE_ROLES")) return message.channel.sendMessage("**ليس لديك صلاحية لفك عن الشخص ميوت**:x: ").then(m => m.delete(5000));
if(!message.guild.member(client.user).hasPermission("MANAGE_ROLES")) return message.reply("**I Don't Have `MANAGE_ROLES` Permission**").then(msg => msg.delete(6000))
 
  let toMute = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
  if(!toMute) return message.channel.sendMessage("**عليك المنشن أولاّ**:x: ");
 
  let role = message.guild.roles.find (r => r.name === "Muted");
 
  if(!role || !toMute.roles.has(role.id)) return message.channel.sendMessage("**لم يتم اعطاء هذه شخص ميوت من الأساس**:x:")
 
  await toMute.removeRole(role)
  message.channel.sendMessage("**لقد تم فك الميوت عن شخص بنجاح**:white_check_mark:");
 
  return;
 
  }
 
});




client.on('message',async message => {
    if(message.content.startsWith(prefix + "setVoice")) {
    if(!message.guild.member(message.author).hasPermissions('MANAGE_CHANNELS')) return message.reply('❌ **ليس لديك الصلاحيات الكافية**');
    if(!message.guild.member(client.user).hasPermissions(['MANAGE_CHANNELS','MANAGE_ROLES_OR_PERMISSIONS'])) return message.reply('❌ **ليس معي الصلاحيات الكافية**');
    message.channel.send('✅| **تم عمل الروم بنجاح**');
    message.guild.createChannel(`Voice Online : [ ${message.guild.members.filter(m => m.voiceChannel).size} ]` , 'voice').then(c => {
      console.log(`Voice online channel setup for guild: \n ${message.guild.name}`);
      c.overwritePermissions(message.guild.id, {
        CONNECT: false,
        SPEAK: false
      });
      setInterval(function() {
        c.setName(`Voice Online : [ ${message.guild.members.filter(m => m.voiceChannel).size} ]`)
      },1000);
    });
    }
  });
 
  client.on('message',async message => {
    if(message.content.startsWith(prefix + "setCount")) {
    if(!message.guild.member(message.author).hasPermissions('MANAGE_CHANNELS')) return message.reply('❌ **ليس لديك الصلاحيات الكافية**');
    if(!message.guild.member(client.user).hasPermissions(['MANAGE_CHANNELS','MANAGE_ROLES_OR_PERMISSIONS'])) return message.reply('❌ **ليس معي الصلاحيات الكافية**');
    message.channel.send('✅| **تم عمل الروم بنجاح**');
    message.guild.createChannel(`Members Count : [ ${message.guild.members.size} ]` , 'voice').then(c => {
      console.log(`Count Members channel setup for guild: \n ${message.guild.name}`);
      c.overwritePermissions(message.guild.id, {
        CONNECT: false,
        SPEAK: false
      });
      setInterval(function() {
        c.setName(`Members Count : [ ${message.guild.members.size} ]`)
      },1000);
    });
    }
  });
 
 
  client.on('message',async message => {
    if(message.content.startsWith(prefix + "setTime")) {
    if(!message.guild.member(message.author).hasPermission('MANAGE_CHANNELS')) return message.reply('❌ **ليس لديك الصلاحيات الكافية**');
    if(!message.guild.member(client.user).hasPermission(['MANAGE_CHANNELS','MANAGE_ROLES_OR_PERMISSIONS'])) return message.reply('❌ **ليس معي الصلاحيات الكافية**');
    message.channel.send('✅| **تم عمل الروم بنجاح**');
    message.guild.createChannel("🕐 - Time  00", 'voice').then((c) => {
      console.log(`Time channel setup for guild: \n ${message.guild.name}`);
      c.overwritePermissions(message.guild.id, {
        CONNECT: false,
        SPEAK: false
      });
          setInterval(function() {
 
        var currentTime = new Date(),
        hours = currentTime.getHours() + 3 ,
        minutes = currentTime.getMinutes(),
        seconds = currentTime.getSeconds(),
        years = currentTime.getFullYear(),
        month = currentTime.getMonth(),
        day = currentTime.getDate(),
        week = currentTime.getDay();
 
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        var suffix = "AM";
        if (hours >= 12) {
            suffix = "PM";
            hours = hours - 12;
        }
        if (hours == 0) {
            hours = 12;
        }
 
        c.setName("🕐 - Time   「" + hours + ":" + minutes  +" " + suffix + "」");
      },1000);
    });
    }
  });
 
 
 
  client.on('message',async message => {
    if(message.content.startsWith(prefix + "setDate")) {
        var currentTime = new Date(),
        years = currentTime.getFullYear(),
        month = currentTime.getMonth() + 1,
        day = currentTime.getDate(),
        week = currentTime.getDay();
    if(!message.guild.member(message.author).hasPermissions('MANAGE_CHANNELS')) return message.reply('❌ **ليس لديك الصلاحيات الكافية**');
    if(!message.guild.member(client.user).hasPermissions(['MANAGE_CHANNELS','MANAGE_ROLES_OR_PERMISSIONS'])) return message.reply('❌ **ليس معي الصلاحيات الكافية**');
    message.channel.send('✅| **تم عمل الروم بنجاح**');
    message.guild.createChannel("📅 - Date " + "「" + day + "-" + month + "-" + years + "」" , 'voice').then(c => {
      console.log(`Date channel setup for guild: \n ${message.guild.name}`);
      c.overwritePermissions(message.guild.id, {
        CONNECT: false,
        SPEAK: false
      });
      setInterval(function() {
        c.setName("📅 - Date " + "「" + day + "-" + month + "-" + years + "」")
      },1000);
    });
    }
  });
 
  client.on('message',async message => {
    var moment = require('moment');
      if(message.content.startsWith(prefix + "setDays")) {
      if(!message.guild.member(message.author).hasPermissions('MANAGE_CHANNELS')) return message.reply('❌ **ليس لديك الصلاحيات الكافية**');
      if(!message.guild.member(client.user).hasPermissions(['MANAGE_CHANNELS','MANAGE_ROLES_OR_PERMISSIONS'])) return message.reply('❌ **ليس معي الصلاحيات الكافية**');
      message.channel.send('✅| **تم عمل الروم بنجاح**');
      message.guild.createChannel(`Day : ${moment().format('dddd')}` , 'voice').then(c => {
        console.log(`Day channel setup for guild: \n ${message.guild.name}`);
        c.overwritePermissions(message.guild.id, {
          CONNECT: false,
          SPEAK: false
        });
        setInterval(function() {
          c.setName(`📅 - Day : 「${moment().format('dddd')}」`);
        },1000);
      });
      }
    });


client.on('ready', () => {
    setInterval(function(){
        client.guilds.get('502465918799052800').roles.find('name', 'vipr').edit({color: 'RANDOM'})
    },5000);
  

})


client.on("message", message => {
 
    var args = message.content.split(' ').slice(1);
    var msg = message.content.toLowerCase();
    if( !message.guild ) return;
    if( !msg.startsWith( prefix + 'role' ) ) return;
    if(!message.member.hasPermission('MANAGE_ROLES')) return message.channel.send(' **__ليس لديك صلاحيات__**');
    if( msg.toLowerCase().startsWith( prefix + 'rerole' ) ){
        if( !args[0] ) return message.reply( '**:x: يرجى وضع الشخص المراد سحب منه الرتبة**' );
        if( !args[1] ) return message.reply( '**:x: يرجى وضع الرتبة المراد سحبها من الشخص**' );
        var role = msg.split(' ').slice(2).join(" ").toLowerCase();
        var role1 = message.guild.roles.filter( r=>r.name.toLowerCase().indexOf(role)>-1 ).first();
        if( !role1 ) return message.reply( '**:x: يرجى وضع الرتبة المراد سحبها من الشخص**' );if( message.mentions.members.first() ){
            message.mentions.members.first().removeRole( role1 );
            return message.reply('**:white_check_mark: [ '+role1.name+' ] رتبة [ '+args[0]+' ] تم سحب من **');
        }
        if( args[0].toLowerCase() == "all" ){
            message.guild.members.forEach(m=>m.removeRole( role1 ))
            return  message.reply('**:white_check_mark: [ '+role1.name+' ] تم سحب من الكل رتبة**');
        } else if( args[0].toLowerCase() == "bots" ){
            message.guild.members.filter(m=>m.user.bot).forEach(m=>m.removeRole(role1))
            return  message.reply('**:white_check_mark: [ '+role1.name+' ] تم سحب من البوتات رتبة**');
        } else if( args[0].toLowerCase() == "humans" ){
            message.guild.members.filter(m=>!m.user.bot).forEach(m=>m.removeRole(role1))
            return  message.reply('**:white_check_mark: [ '+role1.name+' ] تم سحب من البشريين رتبة**');
        }  
    } else {
        if( !args[0] ) return message.reply( '**:x: يرجى وضع الشخص المراد اعطائها الرتبة**' );
        if( !args[1] ) return message.reply( '**:x: يرجى وضع الرتبة المراد اعطائها للشخص**' );
        var role = msg.split(' ').slice(2).join(" ").toLowerCase();
        var role1 = message.guild.roles.filter( r=>r.name.toLowerCase().indexOf(role)>-1 ).first();
        if( !role1 ) return message.reply( '**:x: يرجى وضع الرتبة المراد اعطائها للشخص**' );if( message.mentions.members.first() ){
            message.mentions.members.first().addRole( role1 );
            return message.reply('**:white_check_mark: [ '+role1.name+' ] رتبة [ '+args[0]+' ] تم اعطاء **');
        }
        if( args[0].toLowerCase() == "all" ){
            message.guild.members.forEach(m=>m.addRole( role1 ))
            return  message.reply('**:white_check_mark: [ '+role1.name+' ] تم اعطاء الكل رتبة**');
        } else if( args[0].toLowerCase() == "bots" ){
            message.guild.members.filter(m=>m.user.bot).forEach(m=>m.addRole(role1))
            return  message.reply('**:white_check_mark: [ '+role1.name+' ] تم اعطاء البوتات رتبة**');
        } else if( args[0].toLowerCase() == "humans" ){
            message.guild.members.filter(m=>!m.user.bot).forEach(m=>m.addRole(role1))
            return  message.reply('**:white_check_mark: [ '+role1.name+' ] تم اعطاء البشريين رتبة**');
        }
    }
});


client.on('message', message => {
    if (message.content.startsWith("link")) {

  message.channel.createInvite({
        thing: true,
        maxUses: 2,
        maxAge: 86400
    }).then(invite =>
      message.author.sendMessage(invite.url)
    )
  message.channel.send("**تم ارسال الرابط برسالة خاصة**")

message.author.send(`**مدة الرابط : يـوم
عدد استخدامات الرابط : 2**`)


    }
});


client.on("message", msg => {//By, HAMO♚ ~ ZA .#0001
var m = msg.guild.name
var d = msg.guild.memberCount
var p = msg.guild.roles.size
var c = msg.guild.channels.size
var l = msg.guild.region
var o = msg.guild.iconURL
var k = msg.guild.owner
var i = msg.guild.emojis.size
var b = msg.guild.members.filter(m => m.user.bot).size
var h = d - b
var cre = `${moment(msg.guild.createdAt).format('D/M/YYYY h:mm a')} **\n** \`${moment(msg.guild.createdAt).fromNow()}\``
var t = msg.guild.channels.filter(e => e.type === "text")
var v = msg.guild.channels.filter(e => e.type === "voice")
var pow = msg.guild.verificationLevel
var e = msg.guild.emojis.size
var e2 = msg.guild.emojis.array()
var afk = msg.guild.afkChannel
var ID = msg.guild.id
if (msg.content.startsWith(prefix + "server")){// الامر
var embed = new Discord.RichEmbed()
.setColor("RANDOM")
.setThumbnail(o)
.addField("👑**Owned by**", k, true)
.addField("📜**Name**", m, true)
.addField("🆔**Server ID:**", ID, true)
.addField("👥**MembersAll**", d, true)
.addField("📕**Roles**", p, true)
.addField("📕**Channels**", c, true)
.addField("🌐**Region**", l, true)
.addField("🤖**Bots**", b, true)
.addField("👥**Members**", h, true)
.addField("📝**TextRooms**", `${t.size}`, true)
.addField("🎤**VoiceRooms**", `${v.size}`, true)
.addField("📆**Created On**", cre,true)
msg.channel.sendEmbed(embed);
}
});


client.on('message', message => {
const prefix = '$'	
    if(message.content === prefix + 'scolors') {
                         if(!message.channel.guild) return message.channel.send('**This Commnad only For Servers !**'); 
         if(!message.member.hasPermission('ADMINISTRATOR')) return    message.channel.send('**You Dont Have** `ADMINISTRATOR` **premission**').then(msg => msg.delete(6000))
      message.guild.createRole({
                  name: "1",
                    color: "#050000",
                    permissions: []
     })
           message.guild.createRole({
                  name: "2",
                    color: "#262726",
                    permissions: []
     })
                message.guild.createRole({
                  name: "3",
                    color: "#333433",
                    permissions: []
     })
                     message.guild.createRole({
                  name: "4",
                    color: "#454545",
                    permissions: []
     })
                     message.guild.createRole({
                  name: "5",
                    color: "#565656",
                    permissions: []
     })
                     message.guild.createRole({
                  name: "6",
                    color: "#646464",
                    permissions: []
     })
                     message.guild.createRole({
                  name: "7",
                    color: "#787878",
                    permissions: []
     })
                     message.guild.createRole({
                  name: "8",
                    color: "#8d8c8c",
                    permissions: []
     })
                     message.guild.createRole({
                  name: "8",
                    color: "#9a9a9a",
                    permissions: []
     })
                     message.guild.createRole({
                  name: "9",
                    color: "#afaeae",
                    permissions: []
     })
                     message.guild.createRole({
                  name: "10",
                    color: "#bcbbbb",
                    permissions: []
     })
                     message.guild.createRole({
                  name: "11",
                    color: "#8504fa",
                    permissions: []
     })
                     message.guild.createRole({
                  name: "12",
                    color: "#7607dd",
                    permissions: []
     })
                     message.guild.createRole({
                  name: "13",
                    color: "#6a05c8",
                    permissions: []
     })
                          message.guild.createRole({
                  name: "14",
                    color: "#6006b4",
                    permissions: []
     })
                          message.guild.createRole({
                  name: "15",
                    color: "#5a07a8",
                    permissions: []
     })
                               message.guild.createRole({
                  name: "16",
                    color: "#4c078d",
                    permissions: []
     })
                                    message.guild.createRole({
                  name: "17",
                    color: "#43067c",
                    permissions: []
     })
                                    message.guild.createRole({
                  name: "18",
                    color: "#360564",
                    permissions: []
     })
                                    message.guild.createRole({
                  name: "19",
                    color: "#270349",
                    permissions: []
     })
                                    message.guild.createRole({
                  name: "20",
                    color: "#fa04a1",
                    permissions: []
     })
                                    message.guild.createRole({
                  name: "21",
                    color: "#ef069b",
                    permissions: []
     })
                                    message.guild.createRole({
                  name: "22",
                    color: "#c30781",
                    permissions: []
     })
                                    message.guild.createRole({
                  name: "23",
                    color: "#a80871",
                    permissions: []
     })
                                    message.guild.createRole({
                  name: "24",
                    color: "#970966",
                    permissions: []
     })
                                    message.guild.createRole({
                  name: "25",
                    color: "#7f0956",
                    permissions: []
     })
                                    message.guild.createRole({
                  name: "26",
                    color: "#6e094b",
                    permissions: []
     })
                                    message.guild.createRole({
                  name: "27",
                    color: "#4e0735",
                    permissions: []
     })
                                    message.guild.createRole({
                  name: "28",
                    color: "#f80854",
                    permissions: []
     })
                                    message.guild.createRole({
                  name: "29",
                    color: "#db064a",
                    permissions: []
     })
                                         message.guild.createRole({
                  name: "30",
                    color: "#ca0745",
                    permissions: []
     })
                                         message.guild.createRole({
                  name: "31",
                    color: "#af083d",
                    permissions: []
     })
                                         message.guild.createRole({
                  name: "32",
                    color: "#940834",
                    permissions: []
     })
                                         message.guild.createRole({
                  name: "33",
                    color: "#7f062c",
                    permissions: []
     })
                                         message.guild.createRole({
                  name: "34",
                    color: "#6b0424",
                    permissions: []
     })
                                         message.guild.createRole({
                  name: "35",
                    color: "#f8071e",
                    permissions: []
     })
                                         message.guild.createRole({
                  name: "36",
                    color: "#d6071b",
                    permissions: []
     })
                                         message.guild.createRole({
                  name: "37",
                    color: "#b60516",
                    permissions: []
     })
                                         message.guild.createRole({
                  name: "38",
                    color: "#a80515",
                    permissions: []
     })
                                         message.guild.createRole({
                  name: "39",
                    color: "#8d0512",
                    permissions: []
     })
                                         message.guild.createRole({
                  name: "40",
                    color: "#7f0410",
                    permissions: []
     })
                                         message.guild.createRole({
                  name: "41",
                    color: "#6b030d",
                    permissions: []
     })
                                         message.guild.createRole({
                  name: "42",
                    color: "#06bcf3",
                    permissions: []
     })
                                         message.guild.createRole({
                  name: "43",
                    color: "#099dca",
                    permissions: []
     })
                                         message.guild.createRole({
                  name: "44",
                    color: "#098db6",
                    permissions: []
     })
                                         message.guild.createRole({
                  name: "45",
                    color: "#057a9e",
                    permissions: []
     })
                                         message.guild.createRole({
                  name: "46",
                    color: "#06637f",
                    permissions: []
     })
                                         message.guild.createRole({
                  name: "47",
                    color: "#054e64",
                    permissions: []
     })
                                         message.guild.createRole({
                  name: "48",
                    color: "#044255",
                    permissions: []
     })
                                         message.guild.createRole({
                  name: "49",
                    color: "#02dff8",
                    permissions: []
     })
                                         message.guild.createRole({
                  name: "50",
                    color: "#03c5db",
                    permissions: []
     })

          message.channel.sendMessage({embed: new Discord.RichEmbed()
     .setColor('#502faf').setAuthor(`${message.author.username}'`, message.author.avatarURL).setDescription('``تم انشاءالالوان``')});
    }
	});








client.on('message', message => {
    let args = message.content.split(' ').slice(1);
if(message.content.split(' ')[0] == 'colors'){
     const embedd = new Discord.RichEmbed()
.setFooter('Requested by '+message.author.username, message.author.avatarURL)
.setDescription(`**There's No Color With This Number لازم ان تختار رقم ملحوظة لازم تكون منزل الالوان** ❌ `)
.setColor(`RAMDOM`)

if(!isNaN(args) && args.length > 0)


 var a = message.guild.roles.find("name",`${args}`)
          if(!a)return;
          if (a.name > 250 || a.name < 1) return;
const embed = new Discord.RichEmbed()
              
.setFooter('Requested by '+message.author.username, message.author.avatarURL)
.setDescription(`**Color Changed Successfully** ✅ `)

.setColor(`${a.hexColor}`)
message.channel.sendEmbed(embed);
    if (!args)return;
setInterval(function(){})
            let count = 0;
            let ecount = 0;
  for(let x = 1; x < 201; x++){
     
      message.member.removeRole(message.guild.roles.find("name",`${x}`))
    
      }
          message.member.addRole(message.guild.roles.find("name",`${args}`));
  
      
}
});



 client.login(process.env.BOT_TOKEN);
