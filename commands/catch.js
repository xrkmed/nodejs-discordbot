const fetch = require("node-fetch");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { addPokemon, addPokedex, addExperience, useBall } = require("../pokemons.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("catch")
    .setDescription("Try catch random pokemon"),
  async execute(interaction) {
    try {
		const pokeid = Math.floor(Math.random() * 151) + 1;
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${pokeid}`
        );

		const level = Math.floor(Math.random() * 100) + 1;

		//json
        const json = await response.json();

		const fieldStats = json.stats.map(stat => {
			return {
				name: stat.stat.name.charAt(0).toUpperCase() + stat.stat.name.slice(1),
				value: stat.base_stat,
				inline: true
			}
		});

		const experience = json.base_experience;

          //embed message
          let embed = {
            title: json.name.charAt(0).toUpperCase() + json.name.slice(1) + ` Lvl. ${level} appeared!`,
            description: `#${json.id}`,
            color: 15258703,
			level,
			shiny: false,
            thumbnail: {
              url: json.sprites.versions["generation-v"]["black-white"].animated.front_default || json.sprites.front_default,
            },
            author: {
              name: `${interaction.user.username} found a wild ${json.name.charAt(0).toUpperCase() + json.name.slice(1)}!`,
              icon_url: "https://i.imgur.com/4M34hi2.png",
            },
            url: `https://www.pokemon.com/br/pokedex/${json.name}`,
            fields: fieldStats,
            footer: {
              text: `React with your pokeball to try catch ${json.name.charAt(0).toUpperCase() + json.name.slice(1)} and win +${json.base_experience} EXP!`,
            },
          };

		  let message;
		  if (interaction.replied || interaction.deferred) {
			message = await interaction.followUp({ embeds: [embed], fetchReply: true });
		  } else {
			message = await interaction.reply({ embeds: [embed], fetchReply: true });
		  }

		  if(message){
			message.react("<:pokeball:1124673589820526642>")
			message.react("<:greatball:1124673584896413696>")
			message.react("<:ultraball:1124673592756555816>")
			message.react("<:masterball:1124673588235092069>")

			if(addPokedex(interaction.user.id, json.name.toLowerCase()) == 1){
				await interaction.followUp(`Congratulations <@${interaction.user.id}>! You unlocked ${json.name.charAt(0).toUpperCase() + json.name.slice(1)} in your pokedex! **+${Math.floor(json.base_experience/3)} EXP!**`);
				addExperience(interaction.user.id, Math.floor(json.base_experience/3));
			}

			const filter = (reaction, user) => {
				return ['pokeball', 'greatball', 'ultraball', 'masterball'].includes(reaction.emoji.name) && !user.bot;
			};

			const collector = message.createReactionCollector({ filter, time: 15000 });
			collector.on('collect', async (reaction, user) => {

				if(!useBall(interaction.user.id, reaction.emoji.name)){
					await interaction.followUp(`Ooops <@${user.id}>, You don't have any ${reaction.emoji.name} left! Type **/inventory** to see your inventory or **/shop** to buy more!.`);
					return;
				}

				const pokespecies = await fetch(
					`https://pokeapi.co/api/v2/pokemon-species/${pokeid}`
					);
				const pokespeciesJson = await pokespecies.json();

				let catchRatePercentage = (pokespeciesJson.capture_rate * 100) / 255;
				let catchRatePercentageModifier = 1;
				for(let i = 0; i < json.stats.length; i++){
					catchRatePercentageModifier += (Math.floor(Math.random() * json.stats[i].base_stat) + 1) / 1000;
				}
				let ballModifier = 1;
				switch(reaction.emoji.name){
					case 'pokeball':
						ballModifier = 1;
						break;
					case 'greatball':
						ballModifier = 1.5;
						break;
					case 'ultraball':
						ballModifier = 2;
						break;
					case 'masterball':
						ballModifier = 255;
						break;
				}

				catchRatePercentage *= catchRatePercentageModifier;

				if(catchRatePercentage >= 100 || embed.level == 1 || reaction.emoji.name == 'masterball' || Math.random() <= (catchRatePercentage / 100) * ballModifier){
					addPokemon(interaction.user.id, {
						id: json.id,
						name: json.name.toLowerCase(),
						level: embed.level, 
						pokeball: reaction.emoji.name, 
						date: new Date(),
						stats: {
							hp: json.stats[0].base_stat,
							attack: json.stats[1].base_stat,
							defense: json.stats[2].base_stat,
							'special-attack': json.stats[3].base_stat,
							'special-defense': json.stats[4].base_stat,
							speed: json.stats[5].base_stat
						},
						shiny: embed.shiny
					});
					message.reactions.removeAll();
					embed.author.name = `${user.username} caught a wild ${json.name.toLowerCase()} Lvl. ${embed.level}!`;
					embed.footer.text = '';
					embed.author.icon_url = user.avatarURL();
					embed.title = `Congratulations!`;
					embed.color = 3066993;
					await interaction.followUp(`Congratulations <@${user.id}>, you caught ${json.name.charAt(0).toUpperCase() + json.name.slice(1)} [${embed.level}] using a ${reaction.emoji.name}! **+${json.base_experience} EXP!**`);
					await message.edit({ embeds: [embed] });
					addExperience(interaction.user.id, json.base_experience);
				}else{
					message.reactions.removeAll();
					embed.author.name = `${user.username} failed to catch a wild ${json.name.toLowerCase()}!`;
					embed.footer.text = '';
					embed.author.icon_url = user.avatarURL();
					embed.title = `Failure`;
					embed.color = 15158332;
					await message.edit({ embeds: [embed] });
					await interaction.followUp(`Close one <@${user.id}>! ${json.name.toLowerCase()} got away. (Rate: ${catchRatePercentage.toFixed(2)}%))`);
				}

				collector.stop();

			});
		  }
    } catch (error) {
      console.log(error);
    }
  },
};
