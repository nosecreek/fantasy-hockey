import React, { useEffect, useMemo, useState } from 'react'
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

  const weights = useMemo(() => {
    return [0, 0.5, 1, 1.75, 2.5]
  }, [])

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

      //Calculate VORP for each player
      const newPlayers = players.map((p) => {
        let vorp = 0

        const playerStats = p.stats.stats.map((s) => {
          vorp +=
            s.value *
            totals[s.stat_id].weight *
            weights?.[
              stats.find((stat) => stat.id === parseInt(s.stat_id))?.weight
            ]
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
    weekSchedule,
    weights
  ])

  useEffect(() => {
    if (leagueStats) {
      const newStats = leagueStats
        .filter((stat) => stat.group === 'offense')
        .map((stat) => ({
          id: stat.id,
          name: stat.abbr,
          weight: 2
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
    newStat.weight = (newStat.weight + 1) % weights.length
    const newStats = stats.map((stat) => (stat.id === id ? newStat : stat))
    setStats(newStats)
  }

  const prioritizeCurrent = () => {
    const newStats = stats.map((stat) => {
      let weight = 2
      if (
        stat.id === 'week' ||
        stat.id === weekWeight[0].id ||
        stat.id === weekWeight[1].id
      ) {
        weight = 4
      } else if (
        stat.id === 'next' ||
        stat.id === weekWeight[weekWeight.length - 1].id ||
        stat.id === weekWeight[weekWeight.length - 2].id
      ) {
        weight = 0
      } else if (stat.id === weekWeight[2].id || stat.id === weekWeight[3].id) {
        weight = 3
      } else if (
        stat.id === weekWeight[weekWeight.length - 3].id ||
        stat.id === weekWeight[weekWeight.length - 4].id
      ) {
        weight = 1
      }
      return { ...stat, weight: weight }
    })

    setStats(newStats)
  }

  const prioritizeNext = () => {
    const newStats = stats.map((stat) => {
      let weight = 2
      if (
        stat.id === 'next' ||
        stat.id === nextWeight[0].id ||
        stat.id === nextWeight[1].id
      ) {
        weight = 4
      } else if (
        stat.id === 'week' ||
        stat.id === nextWeight[nextWeight.length - 1].id ||
        stat.id === nextWeight[nextWeight.length - 2].id
      ) {
        weight = 0
      } else if (stat.id === nextWeight[2].id || stat.id === nextWeight[3].id) {
        weight = 3
      } else if (
        stat.id === nextWeight[nextWeight.length - 3].id ||
        stat.id === nextWeight[nextWeight.length - 4].id
      ) {
        weight = 1
      }
      return { ...stat, weight: weight }
    })

    setStats(newStats)
  }

  const handleClear = () => {
    const newStats = stats.map((stat) => {
      let weight = 2
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
            <th className="desktop">Rank</th>
            <th className="desktop">Name</th>
            <th className="desktop">Position</th>
            <th className="desktop">Team</th>
            {stats.map((stat) => (
              <th
                key={stat.id}
                onClick={() => changeWeight(stat.id)}
                className={`weight${stat.weight} stat`}
              >
                {stat.name}
              </th>
            ))}
            <th>VAL</th>
          </tr>
        </thead>
        <tbody>
          {playerList.map((player, i) => (
            <React.Fragment key={player.id}>
              <tr
                className={
                  'mobile ' +
                  (player.ownership?.owner_team_key === teamKey
                    ? 'my-team'
                    : '')
                }
              >
                <td colSpan="100%">
                  Rank {player.rank} - <strong>{player.name}</strong> -{' '}
                  {player.positions.toString()} ({player.team})
                </td>
              </tr>
              <tr
                className={
                  player.ownership?.owner_team_key === teamKey ? 'my-team' : ''
                }
              >
                <td className="desktop">{player.rank}</td>
                <td className="desktop">{player.name}</td>
                <td className="desktop">{player.positions.toString()}</td>
                <td className="desktop">{player.team}</td>
                {player.stats.map((stat) => (
                  <td key={stat.stat_id}>
                    {parseFloat(stat.value).toFixed(0)}
                  </td>
                ))}
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

export default Players
