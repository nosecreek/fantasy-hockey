import axios from 'axios'

const calculatePredicted = async (
  team,
  roster,
  goalieStats,
  schedule,
  stats,
  lastMonthSchedule
) => {
  for (const [i, player] of roster.entries()) {
    if (!player.status) {
      const gamesThisWeek = schedule.dates.filter((date) => {
        return date.games.some((game) => {
          return (
            game.teams.away.team.name === player.editorial_team_full_name ||
            game.teams.home.team.name === player.editorial_team_full_name
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
          goalieStats[i].data.stats.stats.find((stat) => stat.stat_id === '0')
            .value
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

        //Calculate GAA
        stats.find((cat) => cat.id === 23)[team] =
          stats.find((cat) => cat.id === 22)[team] /
          (stats.find((cat) => cat.id === 28)[team] / 60)

        //Calculate Save %
        stats.find((cat) => cat.id === 26)[team] =
          stats.find((cat) => cat.id === 25)[team] /
          stats.find((cat) => cat.id === 24)[team]
      }
    }
  }
  return stats
}

const getStats = async (
  teamStats,
  teamRoster,
  league,
  lastMonthSchedule,
  matchup,
  week
) => {
  //Load opponent stats
  const getOppStats = async () => {
    const result = await axios.post('/api/teamstats', {
      teamKey: matchup.matchups[week - 1].teams[1].team_key
    })
    return result.data
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
    const result = await axios.get(
      `https://statsapi.web.nhl.com/api/v1/schedule?startDate=${
        matchup.matchups[week - 1].week_start
      }&endDate=${matchup.matchups[week - 1].week_end}`
    )
    return result.data
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

  let stats = league.settings.stat_categories.map((cat) => ({
    id: cat.stat_id,
    name: cat.name,
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
  const getGoalies = async (roster) => {
    const goalies = []
    for (const [i, player] of roster.entries()) {
      if (player.position_type === 'G') {
        goalies[i] = axios.post('/api/player', {
          playerId: player.player_key,
          week: 'lastmonth'
        })
      }
    }
    return await Promise.all(goalies)
  }
  const [teamGoalieStats, oppGoalieStats] = await Promise.all([
    getGoalies(teamRoster),
    getGoalies(oppRoster)
  ])
  console.log(teamGoalieStats, oppGoalieStats)

  stats = await calculatePredicted(
    'teamPredicted',
    teamRoster,
    teamGoalieStats,
    schedule,
    stats,
    lastMonthSchedule
  )
  stats = await calculatePredicted(
    'oppPredicted',
    oppRoster,
    oppGoalieStats,
    schedule,
    stats,
    lastMonthSchedule
  )

  return [stats, oppStats]
}

export default getStats
