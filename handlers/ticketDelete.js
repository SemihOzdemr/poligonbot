import { EmbedBuilder, SlashCommandBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode,ChannelType, PermissionsBitField } from 'discord.js';
import config from '../config.json' assert { type: "json" };
import tickets from '../models/tickets.js';


export default async function ticketDelete(client, interaction) {
    try {
      let ticket = await tickets.findOne({id: interaction.channel.id, active: true})
      if (!ticket) return;
      let varmi = await interaction.member.roles.cache.has(config.ticketRole)
      if (!varmi && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

      await tickets.updateOne(
        { "id": interaction.channel.id}, // Belgede bir kriteri kullanarak güncelleme yapacağınız veriyi bulun
        { 
            "$set": { 
               "active": false
            }
        }
      )

      await interaction.channel.delete()

    return true;
    } catch (error) {
        let channel = await client.channels.cache.get(config.botErrorLogChannel)
       await channel.send("ticketDelete.js [handler] de hata meydana geldi!")
       console.log(error);
       return false;
    } 

    
}

