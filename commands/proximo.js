const { SlashCommandBuilder } = require('@discordjs/builders');
const { createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const play = require('play-dl');
const { getNextMusica } = require('../musicas.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('proximo')
		.setDescription('Toca a proxima musica na fila'),
	async execute(interaction) {
        const voice = getVoiceConnection(interaction.guildId);
        if(voice){
            const voiceChannel = voice.joinConfig.channelId;
            let video_url = getNextMusica(voiceChannel);

            if(video_url != null){
                let stream = await play.stream(video_url);
                let resource = createAudioResource(stream.stream, { inputType: stream.type });
                let player = createAudioPlayer({
                    behaviors: {
                        noSubscriber: NoSubscriberBehavior.Play,
                    },
                });
                player.play(resource);
                player.on(AudioPlayerStatus.Idle, async () => {
                    let video_url = getNextMusica(voiceChannel);
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
                        voice.disconnect();
                        isPlaying = false;

                        if (interaction.replied || interaction.deferred) {
                            await interaction.followUp({ content: `Todas as musicas foram reproduzidas.`, ephemeral: true });
                        } else {
                            await interaction.reply({ content: `Todas as musicas foram reproduzidas.`, ephemeral: true });
                        }
                    }
                });

                player.on('error', async error => {
                    console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);

                    let video_url = getNextMusica(voiceChannel.id);
                    if(video_url){
                        stream = await play.stream(video_url);
                        resource = createAudioResource(stream.stream, { inputType: stream.type });
                        player.play(resource);
                        isPlaying = true;

                        if (interaction.replied || interaction.deferred) {
                            await interaction.followUp({ content: `Pulando para a proxima musica: ${video_url}`, ephemeral: true });
                        } else {
                            await interaction.reply({ content: `Pulando para a proxima musica: ${video_url}`, ephemeral: true });
                        }
                    }else{
                        voice.disconnect();
                        isPlaying = false;

                        if (interaction.replied || interaction.deferred) {
                            await interaction.followUp({ content: `Todas as musicas foram reproduzidas.`, ephemeral: true });
                        } else {
                            await interaction.reply({ content: `Todas as musicas foram reproduzidas.`, ephemeral: true });
                        }
                    }

                });

                voice.subscribe(player);

                await interaction.reply(`Tocando: ${video_url}`);
            

            }else{
                await interaction.reply(`Nenhuma musica em reproducao`);
            }
        }

	},
};