import config from '../config.json' assert { type: "json" };

export default async function newMemberAddRole(client, member) {
    try {
      let role = await member.guild.roles.cache.get(config.unregisterRole)
      await member.roles.add(role)
      return true;
    } catch (error) {
        let channel = await client.channels.cache.get(config.botErrorLogChannel)
       await channel.send("newMemberAddRole.js [handler] de hata meydana geldi!")
       console.log(error);
       return false;
    } 

    
}

