var axios = require('axios');
const Discord = require('discord.js');
const client = new Discord.Client({partials: ["MESSAGE", "CHANNEL", "REACTION"]});



var data = 'GhostHunt3r101,euw1';
let position = {
    TOP: ['Fighter', 'Tank', 'Assasin'],
    MID: ['Mage', 'Assasin'],
    BOT: ['Marksman', 'Support'],
    JUNGLE: ['Fighter', 'Tank']
}
let exclusionList = ["Blitzcrank"]

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
    message.channel.send(`GhostHunt3r101: ${getRandomChampion(player1Champions)}\nVERSUS\nPragma0nce: ${getRandomChampion(player2Champions)}`)
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
        main(message);
    }
})

client.login('OTM4MTM0MDQ5NTM5NjI0OTkw.Yfl3aw.BGwth741CuprLITHkxQ80RT5Ubw');



