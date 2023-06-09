const cadastros = require('../cadastros.json');
const { SlashCommandBuilder } = require('@discordjs/builders');

function listarCadastros(){
    var lista = '';
    cadastros.forEach(cadastro => {
        lista += `Nome: ${cadastro.nome} - Email: ${cadastro.email}\n`;
    });
    return lista;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cadastros')
		.setDescription('Listar todos os cadastros'),
	async execute(interaction) {
        await interaction.reply(`- Aqui esta a lista de todos os usuarios cadastrados: \n${listarCadastros()}`);
	},
};