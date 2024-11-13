import { EmbedBuilder, SlashCommandBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Component,ComponentType } from 'discord.js';
import config from '../config.json' assert { type: "json" };
import storeMessage from '../models/storeMessage.js';
import Products from '../models/products.js';



export default async function storeSetup(client) {
    try {
    let channel = client.channels.cache.get(config.storeChannelId)
    if(!channel) return false;
    
    let products = await Products.find();

   products.sort((a, b) => a.coin - b.coin);

   let groupedByCoin = products.reduce((acc, product) => {
    // Coin miktarına göre gruplandırma
    if (!acc[product.coin]) {
        acc[product.coin] = [];
    }
    acc[product.coin].push(product);
    return acc;
    }, {});


    const embed = new EmbedBuilder()
    .setTitle(`Poligon Mağaza Sistemi`)
	.setDescription("Menü aracılığı ile istediğiniz ürünü satın alabilirsiniz.")
    ;
    const select = new StringSelectMenuBuilder()
    .setCustomId('storeBuy');



    select.setPlaceholder(`Satın almak istediğiniz ürünü seçin!`);

    if (products.length == 0) return;

    let first = true;

    for (const coinAmount of Object.keys(groupedByCoin)) {
        // Her bir coin miktarı için gruplandırılmış ürünleri al
        const products = groupedByCoin[coinAmount];
        
        if (first) {
            first = false
            
        } else {
            select.addOptions(new StringSelectMenuOptionBuilder().setLabel(`---------------------------------------`).setValue(`${coinAmount}`))
        }
        
        // Her bir ürün üzerinde döngü
        for (const product of products) {
            select.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${product.coin} | ${product.name}`).setValue(`${product._id}`).setEmoji('1233147074380435486'))
        }
    }

    /*const SatinAlButton = new ButtonBuilder()
      .setCustomId('SatinAlButton')
      .setLabel('Satın Al')
      .setStyle(ButtonStyle.Success)
      .setEmoji({ name: "white_cart", id: "1236303943278133301" });
 */
    const row = new ActionRowBuilder()
    .addComponents(select);
    /*const row2 = new ActionRowBuilder()
    .addComponents(SatinAlButton);*/

    let messages = await storeMessage.find()

    if (messages.length == 0) {
        let newMessage = await channel.send({
            embeds: [embed],
            components: [row]
        })

        let newMessageData = new storeMessage({
            id: newMessage.id
        });
       await newMessageData.save()
        
    } else {
        let checkMsg = await channel.messages.fetch(messages[0].id).catch(x => undefined);
      
        if (!checkMsg) {
           await storeMessage.deleteMany()

           let newMessage = await channel.send({
            embeds: [embed],
            components: [row]
        })

        let newMessageData = new storeMessage({
            id: newMessage.id
        });
       await newMessageData.save()
     
        }
    }


    return true;
    } catch (error) {
        try {
            let channel = await client.channels.cache.get(config.botErrorLogChannel)
            await channel.send("storeSetup.js [handler] de hata meydana geldi!")
        } catch (error) {
            
        }
       
       console.log(error);
       return false;
    } 

    
}

