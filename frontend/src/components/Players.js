import { useEffect, useState } from 'react'
import Table from 'react-bootstrap/Table'
import Loading from './Loading'

const Players = ({ players, stats }) => {
  const [playerList, setPlayerList] = useState(null)

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
        const stats = p.stats.stats.map((s) => {
          vorp +=
            (s.value - totals[s.stat_id].average) * totals[s.stat_id].weight
          return {
            stat_id: s.stat_id,
            value: s.value
          }
        })

        stats.push({
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
          stats: stats
        }
      })

      setPlayerList(
        newPlayers.sort(
          (a, b) =>
            b.stats[b.stats.length - 1].value -
            a.stats[b.stats.length - 1].value
        )
      )
    }
    if (players) calculteRankings()
  }, [players])

  if (!players || !stats) return <Loading />

  return (
    <Table bordered hover>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Name</th>
          <th>Position</th>
          <th>Team</th>
          {stats.slice(0, playerList[0].stats.length - 1).map((stat) => (
            <th key={stat.id}>{stat.abbr}</th>
          ))}
          <th>VORP</th>
        </tr>
      </thead>
      <tbody>
        {playerList.map((player, i) => (
          <tr key={player.id}>
            <td>{i + 1}</td>
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
