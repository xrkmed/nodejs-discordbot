const musicas = [];

function getNextMusica(channelId){
    if(musicas[channelId] && musicas[channelId].length > 0){
        return musicas[channelId].shift();
    }else{
        return null;
    }
}

function addMusica(channelId, url){
    musicas[channelId] = musicas[channelId] || [];
    musicas[channelId].push(url);
    return musicas[channelId].length;
}

function getFila(channelId){
    musicas[channelId] = musicas[channelId] || [];
    return musicas[channelId];
}

function limparFila(channelId){
    musicas[channelId] = [];
}

module.exports = { getNextMusica, addMusica, getFila, limparFila }