import {inlineCode} from "discord.js"
const once = false;
const name = 'inviteCreate';
import Invites from '../models/invites.js';
import Users from '../models/User.js';
import config from '../config.json' assert { type: "json" };
// yardım alındı : https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/coding-guides/tracking-used-invites.md

async function invoke(client,invite) {
    if (invite.guild.id !== config.guildid) return;
    if (invite.guild.vanityURLCode == invite.code) return;
    let inviter = invite.guild.members.cache.get(invite.inviterId) || null
    if (!inviter) return;
    let privChannel = client.channels.cache.get(config.invitePrivateLogChannel)

    try {
   let newInvite = new Invites({
        code: invite.code,
        uses: invite.uses,
        inviter: invite.inviterId
    })
        
    await newInvite.save()
    privChannel.send(`(<a:onay:1232516007784874086>) <@${invite.inviterId}> kullanıcısı ${inlineCode(invite.code)} davet kodunu oluşturdu.`)


    } catch (error) {
        privChannel.send(`(<a:red:1232516062139121848>) <@${invite.inviterId}> kullanıcısı ${inlineCode(invite.code)} davet kodunu oluşturdu ancak veritabanına kaydedilemedi`)
    }

}

export { once, name, invoke };
