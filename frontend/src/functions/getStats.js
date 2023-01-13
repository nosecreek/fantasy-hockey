import axios from 'axios'

const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
  .toISOString()
  .split('T')[0]
const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
  .toISOString()
  .split('T')[0]

const calculatePredicted = async (
  team,
  roster,
  schedule,
  stats,
  lastMonthSchedule
) => {
  for await (const player of roster) {
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
        let playerStartedLastMonth
        try {
          const result = await axios.post('/api/player', {
            playerId: player.player_key,
            week: 'lastmonth'
          })
          playerStartedLastMonth = parseInt(
            result.data.stats.stats.find((stat) => stat.stat_id === '0').value
          )
        } catch (e) {
          console.log(e)
        }

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
  league,
  teamStats,
  oppStats,
  teamRoster,
  oppRoster,
  schedule
) => {
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

  let lastMonthSchedule
  try {
    const result = await axios.get(
      `https://statsapi.web.nhl.com/api/v1/schedule?startDate=${lastMonth}&endDate=${yesterday}`
    )
    lastMonthSchedule = result.data
  } catch (e) {}

  stats = await calculatePredicted(
    'teamPredicted',
    teamRoster,
    schedule,
    stats,
    lastMonthSchedule
  )
  stats = await calculatePredicted(
    'oppPredicted',
    oppRoster,
    schedule,
    stats,
    lastMonthSchedule
  )

  return stats
}

export default getStats
