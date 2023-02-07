import { useEffect, useState } from 'react'
import Table from 'react-bootstrap/Table'
import Loading from './Loading'

const Players = ({ players, leagueStats }) => {
  const [playerList, setPlayerList] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const calculteRankings = () => {
      const totals = {}
      players[0].stats.stats.forEach((s) => (totals[s.stat_id] = { value: 0 }))

      players.forEach((p) => {
        p.stats.stats.forEach((stat) => {
          totals[stat.stat_id].value += parseFloat(stat.value)
        })
      })

      let weight = 0
      Object.keys(totals).forEach((k) => {
        weight += totals[k].value
      })

      Object.keys(totals).forEach((k) => {
        totals[k].weight = 1 / (totals[k].value / weight)

        totals[k].average = totals[k].value / 300
      })

      const newPlayers = players.map((p) => {
        let vorp = 0
        const playerStats = p.stats.stats.map((s) => {
          vorp +=
            (s.value - totals[s.stat_id].average) *
            totals[s.stat_id].weight *
            stats.find((stat) => stat.id === parseInt(s.stat_id))?.weight
          return {
            stat_id: s.stat_id,
            value: s.value
          }
        })

        playerStats.push({
          stat_id: 'vorp',
          value: vorp
        })

        const positions = p.eligible_positions.filter(
          (p) => p !== 'IR+' && p !== 'Util'
        )

        return {
          id: p.player_id,
          name: p.name.full,
          team: p.editorial_team_abbr,
          positions: positions,
          stats: playerStats
        }
      })

      newPlayers.sort(
        (a, b) =>
          b.stats[b.stats.length - 1].value - a.stats[b.stats.length - 1].value
      )

      setPlayerList(newPlayers.map((p, i) => ({ ...p, rank: i + 1 })))
    }
    if (players && stats) calculteRankings()
  }, [players, stats])

  useEffect(() => {
    if (leagueStats) {
      const newStats = leagueStats
        .filter((stat) => stat.group === 'offense')
        .map((stat) => ({
          id: stat.id,
          name: stat.abbr,
          weight: 1
        }))
      setStats(newStats)
    }
  }, [leagueStats])

  const changeWeight = (id) => {
    const newStat = stats.find((stat) => stat.id === id)
    if (newStat.weight === 1) {
      newStat.weight = 2
    } else if (newStat.weight === 2) {
      newStat.weight = 0
    } else if (newStat.weight === 0) {
      newStat.weight = 1
    }

    const newStats = stats.map((stat) => (stat.id === id ? newStat : stat))
    setStats(newStats)
  }

  if (!playerList || !stats) return <Loading />

  return (
    <Table bordered hover>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Name</th>
          <th>Position</th>
          <th>Team</th>
          {stats.map((stat) => (
            <th
              key={stat.id}
              onClick={() => changeWeight(stat.id)}
              className={`weight${stat.weight} stat`}
            >
              {stat.name}
            </th>
          ))}
          <th>VORP</th>
        </tr>
      </thead>
      <tbody>
        {playerList.map((player, i) => (
          <tr key={player.id}>
            <td>{player.rank}</td>
            <td>{player.name}</td>
            <td>{player.positions.toString()}</td>
            <td>{player.team}</td>
            {player.stats.map((stat) => (
              <td key={stat.stat_id}>{parseFloat(stat.value).toFixed(0)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

export default Players
