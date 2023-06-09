const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('jokenpo')
		.setDescription('Vamos jogar um pedra, papel ou tesoura?')
		.addStringOption(option => option.setName('jogada').setDescription('Escolha sua jogada').setRequired(true)
			.addChoices(
				{ name: 'Pedra', value: 'pedra'},
				{ name: 'Papel', value: 'papel'},
				{ name: 'Tesoura', value: 'tesoura'},
				)
		),
		async execute(interaction) {
        var jogada = interaction.options.getString('jogada');
		var jogadaBot = Math.floor(Math.random() * 3);
		var jogadaBotString = '';
		switch(jogadaBot){
			case 0:
				jogadaBotString = 'pedra';
				break;
			case 1:
				jogadaBotString = 'papel';
				break;
			case 2:
				jogadaBotString = 'tesoura';
				break;
		}
		var resultado = '';
		if(jogada == jogadaBotString){
			resultado = 'Empate';
		}else if(jogada == 'pedra'){
			if(jogadaBotString == 'papel'){
				resultado = 'Você perdeu';
			}else{
				resultado = 'Você ganhou';
			}
		}else if(jogada == 'papel'){
			if(jogadaBotString == 'tesoura'){
				resultado = 'Você perdeu';
			}else{
				resultado = 'Você ganhou';
			}
		}else if(jogada == 'tesoura'){
			if(jogadaBotString == 'pedra'){
				resultado = 'Você perdeu';
			}else{
				resultado = 'Você ganhou';
			}
		}
		
		await interaction.reply(`Você jogou ${jogada}, eu joguei ${jogadaBotString}. ${resultado}`);
	},
};