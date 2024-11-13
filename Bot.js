import {} from 'dotenv/config';
import fs from 'fs';
import { Client, GatewayIntentBits } from 'discord.js';
import mongoose from 'mongoose';
import express from 'express';
import bodyParser from "body-parser";
import cors from "cors";


const VoiceActivites = new Map();
mongoose.connect('mongodb://serverip:port/Poligon')
  .then(() => console.log('Connected!'));


const client = new Client({
	intents: Object.keys(GatewayIntentBits).map((a)=>{
	  return GatewayIntentBits[a]
	}),
  });



const events = fs
	.readdirSync('./events')
	.filter((file) => file.endsWith('.js'));


for (let event of events) {

	const eventFile = await import(`#events/${event}`);
	
	if (eventFile.once)
		client.once(eventFile.name, (...args) => {
			eventFile.invoke(...args);
		});
	else
		client.on(eventFile.name, (...args) => {
			if (eventFile.name == "voiceStateUpdate") {
				eventFile.invoke(VoiceActivites,client,...args);
			} else {
				eventFile.invoke(client,...args);
			}
			
		});
}


const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
	res.send('Backend çalışıyor!');
  });



app.listen(process.env.PORT, () => {
	console.log(`Sunucu ${process.env.PORT} portunda çalışıyor`);
  });
client.login(process.env.BOT_TOKEN);
