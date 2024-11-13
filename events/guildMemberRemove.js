import {inlineCode} from 'discord.js';
const once = false;
const name = 'guildMemberRemove';
import config from '../config.json' assert { type: "json" };
import Invites from '../models/invites.js';
import Users from '../models/User.js';


async function invoke(client,member) {
    try {
        let memberData = await Users.findOne({id: member.id});
        if(!memberData) return;
        let channel = await member.guild.channels.cache.get(config.invitePublicLogChannel);
        let messageol = memberData.inviter ? `${inlineCode(member.user.username)} Sunucudan ayrıldı. Davet eden: <@${memberData.inviter}>` : `Özel url ile katılan ${inlineCode(member.user.username)} Sunucudan ayrıldı.`
        await channel.send({
            content: messageol
        })
        if(!memberData.inviter) return;
        let inviterdata = await Users.findOne({id: memberData.inviter});
        if (!inviterdata) return;
        let ceck = await inviterdata.invites.find(x => x.id == member.id);
        if (ceck) {
           let newcoin = inviterdata.coin - config.coinConfigs.inviteCoinCount;
            await Users.updateOne(
              { "id": inviterdata.id}, // Belgede bir kriteri kullanarak güncelleme yapacağınız veriyi bulun
              { 
                  "$set": { 
                      "coin": ceck.win ? (newcoin < 0 ? 0 : newcoin) : inviterdata.coin
                  },
                  "$push": {
                      "last100InviteActivity": {
                          "$each": ceck.win ? [{type: "Invite", Date: Date.now(), message: `Davet ettiğin ${member.user.username} Kullanıcısı sunucuyu terk etti ve ondan kazandığın ${config.coinConfigs.inviteCoinCount} ${config.coinConfigs.coinName} geri alındı.`}] : [], // `yeniNesne`yi diziye ekle
                          "$slice": -99 // Dizi boyutunu en fazla 99 olarak ayarla
                      }
                  },
                  "$pull": {
                    "invites": {
                      "id": ceck.id  // Silmek istediğiniz ID'yi buraya girin
                    }
                  }
              }
            )

           
        }
        

        await Users.updateOne(
          { "id": memberData.id}, // Belgede bir kriteri kullanarak güncelleme yapacağınız veriyi bulun
          { 
              "$set": { 
                  "inviter": null
              }
          }
        );
   
       

        if(inviterdata.inviter && ceck && ceck?.win) {
           let commisoner = await Users.findOne({id: inviterdata.inviter});
           if (commisoner) {
            let addcoin = (config.coinConfigs.inviteCoinCount * config.coinConfigs.yuzde) / 100;
           let commissionCoin = commisoner.commissionCoin - addcoin
           let coinoo = commisoner.coin - addcoin

              await Users.updateOne(
                { "id": commisoner.id}, // Belgede bir kriteri kullanarak güncelleme yapacağınız veriyi bulun
                { 
                    "$set": { 
                        "coin": coinoo < 0 ? 0 : coinoo,
                        "commissionCoin": commissionCoin < 0 ? 0 : commissionCoin,
                    },
                    "$push": {
                        "last100CommisonActivity": {
                            "$each": [{type: "InviteCommission", Date: Date.now(), message: `Davet ettiğin bir Kullanıcının davet ettiği kişi sunucudan ayrıldı ve ondan kazandığın ${addcoin} ${config.coinConfigs.coinName} komisyon geri alındı.`}], // `yeniNesne`yi diziye ekle
                            "$slice": -99 // Dizi boyutunu en fazla 99 olarak ayarla
                        }
                    }
                }
              );

           }
        }

        
    } catch (error) {
        let channel = await client.channels.cache.get(config.botErrorLogChannel)
        await channel.send("guildMemberRemove.js [event] de hata meydana geldi!")
        console.log(error);
    }

}

export { once, name, invoke };
