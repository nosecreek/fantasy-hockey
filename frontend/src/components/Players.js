import { useEffect, useState } from 'react'
import Table from 'react-bootstrap/Table'
import Form from 'react-bootstrap/Form'
import Loading from './Loading'

const Players = ({ players, leagueStats, teamKey }) => {
  const [playerList, setPlayerList] = useState(null)
  const [stats, setStats] = useState(null)
  const [freeAgents, setFreeAgents] = useState(true)
  const [myTeam, setMyTeam] = useState(false)

  const positions = [
    { name: 'ALL', value: 'ALL' },
    { name: 'C', value: 'C' },
    { name: 'RW', value: 'RW' },
    { name: 'LW', value: 'LW' },
    { name: 'F', value: 'F' },
    { name: 'D', value: 'D' }
  ]
  const [position, setPosition] = useState(positions[0].value)

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
          stats: playerStats,
          ownership: p.ownership
        }
      })

      newPlayers.sort(
        (a, b) =>
          b.stats[b.stats.length - 1].value - a.stats[b.stats.length - 1].value
      )

      let rankedPlayers = newPlayers.map((p, i) => ({ ...p, rank: i + 1 }))

      if (freeAgents) {
        if (!myTeam) {
          rankedPlayers = rankedPlayers.filter(
            (p) => p.ownership.ownership_type === 'freeagents'
          )
        } else {
          rankedPlayers = rankedPlayers.filter(
            (p) =>
              p.ownership.ownership_type === 'freeagents' ||
              p.ownership?.owner_team_key === teamKey
          )
        }
      } else {
        if (myTeam) {
          rankedPlayers = rankedPlayers.filter(
            (p) => p.ownership?.owner_team_key === teamKey
          )
        }
      }

      if (position === 'F') {
        rankedPlayers = rankedPlayers.filter(
          (p) =>
            p.positions.includes('LW') ||
            p.positions.includes('C') ||
            p.positions.includes('RW')
        )
      } else if (position !== 'ALL') {
        rankedPlayers = rankedPlayers.filter((p) =>
          p.positions.includes(position)
        )
      }

      setPlayerList(rankedPlayers)
    }
    if (players && stats) calculteRankings()
  }, [freeAgents, myTeam, players, position, stats, teamKey])

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
    <div>
      <Form className="player-filters">
        <Form.Group>
          <Form.Check
            type="checkbox"
            label="Free Agents"
            checked={freeAgents}
            onChange={({ target }) => setFreeAgents(target.checked)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Check
            type="checkbox"
            label="My Team"
            checked={myTeam}
            onChange={({ target }) => setMyTeam(target.checked)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Select
            onChange={(e) => setPosition(e.target.value)}
            value={position}
            style={{ width: 'auto', height: 'auto' }}
          >
            {positions.map((p, i) => (
              <option value={p.value} key={p.name}>
                {p.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Form>
      <Table bordered hover className="player-table">
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
            <tr
              key={player.id}
              className={
                player.ownership?.owner_team_key === teamKey ? 'my-team' : ''
              }
            >
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
    </div>
  )
}

export default Players
