import { EmbedBuilder, SlashCommandBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode } from 'discord.js';
import Users from '../../models/User.js';
import checkUserAndCreate from '../../handlers/checkUserAndCreate.js';
import config from '../../config.json' assert { type: "json" };


const create = () => {
	const command = new SlashCommandBuilder()
		.setName('topcoin')
		.setDescription(
			'Top 10 Policoin sıralamasını gösterir.'
		)
		.setDMPermission(false)

	return command.toJSON();
};

const getUserRank = async (userId) => {
	try {
	  const user = await Users.findOne({id: userId}).exec();
	  if (!user) {
		return 'User not found';
	  }
  
	  const rank = await Users.countDocuments({ coin: { $gt: user.coin } }).exec() + 1;
	  return {rank: rank, user: user};
	} catch (error) {
	  console.error('Error fetching user rank:', error);
	}
  };

  const getTopUsers = async () => {
	try {
	  const topUsers = await Users.find().sort({ coin: -1 }).limit(10).exec();
	  return topUsers;
	} catch (error) {
	  console.error('Error fetching top users:', error);
	}
  };


const invoke = async (client,interaction) => {

	const displayTopUsersAndRank = async (userId) => {
		const topUsers = await getTopUsers();
		let text = ``;
		topUsers.forEach((user, index) => {
			text += (`${index + 1}. <@${user.id}> - ${user.coin.toFixed()} Policoin\n\n`);
		});
	  
		const userRank = await getUserRank(userId);


		const embed = new EmbedBuilder()
		.setTitle(`Kullanıcıların Top 10 Policoin Sıralaması:`)
			.setColor('Aqua')
			.setFooter({ text: 'Poligon Kazanç Sistemi!' })
			.setTimestamp()
			.setThumbnail(interaction.guild.iconURL({ dynamic: true }))
			.setAuthor({
				name: interaction.member.user.username,
				iconURL: interaction.member.user.displayAvatarURL(),
			})
			.setDescription(`Senin sıran: ${userRank.rank}. - ${userRank.user.coin.toFixed()} Policoin\n\n\n${text}`);

			await interaction.reply({embeds: [embed]})

	  };
	

	  const userId = interaction.member.id; // Sıralamasını öğrenmek istediğiniz kullanıcının ID'si
displayTopUsersAndRank(userId);

	/*
setTimeout(() => {
	reply.edit({
		components: []
	})
}, 5000);
*/

};

export { create, invoke };
