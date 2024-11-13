import {inlineCode} from 'discord.js';
const once = false;
const name = 'guildMemberUpdate';
import config from '../config.json' assert { type: "json" };
import Invites from '../models/invites.js';
import Users from '../models/User.js';


async function invoke(client,oldMember, newMember) {
    try {
        const hadRole = oldMember.roles.cache.find(role => role.id === '1232093806644559894');
        const hasRole = newMember.roles.cache.find(role => role.id === '1232093806644559894');
        
        if (!hadRole && hasRole) {
            await Users.updateOne(
                { id: oldMember.id }, // Güncellenecek belgenin kriteri (ID)
                { 
                    $inc: { coin: 100 },
        
                },
                 // Puanı 5 arttırma
              );

            let boostchannel = client.channels.cache.get("1232092013181140994") 
            await boostchannel.send({
                content: `<@${oldMember.id}> sunucuya takviye yaptı ve 100 ${config.coinConfigs.coinName} kazandı.`
            })
          
          }
        
        
    } catch (error) {
        let channel = await client.channels.cache.get(config.botErrorLogChannel)
        await channel.send("guildMemberUpdate.js [event] de hata meydana geldi!")
        console.log(error);
    }

}

export { once, name, invoke };
