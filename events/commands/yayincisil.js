import { EmbedBuilder, SlashCommandBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode, PermissionFlagsBits } from 'discord.js';
import Streamers from '../../models/streamers.js';
import checkUserAndCreate from '../../handlers/checkUserAndCreate.js';
import config from '../../config.json' assert { type: "json" };






const create = () => {
	const command = new SlashCommandBuilder()
		.setName('yayincisil')
		.setDescription(
			'Sistemden bir yayıncı silmenizi sağlar.'
		)
		.setDMPermission(false)
		.addUserOption(option => option.setName('yayıncı').setDescription('Sistemden silmek istediğiniz yayıncıyı seçin.').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
	return command.toJSON();
};


const invoke = async (client,interaction) => {

	try {
		


	const yayinci = await interaction.options.getUser('yayıncı')
	let channel = await interaction.guild.channels.cache.get(config.streamerChannelId);
	if(!channel) return interaction.reply({content: `kanal oluşturma odası bulunamadı!`});
	if(!yayinci) return interaction.reply({content: `Bir yayıncı seçmelisin.`});

	let member = interaction.guild.members.cache.get(yayinci.id)

	let varmi = await Streamers.findOne({id: member.id})

	if(!varmi) return interaction.reply({content: `<@${member.id}> Yayıncı sisteminde zaten ekli değil!!`});

	await Streamers.deleteOne({id: member.id});

	await channel.permissionOverwrites.delete(member.id);

	await interaction.reply({content: `<@${member.id}> Yayıncı sisteminden silindi.`});
    
    let role = interaction.guild.roles.cache.get("1232104333559074837")
	await member.roles.remove(role)

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
