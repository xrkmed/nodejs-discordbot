const cadastros = require('../cadastros.json');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

function cadastrar(nome, email){
    if(cadastros.find(cadastro => cadastro.email == email)){
        return {error: 'Email ja cadastrado'};
    }

    if(cadastros.find(cadastro => cadastro.nome == nome)){
        return {error: 'Nome ja cadastrado'};
    }

    cadastros.push({nome, email});
    fs.writeFile('./cadastros.json', JSON.stringify(cadastros), (err) => {
        if(err){
            return {error: `Erro ao salvar cadastro ${err}`};
        }
    });

    return {nome, email};
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cadastrar')
		.setDescription('Cadastrar usuario')
		.addStringOption(option => option.setName('nome').setDescription('nome').setRequired(true))
        .addStringOption(option => option.setName('email').setDescription('email').setRequired(true)),
	async execute(interaction) {
        var nome = interaction.options.getString('nome');
        var email = interaction.options.getString('email');
        var cadastro = cadastrar(nome, email);
        if(!cadastro.error){
            await interaction.reply(`Cadastro realizado com sucesso!`);
        }else{
            await interaction.reply(`Erro ao cadastrar ` + cadastro.error);
        }
	},
};