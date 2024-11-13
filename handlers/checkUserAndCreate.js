import config from '../config.json' assert { type: "json" };
import Users from '../models/User.js';

export default async function checkUserAndCreate(member) {
    try {
        const check = await Users.findOne({id: member.id});
        if (check) {
          return true;
        } else {
        let newUser = new Users({
            id: member.id,
            coin: 0,
            commissionCoin: 0,
        })

        await newUser.save()

        return true;

        }
    } catch (error) {
        let channel = await client.channels.cache.get(config.botErrorLogChannel)
       await channel.send("checkUserAndCreate.js [handler] de hata meydana geldi!")
       console.log(error);
        return false;

    }

}