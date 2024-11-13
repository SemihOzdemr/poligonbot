import {inlineCode} from "discord.js"
import config from '../config.json' assert { type: "json" };
import Users from '../models/User.js';
import Invites from '../models/invites.js';
import checkUserAndCreate from './checkUserAndCreate.js'

export default async function addInvite(client, member) {
    const publicChannel = await client.channels.cache.get(config.invitePublicLogChannel);
    try { 
        const newInvites = await member.guild.invites.fetch()
        const oldInvites = await Invites.find()
        const invite = await newInvites.find(i => i.uses > oldInvites.find(x => x.code == i.code).uses);
        if (invite) {
            let inviteupdates = await Invites.findOne({code: invite.code})
            inviteupdates.uses = invite.uses;
            await inviteupdates.save()
            const inviter = await client.users.cache.get(invite.inviterId);
            if (inviter) {
               await checkUserAndCreate(inviter)

               await Users.updateOne(
                { "id": member.id}, // Belgede bir kriteri kullanarak güncelleme yapacağınız veriyi bulun
                { 
                    "$set": { 
                        "inviter": inviter.id,
                       
                    }
                }
              )


               await Users.updateOne(
                { "id": inviter.id}, // Belgede bir kriteri kullanarak güncelleme yapacağınız veriyi bulun
                { 
                    "$push": {
                        "invites": {
                            "$each": [{id: member.id, win: false}] // `yeniNesne`yi diziye ekle
                        }
                    }
                }
              )


               await publicChannel.send(`<@${member.id}> Kullanıcısı Sunucuya katıldı. Davet eden <@${inviter.id}>`)
            } else {
                await publicChannel.send(`<@${member.id}> Kullanıcısı Sunucuya özel url ile katıldı.`)
            }
        } else {
           await publicChannel.send(`<@${member.id}> Kullanıcısı Sunucuya özel url ile katıldı.`)
        }
        


       
        return true;
    } catch (error) {
        let channel = await client.channels.cache.get(config.botErrorLogChannel)
       await channel.send("addInvite.js [handler] de hata meydana geldi!")
       await publicChannel.send(`<@${member.id}> Kullanıcısı Sunucuya özel url ile katıldı.`)
       console.log(error);
       return false;
    } 

    
}

