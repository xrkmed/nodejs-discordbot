const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord.js');
const { getFila, addMusica, getNextMusica } = require('../musicas.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fila')
		.setDescription('Todas as musicas em fila')
        .addChannelOption(option => option.setName('channel').setDescription('canal de voz').setRequired(true).addChannelTypes(ChannelType.GuildVoice)),
	async execute(interaction) {
        const voiceChannel = interaction.options.getChannel('channel');
        if(!voiceChannel){
            await interaction.reply({ content: 'Marque qual o canal voce deseja ver as filas de musica', ephemeral: true });
            return;
        }

        let fila = getFila(voiceChannel.id);
        if(fila.length > 0){
            await interaction.reply(`Musicas em fila: ${fila.join(', ')}`);
        }else{
            await interaction.reply(`Nenhuma musica em fila`);
        }
        
        
	},
};