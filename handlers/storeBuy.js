import { EmbedBuilder, SlashCommandBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Component,ComponentType,ChannelType,PermissionsBitField } from 'discord.js';
import config from '../config.json' assert { type: "json" };
import storeMessage from '../models/storeMessage.js';
import Products from '../models/products.js';
import User from '../models/User.js';
import checkUserAndCreate from './checkUserAndCreate.js';
import sales from '../models/sales.js';



export default async function storeBuy(client,interaction) {
    try {
        if(!interaction.values[0]) return interaction.deferUpdate();

      let productData = await Products.findOne({ _id: interaction.values[0] }).catch(x => {return undefined;});
      if (!productData) return interaction.deferUpdate();
       await checkUserAndCreate(interaction.member)
      let userdata = await User.findOne({id: interaction.member.id});
        
      if (userdata.coin < productData.coin) return await interaction.reply({content: `Yetersiz ${config.coinConfigs.coinName}`, ephemeral: true});

      const SatinAlButton = new ButtonBuilder()
      .setCustomId('SatinAlButton')
      .setLabel('Satın Al')
      .setStyle(ButtonStyle.Success)
      .setEmoji({ name: "white_cart", id: "1236303943278133301" });

      const row2 = new ActionRowBuilder()
        .addComponents(SatinAlButton);

     let reply = await interaction.reply({
            content: `**${config.coinConfigs.coinEmoji} ${productData.coin} | ${productData.name}** alımını onaylamak için 'Satın Al' butonuna tıklayın.`, 
            components: [row2],
            ephemeral: true
        })
        const collectorFilter = i => {
            return i.user.id === interaction.user.id;
        };

        await reply.awaitMessageComponent({ filter: collectorFilter, componentType: ComponentType.Button, time: 30_000 })
        .then(async interactiono => {
            if (interactiono.customId == "SatinAlButton") {
                const currentCoin = userdata.coin;
                const newCoin = currentCoin - productData.coin;
                userdata.coin = newCoin;
                await userdata.save()

                let count = await sales.countDocuments();

                const newChannel = await interaction.member.guild.channels.create({
                    name: `satış-${count+1}`,
                    type: ChannelType.GuildText,
                    parent: interaction.channel.parent,
                    permissionOverwrites: [
                        {
                            id: interaction.member.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                        },
                        {
                            id: config.storeStaffRole,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AddReactions],
                        },
                        {
                            id: interaction.member.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AddReactions],
                        }
                    ]
                  });

                  let ticketData = new sales({
                    id: newChannel.id,
                    user: interaction.member.id,
                    active: true,
                    productId: productData._id,
                    productName: productData.name,
                    productCoin: productData.coin
                    })
            
                  await ticketData.save()

                  const embed = new EmbedBuilder()
                  .setTitle(`Poligon Mağaza Sistemi`)
                  .setDescription(`Aşağıdaki butona tıklayarak teslimatı onaylayabilirsiniz. (Mağaza Ekibi)\n\nSatın alınan ürün:\n\n${config.coinConfigs.coinEmoji} ${productData.coin} | ${productData.name}`)
                  ;
              
                  const urunTeslimEdildi = new ButtonBuilder()
                  .setCustomId('urunTeslimEdildi')
                  .setLabel('Ürün Teslim Edildi')
                  .setStyle(ButtonStyle.Success)
                  .setEmoji({ name: "verified_white", id: "1235374918649122817" });
              
                  const row = new ActionRowBuilder()
                  .addComponents(urunTeslimEdildi);
            
                  await newChannel.send({
                    content: `<@&${config.storeStaffRole}>, <@${interaction.member.id}>`,
                    embeds: [embed],
                    components: [row]
                  })
                interactiono.deferUpdate()
                await interaction.editReply({content: `**${config.coinConfigs.coinEmoji} ${productData.coin} | ${productData.name}** ürününü aldınız. Satın aldığınız ürün size <#${newChannel.id}> kanalından teslim edilecek.`, ephemeral: true, components: []})
            }
        }).catch(async err => {
            noerror = false
            await interaction.editReply({
                content:"Satın alma işlemi için 30 saniyeden fazla beklediniz.",
                components: [],
                embeds: []
            })
        });

     

    return true;
    } catch (error) {
        try {
            let channel = await client.channels.cache.get(config.botErrorLogChannel)
            await channel.send("storeBuy.js [handler] de hata meydana geldi!")
        } catch (error) {
            
        }
       
       console.log(error);
       return false;
    } 

    
}

