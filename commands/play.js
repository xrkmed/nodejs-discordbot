const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const { ChannelType } = require('discord.js');
const play = require('play-dl');
const { addMusica, getNextMusica } = require('../musicas.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Tocar musica')
		.addStringOption(option => option.setName('url').setDescription('url do youtube').setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('canal de voz').setRequired(true).addChannelTypes(ChannelType.GuildVoice)),
	async execute(interaction) {
        var isPlaying = getVoiceConnection(interaction.guildId) != null && getVoiceConnection(interaction.guildId).joinConfig.channelId != null;
        

        let url = interaction.options.getString('url');

        const voiceChannel = interaction.options.getChannel('channel');
        if(!voiceChannel){
            await interaction.reply({ content: 'Você precisa escolher um canal de voz para executar este comando!', ephemeral: true });
            return;
        }

        if(addMusica(voiceChannel.id, url) == 1 && !isPlaying){
            const connection = await joinVoiceChannel({ channelId: voiceChannel.id, guildId: voiceChannel.guildId, adapterCreator: voiceChannel.guild.voiceAdapterCreator });
            let video_url = getNextMusica(voiceChannel.id);
            let stream = await play.stream(video_url);
            let resource = createAudioResource(stream.stream, { inputType: stream.type });
            let player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Play,
                },
            });
            player.play(resource);
            player.on(AudioPlayerStatus.Idle, async () => {
                let video_url = getNextMusica(voiceChannel.id);
                if(video_url){
                    stream = await play.stream(video_url);
                    resource = createAudioResource(stream.stream, { inputType: stream.type });
                    player.play(resource);
                    isPlaying = true;

                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: `Tocando agora: ${video_url}`, ephemeral: true });
                    } else {
                        await interaction.reply({ content: `Tocando agora: ${video_url}`, ephemeral: true });
                    }
                }else{
                    connection.disconnect();
                    isPlaying = false;

                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: `Todas as musicas foram reproduzidas.`, ephemeral: true });
                    } else {
                        await interaction.reply({ content: `Todas as musicas foram reproduzidas.`, ephemeral: true });
                    }
                }
            });

            isPlaying = true;
            connection.subscribe(player);


            await interaction.reply(`Tocando: ${video_url}`);
        }else{            
            await interaction.reply(`Adicionado a fila: ${url}`)
        }
        
        
	},
};