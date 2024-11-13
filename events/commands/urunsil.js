import { EmbedBuilder, SlashCommandBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, inlineCode, PermissionsBitField, StringSelectMenuBuilder, StringSelectMenuOptionBuilder,ComponentType, PermissionFlagsBits } from 'discord.js';
import Users from '../../models/User.js';
import checkUserAndCreate from '../../handlers/checkUserAndCreate.js';
import config from '../../config.json' assert { type: "json" };
import Products from '../../models/products.js';
import storeMessage from '../../models/storeMessage.js';
import storeSetup from '../../handlers/storeSetup.js';

const create = () => {
	const command = new SlashCommandBuilder()
		.setName('urunsil')
		.setDescription(
			'Mağazadan bir ürün silmenizi sağlar.(ADMİN)'
		)
		.setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
	return command.toJSON();
};


const invoke = async (client,interaction) => {

try {

	if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({content: `bu komutu sadece yöneticiler kullanabilir.`, ephemeral: true});
	
    let products = await Products.find()
    if(products.length == 0) return await interaction.reply({content: `Mağazanda hiç ürün yok.`, ephemeral: true});

    products.sort((a, b) => a.coin - b.coin);
	
    const embed = new EmbedBuilder()
    .setTitle(`Poligon Mağaza Sistemi`)
	.setDescription("Menü aracılığı istediğiniz ürünleri silebilirsiniz.")
    ;
    const select = new StringSelectMenuBuilder()
    .setCustomId('storeDelete');

    select.setPlaceholder(`Silmek istediğiniz ürünü seçin!`);

    for (const product of products) {
        select.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${product.coin} | ${product.name}`).setValue(`${product._id}Delete`).setEmoji('1233147074380435486'))
    }

    const row = new ActionRowBuilder()
    .addComponents(select);


    let reply = await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
    })

    const collectorFilter = i => {
        return i.user.id === interaction.user.id;
    };

    
    let noerror = true
    while (noerror) {
        await reply.awaitMessageComponent({ filter: collectorFilter, componentType: ComponentType.StringSelect, time: 30_000 })
        .then(async interactiono => {
    
            

            await Products.deleteOne({_id : interactiono.values[0].replace("Delete", "")})
          
            const select2 = new StringSelectMenuBuilder()
            .setCustomId('storeDelete');

            select2.setPlaceholder(`Silmek istediğiniz ürünü seçin!`);

            let newproducts = await Products.find()
            newproducts.sort((a, b) => a.coin - b.coin);
            if (newproducts.length == 0) {
                await interaction.editReply({
                    content:"Ürün Kalmadı.",
                    components: [],
                    embeds: []
                })
                noerror = false
                return;
            }
            for (const product of newproducts) {
                select2.addOptions(new StringSelectMenuOptionBuilder().setLabel(`${product.coin} | ${product.name}`).setValue(`${product._id}Delete`).setEmoji('1233147074380435486'))
            }

            const row2 = new ActionRowBuilder()
            .addComponents(select2);

            let pro = products.find(x => x._id == interactiono.values[0].replace("Delete", "")) || ""

            const embed2 = new EmbedBuilder()
            .setTitle(`Poligon Mağaza Sistemi`)
            .setDescription(`${pro.name} ürününü sildiniz. \nMenü aracılığı istediğiniz ürünleri silebilirsiniz.`)
            ;

            await interactiono.deferUpdate()

            await interaction.editReply({
                components: [row2],
                embeds: [embed2]
            })

         }).catch(async err => {
            console.log(err);
            noerror = false
            await interaction.editReply({
                content:"silme işlemi için 30 saniyeden fazla beklediniz.",
                components: [],
                embeds: []
            })
        });
    }





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


} catch (error) {
	console.log(error);
}

};

export { create, invoke };
