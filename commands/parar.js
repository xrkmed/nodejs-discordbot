const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection } = require('@discordjs/voice');
const { ChannelType } = require('discord.js');
const play = require('play-dl');
const { limparFila } = require('../musicas.js');

var isPlaying = false;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('parar')
		.setDescription('Parar de tocar todas as musicas'),
	async execute(interaction) {
        const voice = getVoiceConnection(interaction.guildId);
        if(voice){
            voice.disconnect();
            isPlaying = false;
            limparFila(voice.joinConfig.channelId);
            await interaction.reply(`Todas as musicas foram paradas`);
        }else{
            await interaction.reply(`Nenhuma musica em reproducao`);
        }

	},
};