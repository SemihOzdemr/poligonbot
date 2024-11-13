import fs from 'fs';
import { ActivityType, Invite } from 'discord.js';
import config from '../config.json' assert { type: "json" };
import Invites from '../models/invites.js';
import registerSetup from '../handlers/registerSetup.js';
import ticketSetup from '../handlers/ticketSetup.js';
import storeSetup from '../handlers/storeSetup.js';
import selectRoleSetup from '../handlers/selectRoleSetup.js';


// yardım alındı : https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/coding-guides/tracking-used-invites.md
const once = true;
const name = 'ready';

async function invoke(client) {
	
	const commands = fs
		.readdirSync('./events/commands')
		.filter((file) => file.endsWith('.js'))
		.map((file) => file.slice(0, -3));

	const commandsArray = [];

	for (let command of commands) {
		const commandFile = await import(`#commands/${command}`);
		commandsArray.push(commandFile.create());
	}

	client.application.commands.set(commandsArray);

	client.user.setPresence({
		activities: [{ name: `Poligonu`, type: ActivityType.Watching }],
		status: 'dnd',
	  });


	  let guild = await client.guilds.cache.get(config.guildid)
	  let firstInviteso = await guild.invites.fetch();
	  let invitesdata = await Invites.find()
	  let firstInvites = firstInviteso.map(invite => invite)
	 

	 for (const invite of firstInvites) {
		

		let check = await Invites.findOne({code: invite.code})
		if (check) {
			check.uses = invite.uses;
			await check.save()
		} else {
			console.log(invite.code);
			let newInvite = new Invites({
				code: invite.code,
				uses: invite.uses,
				inviter: invite.inviterId
			})
				
			await newInvite.save()
		}

	 }


	for (const invite of invitesdata) {
		let check = await firstInvites.find(x => x.code == invite.code)
		if(!check) {
			await Invites.deleteOne({code: invite.code})
		}
	}
	
	await registerSetup(client)
	await ticketSetup(client)
	await storeSetup(client)
	await selectRoleSetup(client)

	console.log(`Successfully logged in as ${client.user.tag}!`);
}

export { once, name, invoke };
