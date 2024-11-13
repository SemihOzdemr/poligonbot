import { EmbedBuilder, SlashCommandBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode } from 'discord.js';
import Users from '../../models/User.js';
import checkUserAndCreate from '../../handlers/checkUserAndCreate.js';
import config from '../../config.json' assert { type: "json" };

function splitArrayIntoFiveParts(array) {
    // Sonuç sayfalarının listesi
    const pages = [];
    // Sayfanın maksimum boyutu
    const pageSize = 10;
    
    // Diziyi sayfalara bölün
    for (let i = 0; i < array.length; i += pageSize) {
        // Her sayfayı `array`in dilimi olarak belirleyin
        const page = array.slice(i, i + pageSize);
        // Sayfayı sonuç sayfalarının listesine ekleyin
        pages.push(page);
    }
    
    // Sayfaların listesini döndürün
    return pages;
}




const create = () => {
	const command = new SlashCommandBuilder()
		.setName('policoin')
		.setDescription(
			'Policoin kazancınızı gösterir.'
		)
		.setDMPermission(false)
		.addUserOption(option => option.setName('target').setDescription('Kullanıcı'));

	return command.toJSON();
};


const invoke = async (client,interaction) => {

	let target = await interaction.options.getUser('target')

	let member = target ? interaction.guild.members.cache.get(target.id) : interaction.member


	await checkUserAndCreate(member);
	const memberData = await Users.findOne({id: member.id});

	const embed = new EmbedBuilder().setTitle(`Kullanıcın policoin bilgisi getirildi aşağıdaki butonlardan detaylara ulaşabilirsiniz`).addFields([
		{
			name: `Toplam kazaancın:`,
			value: `${config.coinConfigs.coinEmoji} `+memberData.coin.toFixed(2).toString(),
			inline: true,
		},
		{
			name: 'Komisyon kazancın:',
			value: `${config.coinConfigs.coinEmoji} `+memberData.commissionCoin.toString(),
			inline: true,
		}	
	]);

	embed
		.setColor('Aqua')
		.setFooter({ text: 'Poligon Kazanç Sistemi!' })
		.setTimestamp()
		.setThumbnail(interaction.guild.iconURL({ dynamic: true }))
		.setAuthor({
			name: member.user.username,
			iconURL: member.user.displayAvatarURL(),
		})
		.setDescription("Butonlara tıklamak için 30 saniyen var")



	const davet = new ButtonBuilder()
		.setCustomId('davet')
		.setLabel('Davet bilgileri')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji({ name: "invite", id: "1233904242507649180" });
	const ses = new ButtonBuilder()
		.setCustomId('ses')
		.setLabel('Ses bilgileri')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji({ name: "voice", id: "1233904297125609483" });
	const mesaj = new ButtonBuilder()
		.setCustomId('mesaj')
		.setLabel('Mesaj bilgileri')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji({ name: "chat", id: "1233904377023168622" });
	const Komisyon = new ButtonBuilder()
		.setCustomId('Komisyon')
		.setLabel('Komisyon bilgileri')
		.setStyle(ButtonStyle.Secondary)
		.setEmoji({ name: "commission", id: "1233904925029961750" });

	
	const row = new ActionRowBuilder()
		.addComponents(davet, ses, mesaj, Komisyon);

		
			
	

	// Reply to the user
  let reply = await interaction.reply({
		embeds: [embed],
		components: [row],
		ephemeral: true
	});
	try {
	const collectorFilter = i => i.user.id === interaction.user.id;
	const confirmation = await reply.awaitMessageComponent({ filter: collectorFilter, time: 30_000 });
	
	let currPage = 0

	if (confirmation.customId == "davet") {


		await confirmation.reply({content:"a"})
		await confirmation.deleteReply();
		


		let yende = memberData.last100InviteActivity.sort((a, b) => {
			// b'nin tarihi a'nın tarihinden önceyse, b'nin önce gelmesini sağlayın
			return b.Date - a.Date;
		});


		
		//let davetlist = yende.map(x => inlineCode(x.message).replace("$coin-name$", config.coinConfigs.coinName))

		let pages = splitArrayIntoFiveParts(yende)

		//console.log(pages);

		
		let finishdate = Date.now() + 60000


		while (true) {
			try {

				const embed = new EmbedBuilder()
				.setTitle(`Kullanıcın davet bilgileri getirildi butonlarla sayfaları değiştirebilirsiniz.`)
					.setColor('Aqua')
					.setFooter({ text: 'Poligon Kazanç Sistemi!' })
					.setTimestamp()
					.setThumbnail(interaction.guild.iconURL({ dynamic: true }))
					.setAuthor({
						name: member.user.username,
						iconURL: member.user.displayAvatarURL(),
					})
					.setDescription(`Sayfa:${pages.length}/${currPage+1} \n\nsayfa değiştirmek için 60 saniyen var`);
				
			
			const öncekiSayfa = new ButtonBuilder()
			.setCustomId('OncekiSayfa')
			.setLabel('Önceki sayfa')
			.setStyle(ButtonStyle.Primary)
			const sonrakiSayfa = new ButtonBuilder()
			.setCustomId('SonrakiSayfa')
			.setLabel('Sonraki sayfa')
			.setStyle(ButtonStyle.Primary)

			const rowa = new ActionRowBuilder();
	
			if (pages.length == 0 || pages.length == 1) {
				
			} else {
				if (currPage == 0) {
					rowa.addComponents(sonrakiSayfa)
				} else {
					if(pages.length == currPage+1) {
					rowa.addComponents(öncekiSayfa)
					} else {
					rowa.addComponents(öncekiSayfa)
					rowa.addComponents(sonrakiSayfa)
					}
				}
			}
			
			if (pages.length == 0) {
				await reply.edit({
					content: "kayıtlı veri bulunamadı.",
					embeds: [],
				components: [],
				})
				break;
			}

			//let davetlist = yende.map(x => inlineCode(x.message).replace("$coin-name$", config.coinConfigs.coinName))
			for (const msg of pages[currPage]) {
				let datee = new Date(msg.Date)

				 embed.addFields({name:datee.toLocaleString('tr-TR'), value:inlineCode(msg.message)})
			}

			await reply.edit({
				embeds: [embed],
				components: rowa.components.length == 0 ? [] : [rowa],
			})

			if (rowa.components.length == 0) break; 

			const collectorFilter = i => i.user.id === interaction.user.id;
			const confirmation2 = await reply.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

			if (confirmation2.customId == "SonrakiSayfa") { 
				currPage++
			}
			if (confirmation2.customId == "OncekiSayfa") { 
				currPage--
			}
			await confirmation2.reply({content:"a"})
			await confirmation2.deleteReply();

			await reply.edit({
				embeds: [embed],
			components: [rowa],
			})
			if (finishdate < Date.now()) {
				await reply.edit({
					content: "komut süresi doldu",
					
					components: [],
					embeds: []
				});
				break;
			}

		} catch (error) {
			try {
				await reply.edit({
					content: "komut süresi doldu",
				
					components: [],
					embeds: []
				});
			} catch (error) {
				
			}
		
			console.log(error);
			break;
				
		}

		} 

	}

	if (confirmation.customId == "ses") {
	

		await confirmation.reply({content:"a"})
		await confirmation.deleteReply();
		


		let yende = memberData.last100VoiceActivity.sort((a, b) => {
			// b'nin tarihi a'nın tarihinden önceyse, b'nin önce gelmesini sağlayın
			return b.Date - a.Date;
		});


		
		//let davetlist = yende.map(x => inlineCode(x.message).replace("$coin-name$", config.coinConfigs.coinName))

		let pages = splitArrayIntoFiveParts(yende)

	//	console.log(pages);

		
		let finishdate = Date.now() + 60000


		while (true) {
			try {

				const embed = new EmbedBuilder()
				.setTitle(`Kullanıcın ses bilgileri getirildi butonlarla sayfaları değiştirebilirsiniz.`)
					.setColor('Aqua')
					.setFooter({ text: 'Poligon Kazanç Sistemi!' })
					.setTimestamp()
					.setThumbnail(interaction.guild.iconURL({ dynamic: true }))
					.setAuthor({
						name: member.user.username,
						iconURL: member.user.displayAvatarURL(),
					})
					.setDescription(`Sayfa:${pages.length}/${currPage+1} \n\nsayfa değiştirmek için 60 saniyen var`);
				
			
			const öncekiSayfa = new ButtonBuilder()
			.setCustomId('OncekiSayfa')
			.setLabel('Önceki sayfa')
			.setStyle(ButtonStyle.Primary)
			const sonrakiSayfa = new ButtonBuilder()
			.setCustomId('SonrakiSayfa')
			.setLabel('Sonraki sayfa')
			.setStyle(ButtonStyle.Primary)
	
			const rowa = new ActionRowBuilder();
	

		

			if (pages.length == 0 || pages.length == 1) {
			
			} else {
				if (currPage == 0) {
					rowa.addComponents(sonrakiSayfa)
				} else {
					if(pages.length == currPage+1) {
					rowa.addComponents(öncekiSayfa)
					} else {
					rowa.addComponents(öncekiSayfa)
					rowa.addComponents(sonrakiSayfa)
					}
				}
			}
			
			if (pages.length == 0) {
				await reply.edit({
					content: "kayıtlı veri bulunamadı.",
					embeds: [],
				components: [],
				})
				break;
			}

			//let davetlist = yende.map(x => inlineCode(x.message).replace("$coin-name$", config.coinConfigs.coinName))
			for (const msg of pages[currPage]) {
				let datee = new Date(msg.Date)

				 embed.addFields({name:datee.toLocaleString('tr-TR'), value:inlineCode(msg.message).replace("$coin-name$", config.coinConfigs.coinName)})
			}

			await reply.edit({
				embeds: [embed],
			components: rowa.components.length == 0 ? [] : [rowa],
			})

			if (rowa.components.length == 0) break; 

			const collectorFilter = i => i.user.id === interaction.user.id;
			const confirmation2 = await reply.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

			if (confirmation2.customId == "SonrakiSayfa") { 
				currPage++
			}
			if (confirmation2.customId == "OncekiSayfa") { 
				currPage--
			}
			await confirmation2.reply({content:"a"})
			await confirmation2.deleteReply();

			await reply.edit({
				embeds: [embed],
			components: [rowa],
			})
			if (finishdate < Date.now()) {
				await reply.edit({
					content: "komut süresi doldu",
					
					components: [],
					embeds: []
				});
				break;
			}

		} catch (error) {
			try {
				await reply.edit({
					content: "komut süresi doldu",
				
					components: [],
					embeds: []
				});
			} catch (error) {
				
			}

			console.log(error);
			break;
				
		}

		} 


	}

	if (confirmation.customId == "mesaj") {
	

		await confirmation.reply({content:"a"})
		await confirmation.deleteReply();
		


		let yende = memberData.last100MessageActivity.sort((a, b) => {
			// b'nin tarihi a'nın tarihinden önceyse, b'nin önce gelmesini sağlayın
			return b.Date - a.Date;
		});


		
		//let davetlist = yende.map(x => inlineCode(x.message).replace("$coin-name$", config.coinConfigs.coinName))

		let pages = splitArrayIntoFiveParts(yende)

	//	console.log(pages);

		
		let finishdate = Date.now() + 60000


		while (true) {
			try {

				const embed = new EmbedBuilder()
				.setTitle(`Kullanıcın mesaj bilgileri getirildi butonlarla sayfaları değiştirebilirsiniz.`)
					.setColor('Aqua')
					.setFooter({ text: 'Poligon Kazanç Sistemi!' })
					.setTimestamp()
					.setThumbnail(interaction.guild.iconURL({ dynamic: true }))
					.setAuthor({
						name: member.user.username,
						iconURL: member.user.displayAvatarURL(),
					})
					.setDescription(`Sayfa:${pages.length}/${currPage+1} \n\nsayfa değiştirmek için 60 saniyen var`);
				
			
			const öncekiSayfa = new ButtonBuilder()
			.setCustomId('OncekiSayfa')
			.setLabel('Önceki sayfa')
			.setStyle(ButtonStyle.Primary)
			const sonrakiSayfa = new ButtonBuilder()
			.setCustomId('SonrakiSayfa')
			.setLabel('Sonraki sayfa')
			.setStyle(ButtonStyle.Primary)
	
			const rowa = new ActionRowBuilder();
	

		

			if (pages.length == 0 || pages.length == 1) {
			
			} else {
				if (currPage == 0) {
					rowa.addComponents(sonrakiSayfa)
				} else {
					if(pages.length == currPage+1) {
					rowa.addComponents(öncekiSayfa)
					} else {
					rowa.addComponents(öncekiSayfa)
					rowa.addComponents(sonrakiSayfa)
					}
				}
			}
			
			if (pages.length == 0) {
				await reply.edit({
					content: "kayıtlı veri bulunamadı.",
					embeds: [],
				components: [],
				})
				break;
			}

			//let davetlist = yende.map(x => inlineCode(x.message).replace("$coin-name$", config.coinConfigs.coinName))
			for (const msg of pages[currPage]) {
				let datee = new Date(msg.Date)

				 embed.addFields({name:datee.toLocaleString('tr-TR'), value:inlineCode(msg.message).replace("$coin-name$", config.coinConfigs.coinName)})
			}

			await reply.edit({
				embeds: [embed],
			components: rowa.components.length == 0 ? [] : [rowa],
			})

			if (rowa.components.length == 0) break; 

			const collectorFilter = i => i.user.id === interaction.user.id;
			const confirmation2 = await reply.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

			if (confirmation2.customId == "SonrakiSayfa") { 
				currPage++
			}
			if (confirmation2.customId == "OncekiSayfa") { 
				currPage--
			}
			await confirmation2.reply({content:"a"})
			await confirmation2.deleteReply();

			await reply.edit({
				embeds: [embed],
			components: [rowa],
			})
			if (finishdate < Date.now()) {
				await reply.edit({
					content: "komut süresi doldu",
					
					components: [],
					embeds: []
				});
				break;
			}

		} catch (error) {
			try {
				await reply.edit({
					content: "komut süresi doldu",
				
					components: [],
					embeds: []
				});
			} catch (error) {
				
			}

			console.log(error);
			break;
				
		}

		} 


	}

	if (confirmation.customId == "Komisyon") {
	

		await confirmation.reply({content:"a"})
		await confirmation.deleteReply();
		


		let yende = memberData.last100CommisonActivity.sort((a, b) => {
			// b'nin tarihi a'nın tarihinden önceyse, b'nin önce gelmesini sağlayın
			return b.Date - a.Date;
		});


		
		//let davetlist = yende.map(x => inlineCode(x.message).replace("$coin-name$", config.coinConfigs.coinName))

		let pages = splitArrayIntoFiveParts(yende)

	//	console.log(pages);

		
		let finishdate = Date.now() + 60000


		while (true) {
			try {

				const embed = new EmbedBuilder()
				.setTitle(`Kullanıcın komisyon bilgileri getirildi butonlarla sayfaları değiştirebilirsiniz.`)
					.setColor('Aqua')
					.setFooter({ text: 'Poligon Kazanç Sistemi!' })
					.setTimestamp()
					.setThumbnail(interaction.guild.iconURL({ dynamic: true }))
					.setAuthor({
						name: member.user.username,
						iconURL: member.user.displayAvatarURL(),
					})
					.setDescription(`Sayfa:${pages.length}/${currPage+1} \n\nsayfa değiştirmek için 60 saniyen var`);
				
			
			const öncekiSayfa = new ButtonBuilder()
			.setCustomId('OncekiSayfa')
			.setLabel('Önceki sayfa')
			.setStyle(ButtonStyle.Primary)
			const sonrakiSayfa = new ButtonBuilder()
			.setCustomId('SonrakiSayfa')
			.setLabel('Sonraki sayfa')
			.setStyle(ButtonStyle.Primary)
	
			const rowa = new ActionRowBuilder();
	

		

			if (pages.length == 0 || pages.length == 1) {
			
			} else {
				if (currPage == 0) {
					rowa.addComponents(sonrakiSayfa)
				} else {
					if(pages.length == currPage+1) {
					rowa.addComponents(öncekiSayfa)
					} else {
					rowa.addComponents(öncekiSayfa)
					rowa.addComponents(sonrakiSayfa)
					}
				}
			}
			
			if (pages.length == 0) {
				await reply.edit({
					content: "kayıtlı veri bulunamadı.",
					embeds: [],
				components: [],
				})
				break;
			}

			//let davetlist = yende.map(x => inlineCode(x.message).replace("$coin-name$", config.coinConfigs.coinName))
			for (const msg of pages[currPage]) {
				let datee = new Date(msg.Date)

				 embed.addFields({name:datee.toLocaleString('tr-TR'), value:inlineCode(msg.message).replace("$coin-name$", config.coinConfigs.coinName)})
			}

			await reply.edit({
				embeds: [embed],
			components: rowa.components.length == 0 ? [] : [rowa],
			})

			if (rowa.components.length == 0) break; 

			const collectorFilter = i => i.user.id === interaction.user.id;
			const confirmation2 = await reply.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

			if (confirmation2.customId == "SonrakiSayfa") { 
				currPage++
			}
			if (confirmation2.customId == "OncekiSayfa") { 
				currPage--
			}
			await confirmation2.reply({content:"a"})
			await confirmation2.deleteReply();

			await reply.edit({
				embeds: [embed],
			components: [rowa],
			})
			if (finishdate < Date.now()) {
				await reply.edit({
					content: "komut süresi doldu",
					
					components: [],
					embeds: []
				});
				break;
			}

		} catch (error) {
			try {
				await reply.edit({
					content: "komut süresi doldu",
				
					components: [],
					embeds: []
				});
			} catch (error) {
				
			}

			console.log(error);
			break;
				
		}

		} 


	}

} catch (error) {
	try {
		await reply.edit({
			content: "komut süresi doldu",
			ephemeral: true,
			components: [],
			embeds: []
		});	
	} catch (error) {
		
	}
	
	console.log(error);
}

	/*
setTimeout(() => {
	reply.edit({
		components: []
	})
}, 5000);
*/

};

export { create, invoke };
