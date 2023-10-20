const yahooData = require('../resources/yahooPlayers.json')

const mapNHLtoYahoo = (nhlPlayers) => {
  const positionMap = {}
  console.log(yahooData)
  yahooData.forEach((player) => {
    let teamKey = player.editorial_team_key.split('.')[2]
    if (teamKey === '28') teamKey = '52' //Winnipeg
    else if (teamKey === '24') teamKey = '53' //Arizona
    else if (teamKey === '58') teamKey = '54' //Vegas
    else if (teamKey === '59') teamKey = '55' //Seattle
    else if (teamKey === '11') teamKey = '1' //New Jersey
    else if (teamKey === '18') teamKey = '28' //San Jose
    else if (teamKey === '8') teamKey = '26' //LA
    else if (teamKey === '9') teamKey = '25' //Dallas
    else if (teamKey === '25') teamKey = '24' //Anahiem
    else if (teamKey === '22') teamKey = '23' //Vancouver
    else if (teamKey === '6') teamKey = '22' //Edmonton
    else if (teamKey === '17') teamKey = '21' //Colorado
    else if (teamKey === '3') teamKey = '20' //Calgary
    else if (teamKey === '27') teamKey = '18' //Nashville
    else if (teamKey === '5') teamKey = '17' //Detroit
    else if (teamKey === '4') teamKey = '16' //Chicago
    else if (teamKey === '23') teamKey = '15' //Washington
    else if (teamKey === '20') teamKey = '14' //Tampa
    else if (teamKey === '26') teamKey = '13' //Florida
    else if (teamKey === '7') teamKey = '12' //Carolina
    else if (teamKey === '21') teamKey = '10' //Toronto
    else if (teamKey === '14') teamKey = '9' //Ottawa
    else if (teamKey === '10') teamKey = '8' //Montreal
    else if (teamKey === '2') teamKey = '7' //Buffalo
    else if (teamKey === '1') teamKey = '6' //Boston
    else if (teamKey === '16') teamKey = '5' //Pittsburg
    else if (teamKey === '15') teamKey = '4' //Philadelphia
    else if (teamKey === '13') teamKey = '3' //Rangers
    else if (teamKey === '12') teamKey = '2' //Islanders
    const uniformNumber = player.uniform_number
    const lastName = player.name.last
    const firstName = player.name.first
    const positions = player.eligible_positions

    if (!positionMap[teamKey]) {
      positionMap[teamKey] = {}
    }

    if (!positionMap[teamKey][lastName]) {
      positionMap[teamKey][lastName] = {}
    }
    positionMap[teamKey][lastName][firstName] = positions
    positionMap[teamKey][lastName][uniformNumber] = positions
  })

  const players = []
  for (const team of nhlPlayers.teams) {
    for (const player of team.roster.roster) {
      const p = player.person
      if (p.primaryPosition.code !== 'G') {
        if (!p.stats?.[0]?.splits?.[0]?.stat) {
          p.stats = {}
        } else {
          p.stats = p.stats?.[0]?.splits?.[0]?.stat
        }
        p.stats = {
          0: p.stats['games'],
          1: p.stats['goals'],
          2: p.stats['assists'],
          4: p.stats['plusMinus'],
          5: p.stats['pim'],
          8: p.stats['powerPlayPoints'],
          11: p.stats['shortHandedPoints'],
          14: p.stats['shots'],
          15: p.stats['goals'] / p.stats['shots'],
          // 19: p.stats['Wins'],
          // 22: p.stats['Goals Against'],
          // 23: p.stats['Goals Against Average'],
          // 24: p.stats['ShotsAgainst'],
          // 25: p.stats['Saves'],
          // 26: p.stats['SavePercentage'],
          // 27: p.stats['Shutouts'],
          31: p.stats['hits'],
          32: p.stats['blocked'],
          34: p.stats['timeOnIcePerGame'] //uncertain
        }
        p.teamName = team.name
        p.teamShortName = team.shortName
        p.teamId = team.id
        const lastName = p.lastName.replace(/ü/g, 'u')
        p.eligible_positions = positionMap?.[`${team.id}`]?.[lastName]?.[
          p.firstName
        ] ||
          positionMap?.[`${team.id}`]?.[lastName]?.[
            `${player.jerseyNumber}`
          ] || [player.position.code]

        if (
          !positionMap?.[`${team.id}`]?.[lastName]?.[p.firstName] &&
          !positionMap?.[`${team.id}`]?.[lastName]?.[`${player.jerseyNumber}`]
        )
          players.push(p)
      }
    }
  }

  return players
}

const playerMapping = {
  mapNHLtoYahoo
}

export default playerMapping
