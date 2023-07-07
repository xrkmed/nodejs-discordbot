const fetch = require("node-fetch");
const { SlashCommandBuilder } = require("@discordjs/builders");
const {
  getPokemons,
  getExperience,
  getPokedex,
  getItem,
  getPokeCoins,
  getBadge,
  getPokeball,
} = require("../pokemons.js");


async function loadProfile(interaction, pokePage = 1, oldMessage = null){
  if(oldMessage){
    await oldMessage.reactions.removeAll();
  }

  const userId = interaction.user.id;
  const pokemons = getPokemons(userId);
  if (pokemons.pokemons === undefined) {
    pokemons.pokemons = [];
  }

  let pokeList = pokemons.pokemons
    .slice((pokePage - 1) * 10, pokePage * 10)
    .map(
      (pokemon) =>
        "#" +
        pokemon.id +
        " - " +
        pokemon.name.charAt(0).toUpperCase() +
        pokemon.name.slice(1) +
        " Lvl. " +
        pokemon.level
    )
    .join("\n");

  if (pokeList == "") {
    pokeList = "No pokemons yet :(";
  }

  let embed = {};

  if (pokePage == 1){
    let badges = "";
    for (let i = 1; i <= 8; i++) {
      badges += getBadge(userId, "badge" + i);
    }

    if(badges == "") badges = "No badges yet :("

    embed = {
      title: `Inventory`,
      description: `<:pokecoin:1124674159029538879> ${getPokeCoins(
        userId
      )} PokéCoins`,
      color: 15258703,
      thumbnail: {
        url: "https://i.imgur.com/yRVElpE.jpeg",
      },
      author: {
        name: `${
          interaction.user.username.charAt(0).toUpperCase() +
          interaction.user.username.slice(1)
        }`,
        icon_url: interaction.user.avatarURL(),
      },
      fields: [
        {
          name: "- Experience",
          value: `+ ${getExperience(userId) || 0} EXP`,
          inline: true,
        },
        {
          name: "- Pokeballs",
          value: `<:pokeball:1124673589820526642> ${getItem(
            userId,
            "pokeball"
          )}x Pokeball's\n<:greatball:1124673584896413696> ${getItem(
            userId,
            "greatball"
          )}x Greatball's\n<:ultraball:1124673592756555816> ${getItem(
            userId,
            "ultraball"
          )}x Ultraball's\n<:masterball:1124673588235092069> ${getItem(
            userId,
            "masterball"
          )}x Masterball's`,
          inline: false,
        },
        {
          name: "- Badges",
          value: badges,
          inline: false,
        },
        {
          name: "- Pokedex",
          value:
            "<:pokedex:1124674713021591633> " +
            (getPokedex(userId).pokedexs.length || 0) +
            "/151",
          inline: true,
        },
        {
          name: `- ${pokemons.pokemons.length} Pokemons`,
          value: pokeList,
          inline: false,
        },
      ],
    };
  } else {
    embed = {
      title: `Inventory - Page ${pokePage}`,
      description: `<:pokecoin:1124674159029538879> ${getPokeCoins(
        userId
      )} PokéCoins`,
      color: 15258703,
      thumbnail: {
        url: "https://i.imgur.com/yRVElpE.jpeg",
      },
      author: {
        name: `${
          interaction.user.username.charAt(0).toUpperCase() +
          interaction.user.username.slice(1)
        }`,
        icon_url: interaction.user.avatarURL(),
      },
      fields: [
        {
          name: `- ${pokemons.pokemons.length} Pokemons`,
          value: pokeList,
          inline: false,
        },
      ],
    };
  }

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
    if(pokePage < Math.ceil(pokemons.pokemons.length / 10)){
      await oldMessage.react("➡️")
    }


    const filter = (reaction, user) => {
      return ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id == interaction.user.id;
    };

    const collector = oldMessage.createReactionCollector({ filter, time: 15000 });
    collector.on('collect', async (reaction, user) => {
        if(reaction.emoji.name == "⬅️"){
          await loadProfile(interaction, pokePage - 1, oldMessage);
        } else if(reaction.emoji.name == "➡️"){
          await loadProfile(interaction, pokePage + 1, oldMessage);
        }
        collector.stop();
    });
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("List all pokemons in your inventory")
    .addIntegerOption((option) =>
      option
        .setName("pokemon")
        .setDescription("Specify Pokemon id")
        .setRequired(false)
    ),
  async execute(interaction) {
    if (interaction.options.getInteger("pokemon") != null) {
      let pokeId = interaction.options.getInteger("pokemon");
      let userId = interaction.user.id;
      const pokemons = getPokemons(userId);

      if (pokemons.pokemons === undefined) {
        await interaction.reply("You don't have any pokemon in your inventory");
        return;
      }

      let pokemon = pokemons.pokemons.find((pokemon) => pokemon.id == pokeId);
      if (pokemon === undefined) {
        await interaction.reply("Pokemon not found in your inventory");
        return;
      }

      const pokeApi = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`
      );
      const json = await pokeApi.json();

      let embed = {
        title: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
        description: `> Caught at ${new Date(
          pokemon.date
        ).toLocaleDateString()}`,
        color: 15258703,
        thumbnail: {
          url:
            json.sprites.versions["generation-v"]["black-white"].animated
              .front_default || json.sprites.front_default,
        },
        author: {
          name: `${
            pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
          } from ${
            interaction.user.username.charAt(0).toUpperCase() +
            interaction.user.username.slice(1)
          }'s Inventory`,
          icon_url: interaction.user.avatarURL(),
        },
        fields: [
          {
            name: "Level",
            value: pokemon.level || 1,
            inline: true,
          },
          {
            name: "HP",
            value: pokemon.stats.hp || 1,
            inline: true,
          },
          {
            name: "Attack",
            value: pokemon.stats.attack || 1,
            inline: true,
          },
          {
            name: "Defense",
            value: pokemon.stats.defense || 1,
            inline: true,
          },
          {
            name: "Special Attack",
            value: pokemon.stats["special-attack"] || 1,
            inline: true,
          },
          {
            name: "Special Defense",
            value: pokemon.stats["special-defense"] || 1,
            inline: true,
          },
          {
            name: "Speed",
            value: pokemon.stats.speed || 1,
            inline: true,
          },
        ],
      };

      await interaction.reply({ embeds: [embed] });
      return;
    }

    if (interaction.options.getInteger("pokemon") == null) {
        await loadProfile(interaction);
    }
  },
};
