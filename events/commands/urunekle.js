import { EmbedBuilder, SlashCommandBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode, PermissionsBitField, PermissionFlagsBits } from 'discord.js';
import Users from '../../models/User.js';
import checkUserAndCreate from '../../handlers/checkUserAndCreate.js';
import config from '../../config.json' assert { type: "json" };
import Products from '../../models/products.js';
import storeMessage from '../../models/storeMessage.js';
import storeSetup from '../../handlers/storeSetup.js';

const create = () => {
	const command = new SlashCommandBuilder()
		.setName('urunekle')
		.setDescription(
			'Mağazaya bir ürün eklemenizi sağlar.(ADMİN)'
		)
		.setDMPermission(false)
		.addStringOption(option => option.setName('ad').setDescription('Ürün adı').setRequired(true))
		.addIntegerOption(option => option.setName('fiyat').setDescription('ör: 5000').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
	return command.toJSON();
};


const invoke = async (client,interaction) => {

try {
	let ad = await interaction.options.getString('ad')
	let fiyat = await interaction.options.getInteger('fiyat')

	
	if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({content: `bu komutu sadece yöneticiler kullanabilir.`, ephemeral: true});
	
	let newproduct = Products({
		name: ad,
		coin: fiyat
	})

	await newproduct.save()

	let messagedata = await storeMessage.findOne();
	if (messagedata) {
		let channel = interaction.guild.channels.cache.get(config.storeChannelId)
		let checkMsg = await channel.messages.fetch(messagedata.id).catch(x => undefined);
		if (checkMsg) {
			await checkMsg.delete()
	  
		 }
		await storeMessage.deleteMany()
	}

	await storeSetup(client)

	 await interaction.reply({content: `${inlineCode(ad)} ürününü ${inlineCode(fiyat)} ${config.coinConfigs.coinName} olarak mağazaya eklediniz.`, ephemeral: true})

} catch (error) {
	console.log(error);
}

};

export { create, invoke };
