import config from '../config.json' assert { type: "json" };
import {inlineCode, ChannelType, PermissionsBitField} from "discord.js";
import Streamers from '../models/streamers.js';
const CreateChannelActivites = new Map();

async function kontrolet(guild, name, number, parentid) {
    let namee;
   let parrentchannels = await guild.channels.cache.filter(channel => channel.parentId === parentid);

   let arr = parrentchannels.map(x => x.name)
    
   if (parrentchannels.size == 1) {
    namee = `${name}1`;
   } else {
    const numberRegex = /\d+/g;

    // Dizi üzerinde map işlemi gerçekleştirerek her öğeden sadece sayıları alın
    let numbers = arr.map(item => {
        // Öğeyi düzenli ifade ile eşleştirin ve sadece sayıları alın
        let matches = item.match(numberRegex);
        // Eğer eşleşme varsa, sayı dizisini düzleştirin ve birleştirin
        // Eşleşme yoksa boş bir dizi döndürün
        return matches ? matches.join('') : '';
    });
    
    // Sonuç dizisinden boş string'leri çıkarmak için filter işlemini kullanın
    numbers = numbers.filter(num => num !== '');
    
    // Dizideki sayı string'lerini sayılara dönüştürmek için map işlemini kullanın
    let numberValues = numbers.map(num => parseFloat(num));
    
    // Dizideki en büyük sayıyı bulmak için Math.max fonksiyonunu kullanın
    // ... (spread operator) diziyi ayrı ayrı argümanlara dönüştürmek için kullanılır
    let maxNumber = Math.max(...numberValues);
    namee = `${name}${maxNumber+1}`;
   }
 

    return namee;
}


export default async function createChannel(client, oldState, newState) {
    try {
        



        if(!oldState.channelId && newState.channelId) { // bir kanala yeni katıldı (ilk giriş)
            if (config.createChannelIds.map(x => x.id).includes(newState.channelId)) {
                let getcount = config.createChannelIds.find(x => x.id == newState.channelId)
                
                let name = await kontrolet(newState.guild, getcount.name, CreateChannelActivites.size+1, newState.channel.parent.id)
                const newChannel = await newState.guild.channels.create({
                    name: name,
                    type: ChannelType.GuildVoice,
                    parent: newState.channel.parent,
                    userLimit: getcount.memberCount,
                    permissionOverwrites: [
                        {
                            id: newState.member.id,
                            allow: [PermissionsBitField.Flags.MoveMembers],
                        }
                    ]
                  });

                  CreateChannelActivites.set(newChannel.id,newState.member.id)
                  await newState.member.voice.setChannel(newChannel.id);

            }
            
            if (config.streamerChannelId == newState.channelId) {
                let streamers = await Streamers.find();
                if (streamers.map(x => x.id).includes(newState.member.id)) {
                    let streamer = await Streamers.findOne({id: newState.member.id})
                    if(streamer.channelId) {
                        if (CreateChannelActivites.has(streamer.channelId) || newState.guild.channels.cache.has(streamer.channelId)) {
                            await newState.member.voice.setChannel(streamer.channelId);
                            if(!CreateChannelActivites.has(streamer.channelId)){
                                CreateChannelActivites.set(streamer.channelId,newState.member.id)
                            }
                        } else {
                            CreateChannelActivites.delete(streamer.channelId);
                            let modpermission = streamer.mods?.map(x => x = {id: x, allow: [PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers]}) || []
                            const newChannel = await newState.guild.channels.create({
                                name: streamer.channelName,
                                type: ChannelType.GuildVoice,
                                parent: newState.channel.parent,
                                userLimit: 0,
                                permissionOverwrites: [
                                    {
                                        id: "1238195199281205288", 
                                        allow: [PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers],
                                    },
                                    {
                                        id: "1232104333559074837", 
                                        allow: [PermissionsBitField.Flags.Connect],
                                    },
                                    {
                                        id: "1232464348828405841", 
                                        allow: [PermissionsBitField.Flags.Connect],
                                    },
                                    {
                                        id: "1232516131646996520", 
                                        allow: [PermissionsBitField.Flags.Connect],
                                    },
                                    {
                                        id: "1232464394265563136", 
                                        allow: [PermissionsBitField.Flags.Connect],
                                    }
                                    ,
                                    {
                                        id: newState.guild.id, 
                                        deny: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.UseEmbeddedActivities, PermissionsBitField.Flags.ManageEvents],
                                    },
                                    {
                                        id: newState.member.id,
                                        allow: [PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers],
                                    }, ...modpermission
                                ]
                              }); 
    
                              CreateChannelActivites.set(newChannel.id,newState.member.id)
                              await newState.member.voice.setChannel(newChannel.id);
                              await Streamers.updateOne(
                                { id: newState.member.id }, // Güncellenecek belgenin kriteri (ID)
                                { channelId: newChannel.id } // Puanı 5 arttırma
                              )
                        }
                        


                    } else {
                        let modpermission = streamer.mods?.map(x => x = {id: x, allow: [PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers]}) || []
                        const newChannel = await newState.guild.channels.create({
                            name: streamer.channelName,
                            type: ChannelType.GuildVoice,
                            parent: newState.channel.parent,
                            userLimit: 0,
                            permissionOverwrites: [
                                {
                                    id: "1238195199281205288", 
                                    allow: [PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers],
                                },
                                {
                                    id: "1232104333559074837", 
                                    allow: [PermissionsBitField.Flags.Connect],
                                },
                                {
                                    id: "1232464348828405841", 
                                    allow: [PermissionsBitField.Flags.Connect],
                                },
                                {
                                    id: "1232516131646996520", 
                                    allow: [PermissionsBitField.Flags.Connect],
                                },
                                {
                                    id: "1232464394265563136", 
                                    allow: [PermissionsBitField.Flags.Connect],
                                }
                                ,
                                {
                                    id: newState.guild.id, 
                                    deny: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.UseEmbeddedActivities, PermissionsBitField.Flags.ManageEvents],
                                },
                                {
                                    id: newState.member.id,
                                    allow: [PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers],
                                }, ...modpermission
                            ]
                          }); 

                          CreateChannelActivites.set(newChannel.id,newState.member.id)
                          await newState.member.voice.setChannel(newChannel.id);
                          await Streamers.updateOne(
                            { id: newState.member.id }, // Güncellenecek belgenin kriteri (ID)
                            { channelId: newChannel.id } // Puanı 5 arttırma
                          )
                    }
                }
            }

        }


        if(oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) { // kanal değiştirdi
            if (config.createChannelIds.map(x => x.id).includes(newState.channelId)) {
                let getcount = config.createChannelIds.find(x => x.id == newState.channelId)
                let name = await kontrolet(newState.guild, getcount.name, CreateChannelActivites.size+1, newState.channel.parent.id)
                const newChannel = await newState.guild.channels.create({
                    name: name,
                    type: ChannelType.GuildVoice,
                    parent: newState.channel.parent,
                    userLimit: getcount.memberCount,
                    permissionOverwrites: [
                        {
                            id: newState.member.id,
                            allow: [PermissionsBitField.Flags.MoveMembers],
                        }
                    ]
                  });
                 
                  CreateChannelActivites.set(newChannel.id,newState.member.id)
                  await newState.member.voice.setChannel(newChannel.id);
            }

            if (config.streamerChannelId == newState.channelId) {
                let streamers = await Streamers.find();
                if (streamers.map(x => x.id).includes(newState.member.id)) {
                    let streamer = await Streamers.findOne({id: newState.member.id})
                    if(streamer.channelId) {
                        if (CreateChannelActivites.has(streamer.channelId) || newState.guild.channels.cache.has(streamer.channelId)) {
                            await newState.member.voice.setChannel(streamer.channelId);
                            if(!CreateChannelActivites.has(streamer.channelId)){
                                CreateChannelActivites.set(streamer.channelId,newState.member.id)
                            }
                        } else {
                            CreateChannelActivites.delete(streamer.channelId);
                            let modpermission = streamer.mods?.map(x => x = {id: x, allow: [PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers]}) || []
                            const newChannel = await newState.guild.channels.create({
                                name: streamer.channelName,
                                type: ChannelType.GuildVoice,
                                parent: newState.channel.parent,
                                userLimit: 0,
                                permissionOverwrites: [
                                    {
                                        id: "1238195199281205288", 
                                        allow: [PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers],
                                    },
                                    {
                                        id: "1232104333559074837", 
                                        allow: [PermissionsBitField.Flags.Connect],
                                    },
                                    {
                                        id: "1232464348828405841", 
                                        allow: [PermissionsBitField.Flags.Connect],
                                    },
                                    {
                                        id: "1232516131646996520", 
                                        allow: [PermissionsBitField.Flags.Connect],
                                    },
                                    {
                                        id: "1232464394265563136", 
                                        allow: [PermissionsBitField.Flags.Connect],
                                    }
                                    ,
                                    {
                                        id: newState.guild.id, 
                                        deny: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.UseEmbeddedActivities, PermissionsBitField.Flags.ManageEvents],
                                    },
                                    {
                                        id: newState.member.id,
                                        allow: [PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers],
                                    }, ...modpermission
                                ]
                              }); 
    
                              CreateChannelActivites.set(newChannel.id,newState.member.id)
                              await newState.member.voice.setChannel(newChannel.id);
                              await Streamers.updateOne(
                                { id: newState.member.id }, // Güncellenecek belgenin kriteri (ID)
                                { channelId: newChannel.id } // Puanı 5 arttırma
                              )
                        }
                        


                    } else {
                        let modpermission = streamer.mods?.map(x => x = {id: x, allow: [PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers]}) || []
                        const newChannel = await newState.guild.channels.create({
                            name: streamer.channelName,
                            type: ChannelType.GuildVoice,
                            parent: newState.channel.parent,
                            userLimit: 0,
                            permissionOverwrites: [
                                {
                                    id: "1238195199281205288", 
                                    allow: [PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers],
                                },
                                {
                                    id: "1232104333559074837", 
                                    allow: [PermissionsBitField.Flags.Connect],
                                },
                                {
                                    id: "1232464348828405841", 
                                    allow: [PermissionsBitField.Flags.Connect],
                                },
                                {
                                    id: "1232516131646996520", 
                                    allow: [PermissionsBitField.Flags.Connect],
                                },
                                {
                                    id: "1232464394265563136", 
                                    allow: [PermissionsBitField.Flags.Connect],
                                }
                                ,
                                {
                                    id: newState.guild.id, 
                                    deny: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.UseEmbeddedActivities, PermissionsBitField.Flags.ManageEvents],
                                },
                                {
                                    id: newState.member.id,
                                    allow: [PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers],
                                }, ...modpermission
                            ]
                          }); 

                          CreateChannelActivites.set(newChannel.id,newState.member.id)
                          await newState.member.voice.setChannel(newChannel.id);
                          await Streamers.updateOne(
                            { id: newState.member.id }, // Güncellenecek belgenin kriteri (ID)
                            { channelId: newChannel.id } // Puanı 5 arttırma
                          )
                    }
                }
            }


            CreateChannelActivites.forEach(async (values, keys) => {
                
                    
                    if (oldState.channelId == keys) {
                        if (oldState.channel.members.size == 0) {
                           await oldState.channel.delete();
                           CreateChannelActivites.delete(keys);
                           let streamers = await Streamers.find();
                           if (streamers.map(x => x.channelId).includes(keys)) {
                            await Streamers.updateOne(
                                { channelId: keys }, // Güncellenecek belgenin kriteri (ID)
                                { channelId: null } 
                              )
                           }
                        }
                    }
                
            })


        }


       if(oldState.channelId && !newState.channelId) { // sesten tamamen çıktı
        CreateChannelActivites.forEach(async (values, keys) => {
                
                    
            if (oldState.channelId == keys) {
                if (oldState.channel.members.size == 0) {
                   await oldState.channel.delete();
                   CreateChannelActivites.delete(keys);
                   let streamers = await Streamers.find();
                   if (streamers.map(x => x.channelId).includes(keys)) {
                    await Streamers.updateOne(
                        { channelId: keys }, // Güncellenecek belgenin kriteri (ID)
                        { channelId: null } 
                      )
                   }
                }
            }
        
    })
        }
      return true;
    } catch (error) {
        let channel = await client.channels.cache.get(config.botErrorLogChannel)
        await channel.send("createChannel.js [handler] de hata meydana geldi!")
        console.log(error);
        return false;

    }

}