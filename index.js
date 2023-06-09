const fs = require('node:fs');
const path = require('node:path');
const config = require('./config.json');
const { Client, Collection, GatewayIntentBits, Events, REST, Routes, ActivityType } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.Guilds] });
const TOKEN = config.token;
const commands = [];
client.commands = new Collection();

client.on(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}!`);
    var status = setInterval(function () {
      client.user.setPresence({
        activities: [{ name: `Acesse https://www.xrkmed.com`, type: ActivityType.Playing }],
        status: 'dnd',
      });

    }, 10000);
    status.refresh();

});

const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const filePath = path.join(__dirname, 'commands', file);
    const command = require(filePath);

    if('data' in command && 'execute' in command){
      commands.push(command.data.toJSON());
      client.commands.set(command.data.name, command);
    }else{
      console.log(`Invalid command file ${filePath}`);
    }
}

const rest = new REST({ version: '9' }).setToken(TOKEN);
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(
			Routes.applicationCommands(config.appId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();


client.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try{
        await command.execute(interaction);
    }catch(error){
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    }
});

client.login(TOKEN);

