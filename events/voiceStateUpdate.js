import {inlineCode} from "discord.js"
const once = false;
const name = 'voiceStateUpdate';
import Users from '../models/User.js';
import checkUserAndCreate from '../handlers/checkUserAndCreate.js'
import msToTime from '../handlers/msToTime.js'
import createChannel from '../handlers/createChannel.js'
import config from '../config.json' assert { type: "json" };

// yardım alındı: https://github.com/aloshai/discord-stats-bot/blob/master/Events/voiceStats.js



async function invoke(VoiceActivites, client, oldState, newState) {
    if((oldState.member && oldState.member.user.bot) || (newState.member && newState.member.user.bot)) return;

    let voiceLogChannel = client.channels.cache.get(config.VoiceLogChannel)
    /*BURADA KANAL OLUŞTURMA VB. OLACAK*/ 
    let member = oldState.member || newState.member
    await checkUserAndCreate(member)
    createChannel(client,oldState,newState)
   // ChannelType.GuildVoice
    try {

        let guild = await client.guilds.cache.get(config.guildid)
        let currDate = Date.now(); 

    if(!oldState.channelId && newState.channelId) { // bir kanala yeni katıldı (ilk giriş)
        if(newState.channelId == newState.guild.afkChannelId) return;
        voiceLogChannel.send(`${member.user.username}(${inlineCode(member.id)}) adlı kullanıcı <#${newState.channelId}> kanalına katıldı.`)
       if (newState.selfDeaf || newState.selfMute) {
       
       } else {
       
        await VoiceActivites.set(oldState.id, currDate);
       }
       
    }


    if(oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) { // kanal değiştirdi
  
        voiceLogChannel.send(`${member.user.username}(${inlineCode(member.id)}) adlı kullanıcı <#${oldState.channelId}> kanalından <#${newState.channelId}> kanalına geçti.`)

        if (newState.selfDeaf || newState.selfMute || oldState.selfDeaf || oldState.selfMute) {
           
           } else {
           

            let commisoner;
            let userData = await Users.findOne({id: member.id});
            if(userData.inviter) {
                commisoner = await Users.findOne({id: userData.inviter});
            }
            const data = VoiceActivites.get(oldState.id);
            const duration = currDate - data || 0;
            const kazanılancoin = (duration / 60000) * config.coinConfigs.voicePerOneMinuteCoinCount
            if(newState.channelId == newState.guild.afkChannelId) {
                VoiceActivites.delete(oldState.id);
            } else {
                VoiceActivites.set(oldState.id, currDate); // bu değişecek
            }
            
            if (!data) return;
           let parent = guild.channels.cache.get(oldState.channelId).parent || {id:"1111111111111", name: "KATEGORİSİZ KANALLAR"};
           if (isNaN(duration)) return;
           
            let ceck = await userData.voiceStat.find(x => x.id == parent.id);
            if(ceck) {
               await Users.updateOne(
                    { "id": member.id}, // Belgede bir kriteri kullanarak güncelleme yapacağınız veriyi bulun
                    { 
                        "$set": { 
                            "voiceStat.$[elem].time": ceck.time + duration || ceck.time,
                            "coin": (userData.coin + kazanılancoin)
                        },
                        "$push": {
                            "last100VoiceActivity": {
                                "$each": [{type: "Voice", Date: currDate, message: `${parent.name} kategorisinde ${msToTime(duration)} boyunca kaldın ve ${kazanılancoin.toFixed(4)} $coin-name$ kazandın (kanal değiştirme)`}], // `yeniNesne`yi diziye ekle
                                "$slice": -99 // Dizi boyutunu en fazla 99 olarak ayarla
                            }
                        }
                    },
                    {
                      "arrayFilters": [ { "elem.id": parent.id } ] // `id`'si 1 olan nesneye odaklanın
                    }
                  )

                 
                

            } else {

                await Users.updateOne(
                    { "id": member.id}, // Belgede bir kriteri kullanarak güncelleme yapacağınız veriyi bulun
                    { 
                        "$set": { 
                            "coin": (userData.coin + kazanılancoin)
                        },
                        "$push": {
                            "last100VoiceActivity": {
                                "$each": [{type: "Voice", Date: currDate, message: `${parent.name} kategorisinde ${msToTime(duration)} boyunca kaldın ve ${kazanılancoin.toFixed(4)} $coin-name$ kazandın (kanal değiştirme)`}], // `yeniNesne`yi diziye ekle
                                "$slice": -99 // Dizi boyutunu en fazla 99 olarak ayarla
                            },
                            "voiceStat": {
                                "$each": [{id: parent.id, time: duration}] // `yeniNesne`yi diziye ekle
                                
                            }

                        }
                    }
                  )

            }

            if (commisoner) {
                let addcoin = (kazanılancoin * config.coinConfigs.yuzde) / 100;
                await Users.updateOne(
                    { "id": commisoner.id}, // Belgede bir kriteri kullanarak güncelleme yapacağınız veriyi bulun
                    { 
                        "$set": { 
                            "coin": (commisoner.coin + addcoin),
                            "commissionCoin": (commisoner.commissionCoin + addcoin)
                        },
                        "$push": {
                            "last100CommisonActivity": {
                                "$each": [{type: "VoiceCommission", Date: currDate, message: `Davet ettiğin ${member.user.username} kullanıcısı ${parent.name} kategorisinde ${msToTime(duration)} boyunca kaldı ve sana ${addcoin.toFixed(4)} $coin-name$ kazandırdı (kanal değiştirme)`}], // `yeniNesne`yi diziye ekle
                                "$slice": -99 // Dizi boyutunu en fazla 99 olarak ayarla
                            }
                        }
                    }
                  )
            }
            

           }
    }

    if (((oldState.selfDeaf && !newState.selfDeaf) || (oldState.selfMute && !newState.selfMute)) && (!newState.selfDeaf && !newState.selfMute) && !newState.selfDeaf && !newState.selfMute && oldState.channelId && newState.channelId && oldState.channelId == newState.channelId) { // kulaklığını veya mic açtı
       
        await VoiceActivites.set(oldState.id, currDate);
    }

    if(oldState.channelId && !newState.channelId) { // sesten tamamen çıktı
        voiceLogChannel.send(`${member.user.username}(${inlineCode(member.id)}) adlı kullanıcı <#${oldState.channelId}> kanalındayken tamamen sesten çıktı.`)
        if (oldState.selfDeaf || oldState.selfMute) {
          
           } else {
           
           
            let commisoner;
            let userData = await Users.findOne({id: member.id});
            if(userData.inviter) {
                commisoner = await Users.findOne({id: userData.inviter});
            }
            const data = VoiceActivites.get(oldState.id);
            const duration = currDate - data || 0;
            const kazanılancoin = (duration / 60000) * config.coinConfigs.voicePerOneMinuteCoinCount
            VoiceActivites.delete(oldState.id); // bu değişecek
            if (!data) return;
           let parent = guild.channels.cache.get(oldState.channelId).parent || {id:"1111111111111", name: "KATEGORİSİZ KANALLAR"};
           if (isNaN(duration)) return;
           
            let ceck = await userData.voiceStat.find(x => x.id == parent.id);
            if(ceck) {
               await Users.updateOne(
                    { "id": member.id}, // Belgede bir kriteri kullanarak güncelleme yapacağınız veriyi bulun
                    { 
                        "$set": { 
                            "voiceStat.$[elem].time": ceck.time + duration || ceck.time,
                            "coin": (userData.coin + kazanılancoin)
                        },
                        "$push": {
                            "last100VoiceActivity": {
                                "$each": [{type: "Voice", Date: currDate, message: `${parent.name} kategorisinde ${msToTime(duration)} boyunca kaldın ve ${kazanılancoin.toFixed(4)} $coin-name$ kazandın (sesten çıkma)`}], // `yeniNesne`yi diziye ekle
                                "$slice": -99 // Dizi boyutunu en fazla 99 olarak ayarla
                            }
                        }
                    },
                    {
                      "arrayFilters": [ { "elem.id": parent.id } ] // `id`'si 1 olan nesneye odaklanın
                    }
                  )

                 
                

            } else {

                await Users.updateOne(
                    { "id": member.id}, // Belgede bir kriteri kullanarak güncelleme yapacağınız veriyi bulun
                    { 
                        "$set": { 
                            "coin": (userData.coin + kazanılancoin)
                        },
                        "$push": {
                            "last100VoiceActivity": {
                                "$each": [{type: "Voice", Date: currDate, message: `${parent.name} kategorisinde ${msToTime(duration)} boyunca kaldın ve ${kazanılancoin.toFixed(4)} $coin-name$ kazandın (sesten çıkma)`}], // `yeniNesne`yi diziye ekle
                                "$slice": -99 // Dizi boyutunu en fazla 99 olarak ayarla
                            },
                            "voiceStat": {
                                "$each": [{id: parent.id, time: duration}] // `yeniNesne`yi diziye ekle
                                
                            }

                        }
                    }
                  )

            }

            if (commisoner) {
                let addcoin = (kazanılancoin * config.coinConfigs.yuzde) / 100;
                await Users.updateOne(
                    { "id": commisoner.id}, // Belgede bir kriteri kullanarak güncelleme yapacağınız veriyi bulun
                    { 
                        "$set": { 
                            "coin": (commisoner.coin + addcoin),
                            "commissionCoin": (commisoner.commissionCoin + addcoin)
                        },
                        "$push": {
                            "last100CommisonActivity": {
                                "$each": [{type: "VoiceCommission", Date: currDate, message: `Davet ettiğin ${member.user.username} kullanıcısı ${parent.name} kategorisinde ${msToTime(duration)} boyunca kaldı ve sana ${addcoin.toFixed(4)} $coin-name$ kazandırdı (sesten çıkma)`}], // `yeniNesne`yi diziye ekle
                                "$slice": -99 // Dizi boyutunu en fazla 99 olarak ayarla
                            }
                        }
                    }
                  )
            }
            
           }
    }

    if (((!oldState.selfDeaf && newState.selfDeaf) || (!oldState.selfMute && newState.selfMute)) && (!oldState.selfDeaf && !oldState.selfMute) && oldState.channelId && newState.channelId && oldState.channelId == newState.channelId) { // kulaklığını veya mic kapadı
       


            let commisoner;
            let userData = await Users.findOne({id: member.id});
            if(userData.inviter) {
                commisoner = await Users.findOne({id: userData.inviter});
            }
            const data = VoiceActivites.get(oldState.id);
            const duration = currDate - data || 0;
            const kazanılancoin = (duration / 60000) * config.coinConfigs.voicePerOneMinuteCoinCount
            VoiceActivites.delete(oldState.id); // bu değişecek
            if (!data) return;
           let parent = guild.channels.cache.get(oldState.channelId).parent || {id:"1111111111111", name: "KATEGORİSİZ KANALLAR"};
           if (isNaN(duration)) return;
           
            let ceck = await userData.voiceStat.find(x => x.id == parent.id);
            if(ceck) {
               await Users.updateOne(
                    { "id": member.id}, // Belgede bir kriteri kullanarak güncelleme yapacağınız veriyi bulun
                    { 
                        "$set": { 
                            "voiceStat.$[elem].time": ceck.time + duration || ceck.time,
                            "coin": (userData.coin + kazanılancoin)
                        },
                        "$push": {
                            "last100VoiceActivity": {
                                "$each": [{type: "Voice", Date: currDate, message: `${parent.name} kategorisinde ${msToTime(duration)} boyunca kaldın ve ${kazanılancoin.toFixed(4)} $coin-name$ kazandın. (kulaklık veya mic kapama)`}], // `yeniNesne`yi diziye ekle
                                "$slice": -99 // Dizi boyutunu en fazla 99 olarak ayarla
                            }
                        }
                    },
                    {
                      "arrayFilters": [ { "elem.id": parent.id } ] // `id`'si 1 olan nesneye odaklanın
                    }
                  )

                 
                

            } else {

                await Users.updateOne(
                    { "id": member.id}, // Belgede bir kriteri kullanarak güncelleme yapacağınız veriyi bulun
                    { 
                        "$set": { 
                            "coin": (userData.coin + kazanılancoin)
                        },
                        "$push": {
                            "last100VoiceActivity": {
                                "$each": [{type: "Voice", Date: currDate, message: `${parent.name} kategorisinde ${msToTime(duration)} boyunca kaldın ve ${kazanılancoin.toFixed(4)} $coin-name$ kazandın (kulaklık veya mic kapama)`}], // `yeniNesne`yi diziye ekle
                                "$slice": -99 // Dizi boyutunu en fazla 99 olarak ayarla
                            },
                            "voiceStat": {
                                "$each": [{id: parent.id, time: duration}] // `yeniNesne`yi diziye ekle
                                
                            }

                        }
                    }
                  )

            }

            if (commisoner) {
                let addcoin = (kazanılancoin * config.coinConfigs.yuzde) / 100;
                await Users.updateOne(
                    { "id": commisoner.id}, // Belgede bir kriteri kullanarak güncelleme yapacağınız veriyi bulun
                    { 
                        "$set": { 
                            "coin": (commisoner.coin + addcoin),
                            "commissionCoin": (commisoner.commissionCoin + addcoin)
                        },
                        "$push": {
                            "last100CommisonActivity": {
                                "$each": [{type: "VoiceCommission", Date: currDate, message: `Davet ettiğin ${member.user.username} kullanıcısı ${parent.name} kategorisinde ${msToTime(duration)} boyunca kaldı ve sana ${addcoin.toFixed(4)} $coin-name$ kazandırdı (kulaklık veya mic kapama)`}], // `yeniNesne`yi diziye ekle
                                "$slice": -99 // Dizi boyutunu en fazla 99 olarak ayarla
                            }
                        }
                    }
                  )
            }
    }


    } catch (error) {
        let channel = await client.channels.cache.get(config.botErrorLogChannel)
        await channel.send("voiceStateUpdate.js [event] de hata meydana geldi!")
        console.log(error);
    }


}

export { once, name, invoke };
