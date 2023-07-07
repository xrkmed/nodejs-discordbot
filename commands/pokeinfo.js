const fetch = require('node-fetch');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pokeinfo')
		.setDescription('Get pokemon info')
		.addStringOption(option => option.setName('pokemon').setDescription('Pokemon name').setRequired(true)),
	async execute(interaction) {
		try{
			const pokemon_name = interaction.options.getString('pokemon').toLowerCase();
			const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon_name}`);
			const json = await response.json();
			//create embed message
			const embed = {
				"title": json.name.toUpperCase(),
				"description": `#${json.id}`,
				"color": 15258703,
				"thumbnail": {
					"url": json.sprites.front_default
				},
				"url": `https://www.pokemon.com/br/pokedex/${json.name}`,
				"fields": [
					{
						"name": "Height",
						"value": json.height,
						"inline": true
					},
					{
						"name": "Weight",
						"value": json.weight,
						"inline": true
					},
					{
						"name": "Abilities",
						"value": json.abilities.map(ability => ability.ability.name).join(', '),
						"inline": true
					},
					{
						"name": "Stats",
						"value": json.stats.map(stat => {
							return `${stat.stat.name}: ${stat.base_stat}`;
						}
						).join('\n'),
						"inline": true
					},
					{
						"name": "Forms",
						"value": json.forms.map(form => form.name).join(', '),
						"inline": true
					},
					{
						"name": "Game indices",
						"value": json.game_indices.map(game => game.version.name).join(', '),
						"inline": true
					},
					{
						"name": "Held items",
						"value": json.held_items.map(item => item.item.name).join(', '),
						"inline": true
					},
					{
						"name": "Species",
						"value": json.species.name,
						"inline": true
					},
					{
						"name": "Base experience",
						"value": json.base_experience,
						"inline": true
					},
					{
						"name": "Type",
						"value": json.types.map(type => type.type.name).join(', '),
						"inline": true
					}
				]
			};

			await interaction.reply({ embeds: [embed] });
		}catch(error){
			await interaction.reply({ content: 'Pokemon not found', ephemeral: true });
		}
	},
};