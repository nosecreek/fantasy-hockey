const yahooData = require('../resources/yahooPlayers.json')

const mapNHLtoYahoo = (nhlPlayers) => {
  const positionMap = {}
  yahooData.forEach((player) => {
    const teamKey = player.editorial_team_abbr
    // let teamKey = player.editorial_team_key.split('.')[2]
    // if (teamKey === '28') teamKey = '52' //Winnipeg
    // else if (teamKey === '24') teamKey = '53' //Arizona
    // else if (teamKey === '58') teamKey = '54' //Vegas
    // else if (teamKey === '59') teamKey = '55' //Seattle
    // else if (teamKey === '11') teamKey = '1' //New Jersey
    // else if (teamKey === '18') teamKey = '28' //San Jose
    // else if (teamKey === '8') teamKey = '26' //LA
    // else if (teamKey === '9') teamKey = '25' //Dallas
    // else if (teamKey === '25') teamKey = '24' //Anahiem
    // else if (teamKey === '22') teamKey = '23' //Vancouver
    // else if (teamKey === '6') teamKey = '22' //Edmonton
    // else if (teamKey === '17') teamKey = '21' //Colorado
    // else if (teamKey === '3') teamKey = '20' //Calgary
    // else if (teamKey === '27') teamKey = '18' //Nashville
    // else if (teamKey === '5') teamKey = '17' //Detroit
    // else if (teamKey === '4') teamKey = '16' //Chicago
    // else if (teamKey === '23') teamKey = '15' //Washington
    // else if (teamKey === '20') teamKey = '14' //Tampa
    // else if (teamKey === '26') teamKey = '13' //Florida
    // else if (teamKey === '7') teamKey = '12' //Carolina
    // else if (teamKey === '21') teamKey = '10' //Toronto
    // else if (teamKey === '14') teamKey = '9' //Ottawa
    // else if (teamKey === '10') teamKey = '8' //Montreal
    // else if (teamKey === '2') teamKey = '7' //Buffalo
    // else if (teamKey === '1') teamKey = '6' //Boston
    // else if (teamKey === '16') teamKey = '5' //Pittsburg
    // else if (teamKey === '15') teamKey = '4' //Philadelphia
    // else if (teamKey === '13') teamKey = '3' //Rangers
    // else if (teamKey === '12') teamKey = '2' //Islanders
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

  const players = {}
  for (const p of nhlPlayers) {
    p.stats = {
      0: {
        value: p['gamesPlayed'],
        name: 'Games Played',
        shortname: 'GP'
      },
      1: {
        value: p['goals'],
        name: 'Goals',
        shortname: 'G'
      },
      2: {
        value: p['assists'],
        name: 'Assists',
        shortname: 'A'
      },
      4: {
        value: p['plusMinus'],
        name: 'Plus/Minus',
        shortname: '+/-'
      },
      5: {
        value: p['penaltyMinutes'],
        name: 'Penalty Minutes',
        shortname: 'PIM'
      },
      8: {
        value: p['ppPoints'],
        name: 'Power Play Points',
        shortname: 'PPP'
      },
      11: {
        value: p['shPoints'],
        name: 'Short Handed Points',
        shortname: 'SHP'
      },
      14: {
        value: p['shots'],
        name: 'Shots on Goal',
        shortname: 'SOG'
      },
      15: {
        value: (p['goals'] / p['shots']) * 100,
        name: 'Shooting %',
        shortname: 'SH%'
      },
      // 19: p.stats['Wins'],
      // 22: p.stats['Goals Against'],
      // 23: p.stats['Goals Against Average'],
      // 24: p.stats['ShotsAgainst'],
      // 25: p.stats['Saves'],
      // 26: p.stats['SavePercentage'],
      // 27: p.stats['Shutouts'],
      31: {
        value: p['hits'],
        name: 'Hits',
        shortname: 'HIT'
      },
      32: {
        value: p['blockedShots'],
        name: 'Blocks',
        shortname: 'BLK'
      },
      34: {
        value: p['timeOnIcePerGame'],
        name: 'Average Time on Ice',
        shortname: 'TOI'
      } //uncertain
    }
    p.teamId = p.teamAbbrevs
    const lastName = p.lastName.replace(/ü/g, 'u')
    p.eligible_positions =
      positionMap?.[`${p.teamId}`]?.[lastName]?.[p.skaterFullName.split(' ')[0]]
    // ||
    // positionMap?.[`${p.teamId}`]?.[lastName]?.[
    //   `${player.jerseyNumber}`
    // ] || [player.position.code]
    p.name = p.skaterFullName

    players[p.playerId] = players[p.playerId]
      ? {
          ...players[p.playerId],
          ...p,
          stats: {
            ...players[p.playerId].stats,
            ...Object.fromEntries(
              Object.entries(p.stats).filter(([key, value]) => value.value)
            )
          }
        }
      : p
  }

  return Object.values(players)
}

const playerMapping = {
  mapNHLtoYahoo
}

export default playerMapping
