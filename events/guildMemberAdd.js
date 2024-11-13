const once = false;
const name = 'guildMemberAdd';
import newMemberAddRole from '../handlers/newMemberAddRole.js';
import addInvite from '../handlers/addInvite.js';
import checkUserAndCreate from '../handlers/checkUserAndCreate.js'
// yardım alındı : https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/coding-guides/tracking-used-invites.md

async function invoke(client,member) {
    await checkUserAndCreate(member)
    await newMemberAddRole(client,member);
    await addInvite(client,member);

}

export { once, name, invoke };
