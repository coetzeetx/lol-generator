var axios = require('axios');
const Discord = require('discord.js');
const client = new Discord.Client({partials: ["MESSAGE", "CHANNEL", "REACTION"]});
var config = require('./config.json');
const pacman = require('./loading-ascii');



var data = 'GhostHunt3r101,euw1';
let position = {
    TOP: ['Fighter', 'Tank', 'Assasin'],
    MID: ['Mage', 'Assasin'],
    BOT: ['Marksman', 'Support'],
    JUNGLE: ['Fighter', 'Tank']
}
let exclusionList = ["Blitzcrank"]
let messageRef = null;
let loadingBar = null
var laneIndex = null
var randomLanePosition = null;
let player1Champions = null;
let player2Champions = null;

async function getMyChampions(username, region) {
    let availablechamps = [];
    var config = {
        method: 'post',
        url: 'https://elo.rip/api/championMasteriesBySummonerName',
        headers: { 
          'Content-Type': 'text/plain'
        },
        data : data
      };
    const response = await axios(config)
    for (let element of response.data.body) {
        let championDetails = await getChampionDetails(element)
        if (championDetails) {
            availablechamps.push({
                championId: element.championId,
                championName: championDetails.championName,
                championTags: championDetails.championTags,
            })
        }
    };
    return availablechamps
}

async function getChampionDetails(champion) {
    var config = {
        method: 'get',
        url: 'http://ddragon.leagueoflegends.com/cdn/12.2.1/data/en_US/champion.json',
        headers: { }
      };
      
    let response = await axios(config)

    let championList = response.data.data
    let isLaneFound = false;
    for (var index in championList) {
        if (champion.championId == championList[index].key && !exclusionList.includes(index)) {
            console.log(index)
            console.log(randomLanePosition)
            randomLanePosition.forEach((element) => {championList[index].tags.includes(element) ? isLaneFound = true : null})
            if (postionStringValue(randomLanePosition) == "BOT" && (championList[index].tags[0] != "Marksman" || (championList[index].tags[1] && championList[index].tags[1] != "Marksman")) ) {
                continue;
            }
            if ((championList[index].tags[0] != "Support") && isLaneFound) {
                console.log('PASS');
                return { 
                    championName: index,
                    championTags: championList[index].tags
                }
            }
        
        }
    }

}

function getRandomChampion(championDetails) {
    const max = championDetails.length;
    const min = 0;
    let randomValue = Math.floor(Math.random() * (max - min) ) + min;
    return championDetails[randomValue].championName + " [" + championDetails[randomValue].championTags+"]";
}

async function main(message) {
    console.log(randomLanePosition)
    player1Champions = await getMyChampions('GhostHunt3r101', 'euw');
    player2Champions = await getMyChampions('Pragma0nce', 'euw');
    if (!player1Champions || !player2Champions) {
        console.log("Both Challengers did not have champions in the same class");
        delete position[Object.keys(position)[laneIndex]]
        main();
    }
    let player1 = getRandomChampion(player1Champions);
    let player2 = getRandomChampion(player2Champions);
    clearInterval(loadingBar);
    messageRef.edit(`GhostHunt3r101: ${player1}\nVERSUS\nPragma0nce: ${player2}`)
}

function postionStringValue(arr1) {
    console.log(arr1)
    switch(JSON.stringify(arr1)) {
        case JSON.stringify(['Fighter', 'Tank', 'Assasin']):
            return "TOP"
        case JSON.stringify(['Mage', 'Assasin']):
            return "MID"
        case JSON.stringify(['Marksman', 'Support']):
            return "BOT"
        case JSON.stringify(['Fighter', 'Tank']):
            return "JUNGLE"
    }
}

async function loadingFlair(message) {
    messageRef = await message.channel.send("Warming up...")
    let index = 0;
    loadingBar = setInterval(() => {
        if (index == pacman.lanes.length-1)
            index = 0;
        messageRef.edit(pacman.lanes[index]);
        index++;
    }, 1000);
}

client.on('ready', (message) => {
    console.log("Online");
})

client.on('message', (message) => {
    console.log(message.content);
    array = message.content.split(" ")
    if (array[0] === "<#938509921048223744>") {
        if (array.length > 1 && array[1].toUpperCase() === "TOP") {
            randomLanePosition = position.TOP
        } else if (array.length > 1 && array[1].toUpperCase() === "MID") {
            randomLanePosition = position.MID
        } else if (array.length > 1 && array[1].toUpperCase() === "BOT") {
            randomLanePosition = position.BOT
        } else if (array.length > 1 && array[1].toUpperCase() === "JUNGLE") {
            randomLanePosition = position.JUNGLE
        } else {
            laneIndex = Math.floor(Math.random() * Object.keys(position).length)
            randomLanePosition = position[Object.keys(position)[laneIndex]];
        }
        message.channel.send("Welcome Challengers! draw commencing...")
        message.channel.send("Champion Lane: " + postionStringValue(randomLanePosition) +"\n=========================\n")
        
        loadingFlair(message);

        main(message);
    }
})

client.login(config.token);



