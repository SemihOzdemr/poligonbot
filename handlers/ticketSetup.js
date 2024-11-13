import { EmbedBuilder, SlashCommandBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode } from 'discord.js';
import config from '../config.json' assert { type: "json" };
import ticketMessage from '../models/ticketMessage.js';

export default async function ticketSetup(client) {
    try {
    let channel = client.channels.cache.get(config.ticketChannelId)
    if(!channel) return false;

    const embed = new EmbedBuilder()
    .setTitle(`Poligon Destek Sistemi`)
	.setDescription("'Destek Talebi Oluştur' butonuna basarak destek talebi oluşturabilirsin.")
    ;

    const destekTalebiOlustur = new ButtonBuilder()
    .setCustomId('destekTalebiOlustur')
    .setLabel('Destek Talebi Oluştur')
    .setStyle(ButtonStyle.Success)
    .setEmoji({ name: "ticket", id: "1235375170831519836" });

    const row = new ActionRowBuilder()
    .addComponents(destekTalebiOlustur);


    let messages = await ticketMessage.find()
    if (messages.length == 0) {
        let newMessage = await channel.send({
            embeds: [embed],
            components: [row]
        })

        let newMessageData = new ticketMessage({
            id: newMessage.id
        });
       await newMessageData.save()
        
    } else {
        let checkMsg = await channel.messages.fetch(messages[0].id).catch(x => undefined);
      
        if (!checkMsg) {
           await ticketMessage.deleteMany()

           let newMessage = await channel.send({
            embeds: [embed],
            components: [row]
        })

        let newMessageData = new ticketMessage({
            id: newMessage.id
        });
       await newMessageData.save()
     
        }
    }
    
    return true;
    } catch (error) {
        let channel = await client.channels.cache.get(config.botErrorLogChannel)
       await channel.send("ticketSetup.js [handler] de hata meydana geldi!")
       console.log(error);
       return false;
    } 

    
}

