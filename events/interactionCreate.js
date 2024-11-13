import deleteSales from "../handlers/deleteSales.js";
import register from "../handlers/register.js";
import roleSelect from "../handlers/roleSelect.js";
import storeBuy from "../handlers/storeBuy.js";
import ticketCreate from "../handlers/ticketCreate.js";
import ticketDelete from "../handlers/ticketDelete.js";
const once = false;
const name = 'interactionCreate';


async function invoke(client, interaction) {

	if (interaction.isStringSelectMenu()) {
		if (interaction.customId == "storeBuy") {
			storeBuy(client,interaction)
		}
		if (interaction.customId == "watchRoleSelect" || interaction.customId == "gameRoleSelect") {
			roleSelect(client,interaction)
		}
	}

	if (interaction.isButton()) {
		if (interaction.customId == "kayıtOl") {
			register(client,interaction)
		}
		if (interaction.customId == "destekTalebiOlustur") {
			ticketCreate(client, interaction)
		}
		if (interaction.customId == "destekTalebiKapat") {
			ticketDelete(client, interaction)
		}
		if (interaction.customId == "urunTeslimEdildi") {
			deleteSales(client, interaction)
		}
	  }

	if (interaction.isChatInputCommand())
		(await import(`#commands/${interaction.commandName}`)).invoke(client,interaction);
}

export { once, name, invoke };
