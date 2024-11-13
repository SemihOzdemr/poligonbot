import { EmbedBuilder, SlashCommandBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode } from 'discord.js';
import config from '../config.json' assert { type: "json" };
import registerMessage from '../models/registerMessage.js';

export default async function registerSetup(client) {
    try {
    let channel = client.channels.cache.get(config.registerChannelId)
    if(!channel) return false;

    const embed = new EmbedBuilder()
    .setTitle(`Poligon Kayıt Sistemi`)
	.setDescription("'Kayıt Ol' butonuna basarak kayıt olabilirsin.")
    ;

    const kayıtOl = new ButtonBuilder()
    .setCustomId('kayıtOl')
    .setLabel('Kayıt Ol')
    .setStyle(ButtonStyle.Success)
    .setEmoji({ name: "invite", id: "1233904242507649180" });

    const row = new ActionRowBuilder()
    .addComponents(kayıtOl);

    let messages = await registerMessage.find()
    if (messages.length == 0) {
        let newMessage = await channel.send({
            embeds: [embed],
            components: [row]
        })

        let newMessageData = new registerMessage({
            id: newMessage.id
        });
       await newMessageData.save()
        
    } else {
        let checkMsg = await channel.messages.fetch(messages[0].id).catch(x => undefined);
      
        if (!checkMsg) {
           await registerMessage.deleteMany()

           let newMessage = await channel.send({
            embeds: [embed],
            components: [row]
        })

        let newMessageData = new registerMessage({
            id: newMessage.id
        });
       await newMessageData.save()
     
        }
    }
    
    return true;
    } catch (error) {
        let channel = await client.channels.cache.get(config.botErrorLogChannel)
       await channel.send("registerSetup.js [handler] de hata meydana geldi!")
       console.log(error);
       return false;
    } 

    
}

