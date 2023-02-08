import { useEffect, useState } from 'react'
import Table from 'react-bootstrap/Table'
import Form from 'react-bootstrap/Form'
import Loading from './Loading'
import Button from 'react-bootstrap/esm/Button'
import matchupFunctions from '../functions/matchup'

const Players = ({
  players,
  leagueStats,
  teamKey,
  weekSchedule,
  nextSchedule,
  weekStats,
  nextStats
}) => {
  const [playerList, setPlayerList] = useState(null)
  const [stats, setStats] = useState(null)
  const [freeAgents, setFreeAgents] = useState(true)
  const [myTeam, setMyTeam] = useState(false)
  const [weekWeight, setWeekWeight] = useState(null)
  const [nextWeight, setNextWeight] = useState(null)

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
      //use totals by all players to calculate a "weight" for each stat
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
        totals[k].weight =
          1 / (totals[k].value / weight) + players[0].stats.stats.length * 1

        totals[k].average = totals[k].value / 300
      })
      console.log(totals)
      //Calculate VORP for each player
      const newPlayers = players.map((p) => {
        let vorp = 0
        const playerStats = p.stats.stats.map((s) => {
          vorp +=
            s.value *
            totals[s.stat_id].weight *
            stats.find((stat) => stat.id === parseInt(s.stat_id))?.weight
          return {
            stat_id: s.stat_id,
            value: s.value
          }
        })

        const gamesThisWeek = weekSchedule.dates.filter((date) => {
          return date.games.some((game) => {
            return (
              game.teams.away.team.name.replace('é', 'e') ===
                p.editorial_team_full_name ||
              game.teams.home.team.name.replace('é', 'e') ===
                p.editorial_team_full_name
            )
          })
        }).length
        playerStats.push({
          stat_id: 'week',
          value: gamesThisWeek
        })

        const gamesNextWeek = nextSchedule.dates.filter((date) => {
          return date.games.some((game) => {
            return (
              game.teams.away.team.name.replace('é', 'e') ===
                p.editorial_team_full_name ||
              game.teams.home.team.name.replace('é', 'e') ===
                p.editorial_team_full_name
            )
          })
        }).length
        playerStats.push({
          stat_id: 'next',
          value: gamesNextWeek
        })

        vorp +=
          vorp *
          (gamesThisWeek - 1) *
          stats.find((stat) => stat.id === 'week')?.weight
        vorp +=
          vorp *
          (gamesNextWeek - 1) *
          stats.find((stat) => stat.id === 'next')?.weight

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

      //Sort players by VORP
      newPlayers.sort(
        (a, b) =>
          b.stats[b.stats.length - 1].value - a.stats[b.stats.length - 1].value
      )

      //Give a Rank to each player
      let rankedPlayers = newPlayers.map((p, i) => ({ ...p, rank: i + 1 }))

      //Filters
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
  }, [
    freeAgents,
    myTeam,
    nextSchedule,
    players,
    position,
    stats,
    teamKey,
    weekSchedule
  ])

  useEffect(() => {
    if (leagueStats) {
      const newStats = leagueStats
        .filter((stat) => stat.group === 'offense')
        .map((stat) => ({
          id: stat.id,
          name: stat.abbr,
          weight: 1
        }))
      newStats.push({
        id: 'week',
        name: 'WEEK',
        weight: 0
      })
      newStats.push({
        id: 'next',
        name: 'NEXT',
        weight: 0
      })
      setStats(newStats)
    }
  }, [leagueStats])

  useEffect(() => {
    const weighStats = () => {
      const weightedWeek = weekStats
        .filter((stat) => stat.group === 'offense')
        .map((stat) => ({
          id: stat.id,
          value: Math.abs(
            0.5 -
              matchupFunctions.valueToColor(
                stat.teamPredicted,
                stat.oppPredicted,
                stat.id,
                true
              )
          )
        }))
        .sort((a, b) => a.value - b.value)

      const weightedNext = nextStats
        .filter((stat) => stat.group === 'offense')
        .map((stat) => ({
          id: stat.id,
          value: Math.abs(
            0.5 -
              matchupFunctions.valueToColor(
                stat.teamPredicted,
                stat.oppPredicted,
                stat.id,
                true
              )
          )
        }))
        .sort((a, b) => a.value - b.value)

      setWeekWeight(weightedWeek)
      setNextWeight(weightedNext)
    }

    if (nextStats && weekStats) weighStats()
  }, [nextStats, weekStats])

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

  const prioritizeCurrent = () => {
    const newStats = stats.map((stat) => {
      let weight = 1
      if (
        stat.id === 'week' ||
        stat.id === weekWeight[0].id ||
        stat.id === weekWeight[1].id
      ) {
        weight = 2
      } else if (
        stat.id === 'next' ||
        stat.id === weekWeight[weekWeight.length - 1].id ||
        stat.id === weekWeight[weekWeight.length - 2].id
      ) {
        weight = 0
      }
      return { ...stat, weight: weight }
    })

    setStats(newStats)
  }

  const prioritizeNext = () => {
    const newStats = stats.map((stat) => {
      let weight = 1
      if (
        stat.id === 'next' ||
        stat.id === nextWeight[0].id ||
        stat.id === nextWeight[1].id
      ) {
        weight = 2
      } else if (
        stat.id === 'week' ||
        stat.id === nextWeight[nextWeight.length - 1].id ||
        stat.id === nextWeight[nextWeight.length - 2].id
      ) {
        weight = 0
      }
      return { ...stat, weight: weight }
    })

    setStats(newStats)
  }

  const handleClear = () => {
    const newStats = stats.map((stat) => {
      let weight = 1
      if (stat.id === 'next' || stat.id === 'week') {
        weight = 0
      }
      return { ...stat, weight: weight }
    })

    setStats(newStats)
  }

  if (!playerList || !stats) return <Loading />

  return (
    <div>
      <Form className="player-filters">
        <h4>Filters</h4>
        <div className="filters">
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
        </div>
        <h4>Optimize For</h4>
        <div className="filters">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => prioritizeCurrent()}
          >
            Current Matchup
          </Button>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => prioritizeNext()}
          >
            Next Matchup
          </Button>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => handleClear()}
          >
            Clear All
          </Button>
        </div>
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