const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sobremim')
		.setDescription('Responde com informacoes sobre @xrkmed'),
	async execute(interaction) {
        await interaction.reply(`
		Oi! Eu sou o XrkmedBOT, um bot criado pelo @xrkmed para testar a API do Discord e aprender um pouco de NodeJS.
		Confira mais sobre meu criador em https://www.xrkmed.com
		`);
	},
};