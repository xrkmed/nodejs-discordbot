const pokemonsInventory = require('./pokelist.json');
const fs = require('fs');

function save(){
    fs.writeFileSync('./pokelist.json', JSON.stringify(pokemonsInventory), (err) => {
        if(err){
            console.log(err);
            return;
        }
    });

    return;
}

function cadastrarUser(userId){
    if(usuarioCadastrado(userId)){
        return;
    }

    pokemonsInventory.push({userId, coins: 25, experience: 0, pokemons: [], pokedex: [], inventory: [
        {name: 'pokeball', amount: 100},
    ]});
    return pokemonsInventory.find(poke => poke.userId == userId);
}

function getBadge(userId, badgeName){
    if(getItem(userId, badgeName) > 0){
        switch(badgeName){
            case 'badge1': {
                return '<:badge1:1124670722363629591>';
            }
            case 'badge2': {
                return '<:badge2:1124670724267847761>';
            }
            case 'badge3': {
                return '<:badge3:1124670726604079116>';
            }
            case 'badge4': {
                return '<:badge4:1124670730131492956>';
            }
            case 'badge5': {
                return '<:badge5:1124670733105246238>';
            }
            case 'badge6': {
                return '<:badge6:1124670736007708754>';
            }
            case 'badge7': {
                return '<:badge7:1124670738905960478>';
            }
            case 'badge8': {
                return '<:badge8:1124670740587888781>';
            }
        }
    }    

    return '';              
}

function getPokeball(pokeballName){
        switch(pokeballName){
            case 'pokeball': {
                return '<:pokeball:1124673589820526642>';
            }
            case 'greatball': {
                return '<:greatball:1124673584896413696>';
            }
            case 'ultraball': {
                return '<:ultraball:1124673592756555816>';
            }
            case 'masterball': {
                return '<:masterball:1124673588235092069>';
            }
    }    
    
    return '';              
}

function usuarioCadastrado(userId){
    return pokemonsInventory.find(poke => poke.userId == userId);
}

function getPokeCoins(userId){
    let user = pokemonsInventory.find(userInfo => userInfo.userId == userId);
    return user.coins || 0;
}

function addExperience(userId, experience){
    let user = pokemonsInventory.find(poke => poke.userId == userId);
    user.experience += experience;
    return {userId, experience};
}

function useBall(userId, ballName){
    let user = pokemonsInventory.find(poke => poke.userId == userId);
    if(user.inventory === undefined){
        user.inventory = [];
        return false;
    }

    let ball = user.inventory.find(ball => ball.name == ballName);
    if(ball === undefined){
        return false;
    }

    if(ball.amount > 0){
        ball.amount--;
        return true;
    }

    return false;
}

function getItem(userId, itemName){
    let user = pokemonsInventory.find(poke => poke.userId == userId);
    if(user.inventory === undefined){
        user.inventory = [];
        return 0;
    }

    let item = user.inventory.find(item => item.name == itemName);
    if(item === undefined){
        return 0;
    }

    return item.amount || 0;
}

function getExperience(userId){
    let user = pokemonsInventory.find(poke => poke.userId == userId);
    return user.experience;
}

function addPokemon(userId, pokemon){
    if(!usuarioCadastrado(userId)){
        cadastrarUser(userId);
    }

    let pokeInfo = pokemonsInventory.find(poke => poke.userId == userId);
    if(pokeInfo){
        if(pokeInfo.pokemons.find(poke => poke.name == pokemon.name)){
            return {error: 'Pokemon ja cadastrado'};
        }
    }

    let pokemonsList = pokemonsInventory.find(poke => poke.userId == userId);
    pokemonsList.pokemons.push(pokemon);
    return {userId, pokemonsList};
}

function getPokemons(userId){
    let pokemonsList = pokemonsInventory.find(poke => poke.userId == userId);
    if(!pokemonsList){
        return {};
    }
    let pokemons = pokemonsList.pokemons;

    return {pokemons};
}

function addPokedex(userId, pokemon){
    if(!usuarioCadastrado(userId)){
        cadastrarUser(userId);
    }

    let pokeInfo = pokemonsInventory.find(poke => poke.userId == userId);
    if(pokeInfo){
        if(pokeInfo.pokedex.find(poke => poke.name == pokemon)){
            return -1;
        }
    }

    let pokedexList = pokemonsInventory.find(poke => poke.userId == userId);
    pokedexList.pokedex.push({name: pokemon, date: new Date()});
    return 1;
}

function getPokedex(userId){
    let pokedexList = pokemonsInventory.find(poke => poke.userId == userId);
    if(!pokedexList){
        return {};
    }
    let pokedexs = pokedexList.pokedex;

    return {pokedexs};
}

module.exports = {getPokemons, addPokemon, addPokedex, getPokedex, save, addExperience, getExperience, useBall, getItem, getPokeCoins, getBadge, getPokeball};