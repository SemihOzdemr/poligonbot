import { EmbedBuilder, SlashCommandBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode, PermissionFlagsBits } from 'discord.js';
import Streamers from '../../models/streamers.js';
import checkUserAndCreate from '../../handlers/checkUserAndCreate.js';
import config from '../../config.json' assert { type: "json" };






const create = () => {
	const command = new SlashCommandBuilder()
		.setName('yayinciekle')
		.setDescription(
			'Sisteme bir yayıncı eklemenizi sağlar.'
		)
		.setDMPermission(false)
		.addUserOption(option => option.setName('yayıncı').setDescription('Yayıncıyı seçin.').setRequired(true))
		.addStringOption(option => option.setName('kanaladı').setDescription('Yayıncı için açılacak kanalın adını girin.').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
	return command.toJSON();
};


const invoke = async (client,interaction) => {

	try {
		


	const yayinci = await interaction.options.getUser('yayıncı')
	const kanaladi = await interaction.options.getString('kanaladı') ?? null;
	let channel = await interaction.guild.channels.cache.get(config.streamerChannelId);
	if(!channel) return interaction.reply({content: `kanal oluşturma odası bulunamadı!`});
	if(!kanaladi) return interaction.reply({content: `Kanal adı zorunlu.`});
	if(!yayinci) return interaction.reply({content: `Bir yayıncı seçmelisin.`});

	let member = interaction.guild.members.cache.get(yayinci.id)

	let varmi = await Streamers.findOne({id: member.id})

	if(varmi) return interaction.reply({content: `<@${member.id}> Yayıncı sisteminde zaten ekli.`});

	let newData = new Streamers({
		id: member.id,
		channelName: kanaladi,
		mods: []
	})
	
	await newData.save()
	
	await channel.permissionOverwrites.create(member, { ViewChannel: true, Connect: true });

	// channel.permissionOverwrites.delete(interaction.user.id);   permission silme

	await interaction.reply({content: `<@${member.id}> Yayıncı sistemine eklendi.`});
	let role = interaction.guild.roles.cache.get("1232104333559074837")
	await member.roles.add(role)

} catch (error) {
	await interaction.reply({content: `<@${member.id}> Yayıncı sistemine eklenirken HATA OLUŞTU !.`});
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
