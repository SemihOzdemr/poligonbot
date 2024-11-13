import {inlineCode} from "discord.js"
const once = false;
const name = 'messageCreate';
import Invites from '../models/invites.js';
import Users from '../models/User.js';
import config from '../config.json' assert { type: "json" };
import checkUserAndCreate from '../handlers/checkUserAndCreate.js'
// yardım alındı : https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/coding-guides/tracking-used-invites.md


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


let messagecount = 0;
let randomCount = getRandomInt(100,200);
let randomCoin = getRandomInt(10,31);


async function invoke(client,message) {
    if(!message.guild) return;
    if(message.guild.id !== config.guildid) return;
    if(message.member.user.bot) return;
    if(message.channel.id !== config.generalChannelId) return;
    await checkUserAndCreate(message.member);

    messagecount++  

if (messagecount == randomCount) {
    await Users.updateOne(
		{ id: message.member.id }, // Güncellenecek belgenin kriteri (ID)
		{ 
            $inc: { coin: randomCoin },

        },
         // Puanı 5 arttırma
	  );

     await message.channel.send({
        content: `<@${message.member.id}> **genel sohbet** kanalında aktif olduğun için **${randomCoin}** ${config.coinConfigs.coinName} kazandın.`
      })

      messagecount = 0;
      randomCount = getRandomInt(100,200);
      randomCoin = getRandomInt(10,31);

}

    await Users.updateOne(
		{ id: message.member.id }, // Güncellenecek belgenin kriteri (ID)
		{ 
            $inc: { coin: config.coinConfigs.perOneMessageCoinCount },
            $push: {
                last100MessageActivity: {
                    $each: [{type: "Message", Date: Date.now(), message: `${message.channel.name} kanalına bir mesaj gönderdin ve ${config.coinConfigs.perOneMessageCoinCount} ${config.coinConfigs.coinName} kazandın.`}],
                    $slice: -99
                }
            }
        },
         // Puanı 5 arttırma
	  )
    let usero = await Users.findOne({id: message.member.id})
    
    if (usero.inviter) {
        let addcoin = (config.coinConfigs.perOneMessageCoinCount * config.coinConfigs.yuzde) / 100;
        await Users.updateOne(
            { id: usero.inviter }, // Güncellenecek belgenin kriteri (ID)
            { 
                $inc: { coin: addcoin, commissionCoin: addcoin },
                $push: {
                    last100CommisonActivity: {
                        $each: [{type: "MessageComisson", Date: Date.now(), message: `Davet ettiğin bir kullanıcı ${message.channel.name} kanalına bir mesaj gönderdi ve ${addcoin.toFixed(4)} ${config.coinConfigs.coinName} komisyon kazandın.`}],
                        $slice: -99
                    }
                }
            },
             // Puanı 5 arttırma
          )
    }

}

export { once, name, invoke };
