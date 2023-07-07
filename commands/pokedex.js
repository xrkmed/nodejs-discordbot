const { SlashCommandBuilder } = require("@discordjs/builders");
const { getPokedex } = require("../pokemons.js");

async function loadPokedex(interaction, pokePage = 1, oldMessage = null) {
	if(oldMessage){
		await oldMessage.reactions.removeAll();
	}
	
	let i = pokePage * 10 - 9;
	const userId = interaction.user.id;
	const pokedex = getPokedex(userId);
	
	const pokedexList = pokedex.pokedexs
		.slice((pokePage - 1) * 10, pokePage * 10)
		.map(pokemon => i++ + ". " + pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1) + ` unlocked at ` + new Date(pokemon.date).toLocaleDateString())
		.join('\n');

	let embed = {
		title: `> Info about ${interaction.user.username.charAt(0).toUpperCase() + interaction.user.username.slice(1)}'s pokedex - Page ${pokePage}`,
		description: `[+] Total: ${pokedex.pokedexs.length}/151`,
		color: 15158332,
		thumbnail: {
			url: "https://i.imgur.com/4M34hi2.png",
		},
		author: {
			name: `${interaction.user.username.charAt(0).toUpperCase() + interaction.user.username.slice(1)}`,
			icon_url: interaction.user.avatarURL(),
		},
		fields: [
			{
				name: `> Pokemons in ${interaction.user.username}'s Pokedex`,
				value: pokedexList,
				inline: true,
			},
		]
	};

	if(!oldMessage){
		if (interaction.replied || interaction.deferred) {
		  oldMessage = await interaction.followUp({ embeds: [embed], fetchReply: true });
		} else {
		  oldMessage = await interaction.reply({ embeds: [embed], fetchReply: true });
		}
	  }else{
		await oldMessage.edit({ embeds: [embed] });
	  }
	
	  if(oldMessage){
		if(pokePage > 1) await oldMessage.react("⬅️")
		if(pokePage < Math.ceil(pokedex.pokedexs.length / 10)){
		  await oldMessage.react("➡️")
		}
	
	
		const filter = (reaction, user) => {
		  return ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id == interaction.user.id;
		};
	
		const collector = oldMessage.createReactionCollector({ filter, time: 15000 });
		collector.on('collect', async (reaction, user) => {
			if(reaction.emoji.name == "⬅️"){
			  await loadPokedex(interaction, pokePage - 1, oldMessage);
			} else if(reaction.emoji.name == "➡️"){
			  await loadPokedex(interaction, pokePage + 1, oldMessage);
			}
			collector.stop();
		});
	  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pokedex")
    .setDescription("List all pokemons in your pokedex"),
  async execute(interaction) {
	const userId = interaction.user.id;
	const pokedex = await getPokedex(userId);
	if (pokedex.pokedexs === undefined) {
	  await interaction.reply("You don't have any pokemon in your pokedex");
	  return;
	}

	await loadPokedex(interaction);
  },
};
