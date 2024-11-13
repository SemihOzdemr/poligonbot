import { EmbedBuilder, SlashCommandBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Component,ComponentType, RoleSelectMenuBuilder } from 'discord.js';
import config from '../config.json' assert { type: "json" };
import Products from '../models/products.js';
import roleSelectMessage from '../models/roleSelectMessage.js';




export default async function selectRoleSetup(client) {
    try {
    let channel = client.channels.cache.get(config.roleSelectChannelId)
    if(!channel) return false;
    




    const gameRoleSelect = new StringSelectMenuBuilder()
    .setCustomId('gameRoleSelect').setPlaceholder(`Almak istediğiniz rolleri seçin!`).setMaxValues(config.selectGameRoles.length).setMinValues(0);

    const watchRoleSelect = new StringSelectMenuBuilder()
    .setCustomId('watchRoleSelect').setPlaceholder(`Almak istediğiniz rolleri seçin!`).setMaxValues(config.selectWatchRoles.length).setMinValues(0);

   

    for (const role of config.selectGameRoles) {
        gameRoleSelect.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${role.name}`).setValue(`${role.id}`).setEmoji(role.emojiID))
    }
    
    for (const role of config.selectWatchRoles) {
        watchRoleSelect.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${role.name}`).setValue(`${role.id}`).setEmoji(role.emojiID))
    }

    const row = new ActionRowBuilder()
    .addComponents(gameRoleSelect);
 
    const row2 = new ActionRowBuilder()
    .addComponents(watchRoleSelect);

    let messages = await roleSelectMessage.find()

    if (messages.length == 0) {
        let newMessage = await channel.send({
            content: `Oyun rollerini aşağıdaki menüden seçebilirsiniz. (üzerinizde seçtiğiniz rol varsa geri alır)`,
            components: [row]
        })
        let newMessage2 = await channel.send({
            content: `Platform rollerini aşağıdaki menüden seçebilirsiniz. (üzerinizde seçtiğiniz rol varsa geri alır)`,
            components: [row2]
        })

        let newMessageData = new roleSelectMessage({
            id: newMessage.id
        });
        let newMessageData2 = new roleSelectMessage({
            id: newMessage2.id
        });
       await newMessageData.save()
       await newMessageData2.save()
    } else {
        let checkMsg = await channel.messages.fetch(messages[0].id).catch(x => undefined);
        let checkMsg2 = await channel.messages.fetch(messages[1].id).catch(x => undefined);

        if (!checkMsg || !checkMsg2) {
           await roleSelectMessage.deleteMany()

           let newMessage = await channel.send({
            content: `Oyun rollerini aşağıdaki menüden seçebilirsiniz. (üzerinizde seçtiğiniz rol varsa geri alır)`,
            components: [row]
        })
        let newMessage2 = await channel.send({
            content: `Platform rollerini aşağıdaki menüden seçebilirsiniz. (üzerinizde seçtiğiniz rol varsa geri alır)`,
            components: [row2]
        })

        let newMessageData = new roleSelectMessage({
            id: newMessage.id
        });
        let newMessageData2 = new roleSelectMessage({
            id: newMessage2.id
        });
       await newMessageData.save()
       await newMessageData2.save()
     
        }
    }


    return true;
    } catch (error) {
        try {
            let channel = await client.channels.cache.get(config.botErrorLogChannel)
            await channel.send("selectRoleSetup.js [handler] de hata meydana geldi!")
        } catch (error) {
            
        }
       
       console.log(error);
       return false;
    } 

    
}

