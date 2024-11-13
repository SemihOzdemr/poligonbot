import { EmbedBuilder, SlashCommandBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode, PermissionsBitField, PermissionFlagsBits } from 'discord.js';
import Users from '../../models/User.js';
import checkUserAndCreate from '../../handlers/checkUserAndCreate.js';
import config from '../../config.json' assert { type: "json" };

const create = () => {
	const command = new SlashCommandBuilder()
		.setName('policoinal')
		.setDescription(
			'bir kullanıcıdan belirttiğin miktarda policoin alır.(ADMİN)'
		)
		.setDMPermission(false)
		.addUserOption(option => option.setName('target').setDescription('Kullanıcı').setRequired(true))
		.addIntegerOption(option => option.setName('miktar').setDescription('miktar ör: 50').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
	return command.toJSON();
};


const invoke = async (client,interaction) => {

try {
	let target = await interaction.options.getUser('target')
	let miktar = await interaction.options.getInteger('miktar')


	let member = interaction.guild.members.cache.get(target.id)
	if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) || member.user.bot) return interaction.reply({content: `bu komutu sadece yöneticiler kullanabilir.`, ephemeral: true});
	await checkUserAndCreate(member);
	let memberData = await Users.findOne({id: member.id})

	const currentCoin = memberData.coin;
	const newCoin = currentCoin - miktar;
	const finalScore = newCoin < 0 ? 0 : newCoin;
	memberData.coin = finalScore;
	await memberData.save()

	 await interaction.reply({content: `<@${member.id}> kullanıcısından ${miktar} ${config.coinConfigs.coinName} aldınız.`, ephemeral: true})

} catch (error) {
	console.log(error);
}

};

export { create, invoke };
