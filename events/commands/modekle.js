import { EmbedBuilder, SlashCommandBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode, PermissionFlagsBits } from 'discord.js';
import Streamers from '../../models/streamers.js';
import checkUserAndCreate from '../../handlers/checkUserAndCreate.js';
import config from '../../config.json' assert { type: "json" };






const create = () => {
	const command = new SlashCommandBuilder()
		.setName('modekle')
		.setDescription(
			'Yayıncıların Moderatör eklemesini sağlar.'
		)
		.setDMPermission(false)
		.addUserOption(option => option.setName('mod').setDescription('Moderatör seçin.').setRequired(true));
	return command.toJSON();
};


const invoke = async (client,interaction) => {

	try {
		

	
	const mod = await interaction.options.getUser('mod')

	let data = await Streamers.findOne({id: interaction.member.id});

	if (!data) return interaction.reply({content: `Yayıncı sisteminde kayıtlı değilsin!!`});

	if(!mod) return interaction.reply({content: `Bir Moderatör seçmelisin.`});

	let filter = data.mods.filter(x => x == mod.id)
	 
	if (filter.length > 0) return interaction.reply({content: `<@${mod.id}> zaten moderatör!!`});

	await Streamers.updateOne(
		{ id: interaction.member.id }, // Güncellenecek belgenin kriteri (ID)
		{ $push: { mods: mod.id } } 
	  )

	// channel.permissionOverwrites.delete(interaction.user.id);   permission silme

	await interaction.reply({content: `<@${mod.id}> Moderatör sisteme eklendi.`});
	
	if (data.channelId) {
		if (interaction.guild.channels.cache.has(data.channelId)) {
			let channel = interaction.guild.channels.cache.get(data.channelId);
			await channel.permissionOverwrites.create(mod.id, { ViewChannel: true, MoveMembers: true, Connect: true, Speak: true, Stream: true, MuteMembers: true, DeafenMembers: true});
		}
	}

} catch (error) {
	await interaction.reply({content: `<@${mod.id}> Moderatör sisteme eklenirken HATA OLUŞTU !.`});
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
