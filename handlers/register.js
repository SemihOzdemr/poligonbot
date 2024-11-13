import { EmbedBuilder, SlashCommandBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Component,ComponentType } from 'discord.js';
import config from '../config.json' assert { type: "json" };
import registerMessage from '../models/registerMessage.js';
import registerTimeout from '../models/registerTimeout.js';
import User from '../models/User.js';
import checkUserAndCreate from './checkUserAndCreate.js';

function randomTwoNumbers() {
    // 1 ile 30 arasında bir sayı oluşturmak için Math.random ve Math.floor kullanılır.
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // İki farklı sayı üretmek için bir set oluşturulur.
    const numbers = new Set();
    
    // Sete iki farklı sayı ekleyene kadar döngü devam eder.
    while (numbers.size < 2) {
        const number = randomInt(1, 30);
        numbers.add(number);
    }
    
    // Seti bir diziye dönüştürerek sayıları döndür.
    return Array.from(numbers);
}

function closestNumbers(number) {
    // Döndürülecek sayıların sayısını rastgele seç (3, 4 veya 5)
    const count = Math.floor(Math.random() * 3) + 3; // 3, 4 veya 5 olacak şekilde rastgele sayı
    
    // Sayının kendisini içermeyecek şekilde yakın sayıları toplamak için bir dizi oluştur
    const results = [];
    
    // Döngü, istenen sayıda sayıyı toplayana kadar devam eder
    while (results.length < count) {
        // Verilen sayının etrafında -5 ile +5 arasında bir sayı oluştur
        const range = 3; // Aralık belirle (-5 ile +5 arası)
        const randomNum = Math.floor(Math.random() * (range * 2 + 1)) + (number - range);
        
        // Oluşturulan sayının farklı ve daha önce eklenmemiş olduğundan emin olun
        if (randomNum !== number && !results.includes(randomNum)) {
            results.push(randomNum);
        }
    }
    
    // Sonuçları döndür
    return results;
}

function compareNumbers(a, b) {
    return a - b;
  }

export default async function register(client, interaction) {
    try {
    if (interaction.message.channelId !== config.registerChannelId) return;
    let unregisteredvarmi = await interaction.member.roles.cache.has(config.unregisterRole)
    let uyerolevarmi = await interaction.member.roles.cache.has(config.newMemberRole)
    if (uyerolevarmi) return await interaction.reply({content: "Zaten Üyesiniz!", ephemeral: true});
     await checkUserAndCreate(interaction.member);
    let memberTimeout = await registerTimeout.findOne({id: interaction.member.id})
    let currDate = Date.now()
    if (memberTimeout) {
        if(memberTimeout.Date > currDate) {
            await interaction.reply({content: `${((memberTimeout.Date - currDate) / 1000).toFixed()} saniye sonra tekrar dene`,ephemeral: true})
            return;
        } else {
            await registerTimeout.deleteOne({id: interaction.member.id})
        }
    }
  const select = new StringSelectMenuBuilder()
  .setCustomId('register');

    const randomNumbers = randomTwoNumbers();
    const cevap = randomNumbers[0]+randomNumbers[1];
    let cevaplar = closestNumbers(cevap);
    cevaplar.push(cevap)
    cevaplar.sort(compareNumbers)

    select.setPlaceholder(`(${randomNumbers[0]} + ${randomNumbers[1]}) 30 saniye içerisinde doğru cevabı seç!`);

    for (const secenek of cevaplar) {
    select.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${secenek}`).setValue(`${secenek}`))
    }




		const row = new ActionRowBuilder()
			.addComponents(select);
            
        const reply = await interaction.reply({ephemeral: true, components: [row]})
    
        const collectorFilter = i => {
            i.deferUpdate();
            return i.user.id === interaction.user.id;
        };

       await reply.awaitMessageComponent({ filter: collectorFilter, componentType: ComponentType.StringSelect, time: 30_000 })
	.then(async interactiono => {
      // await interactiono.reply({content: "...", ephemeral: true})
      // await interactiono.deleteReply();
       let gelenCevap = Number(interactiono.values[0]);
       
        if(isNaN(gelenCevap)) return await interaction.editReply({content: "Yanlış cevap 30 saniye sonra tekrar deneyebilirsin!", components: []});
        if(gelenCevap !== cevap) {
            let currDates = Date.now() + 30000
            let timeoutData = new registerTimeout({
                id: interaction.member.id,
                Date: currDates
            })
            await timeoutData.save()
            return await interaction.editReply({content: "Yanlış cevap 30 saniye sonra tekrar deneyebilirsin!", components: []});
        } 

        let registeredMemberData = await User.findOne({id: interaction.member.id});
        let inviter = await User.findOne({id: registeredMemberData.inviter})
       if (inviter) {

                let accountCreationDate = interaction.member.user.createdAt
               const currentDate = new Date();
               const differenceInDays = (currentDate - accountCreationDate) / (1000 * 60 * 60 * 24);
                let messageso = differenceInDays >= 14 ? `${config.coinConfigs.inviteCoinCount} ${config.coinConfigs.coinName} kazandın.` : `hesap yeni açıldığı için ${config.coinConfigs.coinName} kazanamadın.`
                


          await User.updateOne(
            { "id": inviter.id}, // Belgede bir kriteri kullanarak güncelleme yapacağınız veriyi bulun
            { 
                "$set": { 
                    "invites.$[elem].win": differenceInDays >= 14 ? true : false,
                    "coin": differenceInDays >= 14 ? (inviter.coin + config.coinConfigs.inviteCoinCount) : inviter.coin
                },
                "$push": {
                    "last100InviteActivity": {
                        "$each": [{type: "Invite", Date: Date.now(), message: `${interaction.member.user.username} Kullanıcısını davet ettin ${messageso}`}], // `yeniNesne`yi diziye ekle
                        "$slice": -99 // Dizi boyutunu en fazla 99 olarak ayarla
                    }
                }
            },
            {
              "arrayFilters": [ { "elem.id": interaction.member.id } ] // `id`'si 1 olan nesneye odaklanın
            }
          )

          if (inviter.inviter && differenceInDays >= 14) {
            let commisoner = await User.findOne({id: inviter.inviter});
            if (commisoner) {
                let addcoin = (config.coinConfigs.inviteCoinCount * config.coinConfigs.yuzde) / 100;
                let messagesoc = differenceInDays >= 14 ? `${addcoin.toFixed(4)} ${config.coinConfigs.coinName} kazandın.` : `hesap yeni açıldığı için ${config.coinConfigs.coinName} kazanamadın.`
               
                await User.updateOne(
                    { "id": commisoner.id}, // Belgede bir kriteri kullanarak güncelleme yapacağınız veriyi bulun
                    { 
                        "$set": { 
                            "coin": (commisoner.coin + addcoin),
                            "commissionCoin": (commisoner.commissionCoin + addcoin)
                        },
                        "$push": {
                            "last100CommisonActivity": {
                                "$each": [{type: "InviteCommission", Date: Date.now(), message: `Davet ettiğin bir kullanıcı başka birini davet etti ${messagesoc}`}], // `yeniNesne`yi diziye ekle
                                "$slice": -99 // Dizi boyutunu en fazla 99 olarak ayarla
                            }
                        }
                    }
                  )


            }

           }



        

        
       }


       await interaction.editReply({
        content:"Kayıt Başarılı.",
        components: []
    })

       let unregisterrole = await interaction.member.guild.roles.cache.get(config.unregisterRole)
       let uyerole = await interaction.member.guild.roles.cache.get(config.newMemberRole)
      
       if(unregisteredvarmi) {
        await interaction.member.roles.remove(unregisterrole)
       }
       if (!uyerolevarmi) {
        await interaction.member.roles.add(uyerole)
       }


       let genelchat = await interaction.member.guild.channels.cache.get(config.generalChannelId)
       await genelchat.send({
        content: `<@${interaction.member.id}> aramıza katıldı.`
       })
     
    })
	.catch(async err => {
        console.log(err);
        await interaction.editReply({
            content:"kayıt işlemi için 30 saniyeden fazla beklediniz tekrar kayıt olmayı deneyin.",
            components: []
        })
    });

    return true;
    } catch (error) {
        let channel = await client.channels.cache.get(config.botErrorLogChannel)
       await channel.send("register.js [handler] de hata meydana geldi!")
       console.log(error);
       return false;
    } 

    
}

