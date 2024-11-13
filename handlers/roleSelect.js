import { EmbedBuilder, SlashCommandBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Component,ComponentType,ChannelType,PermissionsBitField } from 'discord.js';
import config from '../config.json' assert { type: "json" };
import storeMessage from '../models/storeMessage.js';
import Products from '../models/products.js';
import User from '../models/User.js';
import checkUserAndCreate from './checkUserAndCreate.js';
import sales from '../models/sales.js';

async function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

export default async function roleSelect(client,interaction) {
    try {

        if(!interaction.values[0]) return interaction.deferUpdate();

       await interaction.reply({content: "işlem sürüyor lütfen bekleyin...",ephemeral: true})
        let alınan = [];
        let verilen = [];

        for (const roleId of interaction.values) {
            
            let varmi = await interaction.member.roles.cache.has(roleId)
            let role = await interaction.member.guild.roles.cache.get(roleId)
            

            if (!varmi) {
                await interaction.member.roles.add(role)
                verilen.push(role.name)
            } else {
                await interaction.member.roles.remove(role)
                alınan.push(role.name)
            }
         
           await sleep(200);
        }
     
       await interaction.editReply({
        content: `${verilen.length ? `Verilen Roller:\n\n${verilen.join("\n")}` : ""}\n\n${alınan.length ? `Geri Alınan Roller:\n\n${alınan.join("\n")}` : ""}`,
        ephemeral: true
       })

    return true;
    } catch (error) {
        try {
            let channel = await client.channels.cache.get(config.botErrorLogChannel)
            await channel.send("roleSelect.js [handler] de hata meydana geldi!")
        } catch (error) {
            
        }
       
       console.log(error);
       return false;
    } 

    
}

