import { EmbedBuilder, SlashCommandBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode,ChannelType, PermissionsBitField } from 'discord.js';
import config from '../config.json' assert { type: "json" };
import sales from '../models/sales.js';



export default async function deleteSales(client, interaction) {
    try {
      let ticket = await sales.findOne({id: interaction.channel.id, active: true})
      if (!ticket) return await interaction.reply({content:"Böyle bir satış bulunamadı.", ephemeral: true});
      let varmi = await interaction.member.roles.cache.has(config.storeStaffRole)
      if (!varmi && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({content:`Bu işlemi sadece <@&${config.storeStaffRole}> ve yöneticiler yapabilir.`, ephemeral: true});

      await sales.updateOne(
        { "id": interaction.channel.id}, // Belgede bir kriteri kullanarak güncelleme yapacağınız veriyi bulun
        { 
            "$set": { 
               "active": false,
               "deliverer": interaction.member.id
            }
        }
      )

      await interaction.channel.delete()

    return true;
    } catch (error) {
        let channel = await client.channels.cache.get(config.botErrorLogChannel)
       await channel.send("deleteSales.js [handler] de hata meydana geldi!")
       console.log(error);
       return false;
    } 

    
}

