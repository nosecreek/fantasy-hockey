import axios from 'axios'

const calculatePredicted = async (
  team,
  roster,
  goalieStats,
  schedule,
  stats,
  lastMonthSchedule,
  matchupStats = false
) => {
  roster.forEach((player) => {
    //exclude injured/NA players
    if (!player.status) {
      const gamesThisWeek = schedule.dates.filter((date) => {
        return date.games.some((game) => {
          return (
            game.teams.away.team.name.replace('é', 'e') ===
              player.editorial_team_full_name ||
            game.teams.home.team.name.replace('é', 'e') ===
              player.editorial_team_full_name
          )
        })
      }).length

      const gamesPlayed = parseInt(
        player.stats.stats.find((stat) => stat.stat_id === '0').value
      )

      //Player Stats
      if (player.position_type !== 'G') {
        stats.forEach((cat) => {
          if (cat.group !== 'goaltending') {
            const playerAvg =
              parseFloat(
                player.stats.stats
                  .find((stat) => parseInt(stat.stat_id) === cat.id)
                  ?.value.replace(/,/g, '') || 0
              ) / gamesPlayed

            cat[team] += playerAvg * gamesThisWeek
          }
        })

        //Goalie Stats
      } else {
        const playerStartedLastMonth = parseInt(
          goalieStats
            .find((g) => g.player_id === player.player_id)
            .stats.stats.find((stat) => stat.stat_id === '0').value
        )

        const teamsGamesLastMonth = lastMonthSchedule.dates.filter((date) => {
          return date.games.some((game) => {
            return (
              game.teams.away.team.name === player.editorial_team_full_name ||
              game.teams.home.team.name === player.editorial_team_full_name
            )
          })
        }).length

        const percentPlayed = playerStartedLastMonth / teamsGamesLastMonth

        stats.forEach((cat) => {
          if (cat.group === 'goaltending') {
            const playerAvg =
              parseFloat(
                player.stats.stats
                  .find((stat) => parseInt(stat.stat_id) === cat.id)
                  ?.value.replace(/,/g, '') || 0
              ) / gamesPlayed
            cat[team] += playerAvg * gamesThisWeek * percentPlayed
          }
        })
      }
    }
  })

  //Calculate GAA
  stats.find((cat) => cat.id === 23)[team] =
    stats.find((cat) => cat.id === 22)[team] /
    (stats.find((cat) => cat.id === 28)[team] || 1 / 60)

  //If current week, add existing totals
  if (matchupStats) {
    stats.forEach((cat) => {
      if (cat.id !== 28 && cat.id !== 23 && cat.id !== 22) {
        cat[team] += parseFloat(
          matchupStats.find((stat) => cat.id === parseInt(stat.stat_id))
            ?.value || '0'
        )
      }
    })

    //Calculate GAA according to % of week played
    //Currently assumes a 7 day matchup, should be adjust to account for multi-week matchups
    const dayofweek = new Date().getDay()
    const dayoffset = (dayofweek === 0 ? 7 : dayofweek) / 7
    const knownAmount =
      matchupStats.find((stat) => stat.stat_id === '23').value * dayoffset
    const predictedAmount =
      stats.find((cat) => cat.id === 23)[team] * (1 - dayoffset)
    stats.find((cat) => cat.id === 23)[team] = knownAmount + predictedAmount
  }

  //Calculate Save %
  stats.find((cat) => cat.id === 26)[team] =
    stats.find((cat) => cat.id === 25)[team] /
    stats.find((cat) => cat.id === 24)[team]

  return stats
}

const getStats = async (
  teamStats,
  teamRoster,
  league,
  lastMonthSchedule,
  matchup,
  week,
  currentWeek,
  weekSchedule,
  nextSchedule,
  weekStats,
  nextStats
) => {
  //Load opponent stats
  const getOppStats = async () => {
    const result = await axios.post('/api/teamstats', {
      teamKey: matchup.matchups[week - 1].teams[1].team_key
    })
    return result.data
  }

  //If current or next week, use precalculated stats
  if (
    weekStats &&
    nextStats &&
    (week === currentWeek || week === currentWeek + 1)
  ) {
    const oppStats = await getOppStats()
    return week === currentWeek ? [weekStats, oppStats] : [nextStats, oppStats]
  }

  //Load opponent roster
  const getOppRoster = async () => {
    const result = await axios.post('/api/rosters', {
      teamKeys: [matchup.matchups[week - 1].teams[1].team_key]
    })
    return result.data.team
  }

  //Load nhl schedule
  const getSchedule = async () => {
    if (week === currentWeek) {
      return weekSchedule
    } else if (week === currentWeek + 1) {
      return nextSchedule
    } else {
      const result = await axios.get(
        `https://statsapi.web.nhl.com/api/v1/schedule?startDate=${
          matchup.matchups[week - 1].week_start
        }&endDate=${matchup.matchups[week - 1].week_end}`
      )
      return result.data
    }
  }

  //Resolve promises
  let oppStats, oppRoster, schedule
  try {
    ;[oppStats, oppRoster, schedule] = await Promise.all([
      getOppStats(),
      getOppRoster(),
      getSchedule()
    ])
  } catch (e) {}

  //Capture which categories the league uses from league settings
  let stats = league.settings.stat_categories.map((cat) => ({
    id: cat.stat_id,
    name: cat.name,
    abbr: cat.abbr,
    group: cat.group,
    teamStat: teamStats.stats.find(
      (s) => parseInt(s.stat_id) === parseInt(cat.stat_id)
    ).value,
    oppStat: oppStats.stats.find(
      (s) => parseInt(s.stat_id) === parseInt(cat.stat_id)
    ).value,
    teamPredicted: 0,
    oppPredicted: 0,
    hidden: cat.is_only_display_stat || false
  }))

  //Add TOI cat for goalies - use to calculate GAA
  stats.push({
    id: 28,
    name: 'TOI',
    group: 'goaltending',
    teamStat: 0,
    oppStat: 0,
    teamPredicted: 0,
    oppPredicted: 0,
    hidden: true
  })

  //Load goalie stats
  const getGoalies = (roster) => {
    const goalies = []
    roster.forEach((player) => {
      if (player.position_type === 'G') {
        goalies.push(player.player_key)
      }
    })
    return goalies
  }
  const goalieStats = await axios.post('/api/players', {
    playerIds: [...getGoalies(teamRoster), ...getGoalies(oppRoster)],
    week: 'lastmonth'
  })

  //Calculate team predictions
  stats = await calculatePredicted(
    'teamPredicted',
    teamRoster,
    goalieStats.data,
    schedule,
    stats,
    lastMonthSchedule,
    week === currentWeek ? matchup.matchups[week - 1].teams[0].stats : false
  )

  //Calculate opponent predictions
  stats = await calculatePredicted(
    'oppPredicted',
    oppRoster,
    goalieStats.data,
    schedule,
    stats,
    lastMonthSchedule,
    week === currentWeek ? matchup.matchups[week - 1].teams[1].stats : false
  )

  return [stats, oppStats]
}

export default getStats
