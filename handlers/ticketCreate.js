import { EmbedBuilder, SlashCommandBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode,ChannelType, PermissionsBitField } from 'discord.js';
import config from '../config.json' assert { type: "json" };
import tickets from '../models/tickets.js';


export default async function ticketCreate(client, interaction) {
    try {
    let member = interaction.member
    let varmi = await tickets.findOne({user: interaction.member.id, active: true});
    if(varmi) return await interaction.reply({content: 'Zaten açık bir talebiniz var.', ephemeral: true});
    let count = await tickets.countDocuments();

    const newChannel = await member.guild.channels.create({
        name: `destek-${count+1}`,
        type: ChannelType.GuildText,
        parent: interaction.channel.parent,
        permissionOverwrites: [
            {
                id: member.id,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
            },
            {
                id: config.ticketRole,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AddReactions],
            },
            {
                id: member.guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AddReactions],
            }
        ]
      });

      let ticketData = new tickets({
        id: newChannel.id,
        user: interaction.member.id,
        active: true,
      })

      await ticketData.save()

      const embed = new EmbedBuilder()
      .setTitle(`Poligon Destek Sistemi`)
      .setDescription("Aşağıdaki butona tıklayarak destak talebini kapatabilirsiniz")
      ;
  
      const destekTalebiKapat = new ButtonBuilder()
      .setCustomId('destekTalebiKapat')
      .setLabel('Destek talebini kapat.')
      .setStyle(ButtonStyle.Danger)
      .setEmoji({ name: "delete", id: "1235374036964343899" });
  
      const row = new ActionRowBuilder()
      .addComponents(destekTalebiKapat);

      await newChannel.send({
        content: `<@&${config.ticketRole}>, <@${interaction.member.id}>`,
        embeds: [embed],
        components: [row]
      })

      await interaction.reply({content: `Destek talebi kanalınız oluşturuldu. <#${newChannel.id}> bu kanala giderek destek alabilirsiniz.`, ephemeral: true})

    return true;
    } catch (error) {
        let channel = await client.channels.cache.get(config.botErrorLogChannel)
       await channel.send("ticketCreate.js [handler] de hata meydana geldi!")
       console.log(error);
       return false;
    } 

    
}

