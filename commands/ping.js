const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
        var now = new Date();
		await interaction.reply(`Pong! ${now.getTime() - interaction.createdTimestamp}ms`);
	},
};