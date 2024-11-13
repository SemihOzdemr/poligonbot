import {inlineCode} from "discord.js"
const once = false;
const name = 'inviteDelete';
import Invites from '../models/invites.js';
import Users from '../models/User.js';
import config from '../config.json' assert { type: "json" };
// yardım alındı : https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/coding-guides/tracking-used-invites.md

async function invoke(client,invite) {
    if (invite.guild.id !== config.guildid) return;
    if (invite.guild.vanityURLCode == invite.code) return;
    let privChannel = client.channels.cache.get(config.invitePrivateLogChannel)
    let invitedata = await Invites.findOne({code: invite.code}) || null

    if (!invitedata) return;
    try {
  
    await Invites.deleteOne({code: invite.code})
    privChannel.send(`(<a:onay:1232516007784874086>) <@${invitedata.inviter}> kullanıcısının ${inlineCode(invite.code)} davet kodu silindi.`)


    } catch (error) {
        privChannel.send(`(<a:red:1232516062139121848>) <@${invitedata.inviter}> kullanıcısının ${inlineCode(invite.code)} davet kodu silindi ancak veritabanından silinemedi`)
    }

}

export { once, name, invoke };
