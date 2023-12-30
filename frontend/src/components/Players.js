import React, { useEffect, useMemo, useState } from 'react'
import Table from 'react-bootstrap/Table'
import Form from 'react-bootstrap/Form'
import Loading from './Loading'
import Button from 'react-bootstrap/esm/Button'
import matchupFunctions from '../functions/matchup'
import utils from '../functions/utils'
import Login from './Login'
import Pagination from 'react-bootstrap/Pagination'

const Players = ({
  players,
  leagueStats,
  teamKey,
  weekSchedule,
  nextSchedule,
  weekStats,
  nextStats,
  setTeamKey,
  setLeagueKey,
  setHelpScreen,
  loggedIn
}) => {
  const [playerList, setPlayerList] = useState(null)
  const [stats, setStats] = useState(null)
  const [freeAgents, setFreeAgents] = useState(true)
  const [myTeam, setMyTeam] = useState(false)
  const [weekWeight, setWeekWeight] = useState(null)
  const [nextWeight, setNextWeight] = useState(null)
  const [page, setPage] = useState(0)
  const [pageItems, setPageItems] = useState([])
  const [filteredPlayers, setFilteredPlayers] = useState(null)

  const pages = parseInt(players.length / 25)

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
      Object.keys(players[0].stats).forEach(
        (key) => (totals[key] = { value: 0 })
      )

      // players[0].stats.stats.forEach((s) => (totals[s.stat_id] = { value: 0 }))

      players.forEach((p) => {
        Object.entries(p.stats).forEach(([key, value]) => {
          totals[key].value += parseFloat(value.value || 0)
        })
      })

      let weight = 0
      Object.keys(totals).forEach((k) => {
        weight += totals[k].value
      })

      Object.keys(totals).forEach((k) => {
        totals[k].weight =
          1 / (totals[k].value / weight) +
          Object.keys(players[0].stats).length * 1

        totals[k].average =
          totals[k].value /
          players.filter((player) => player.stats[0] !== 0).length

        if (k === '4') {
          totals[k].weight = totals[k].weight / 10 //adjustment for +/-
        }
      })

      //Calculate VORP for each player
      const newPlayers = players.map((p) => {
        let vorp = 0

        const playerStats = Object.entries(p.stats).map(([key, value]) => {
          vorp +=
            ((value.value || 0) / p.stats['0']?.value) *
            totals[key].weight *
            weights?.[
              stats.find((stat) => parseInt(stat.id) === parseInt(key))?.weight
            ]
          return {
            stat_id: key,
            value: value.value
          }
        })

        const gamesThisWeek = weekSchedule.filter((date) => {
          return date.games.some((game) => {
            return (
              game.awayTeam.abbrev === p.teamId ||
              game.homeTeam.abbrev === p.teamId
            )
          })
        }).length
        playerStats['week'] = {
          value: gamesThisWeek,
          name: 'Current Week',
          shortname: 'WEEK'
        }

        const gamesNextWeek = nextSchedule.filter((date) => {
          return date.games.some((game) => {
            return (
              game.awayTeam.abbrev === p.teamId ||
              game.homeTeam.abbrev === p.teamId
            )
          })
        }).length
        playerStats['next'] = {
          value: gamesNextWeek,
          name: 'Next Week',
          shortname: 'NEXT'
        }

        vorp +=
          vorp *
          (gamesThisWeek - 1) *
          stats.find((stat) => stat.id === 'week')?.weight
        vorp +=
          vorp *
          (gamesNextWeek - 1) *
          stats.find((stat) => stat.id === 'next')?.weight

        playerStats['vorp'] = {
          value: vorp,
          name: 'Value',
          shortname: 'VAL'
        }

        const positions = p.eligible_positions?.filter(
          (p) => p !== 'IR+' && p !== 'Util'
        )

        return {
          id: p.playerId,
          name: p.skaterFullName,
          team: p.teamId,
          positions: positions,
          stats: playerStats,
          ownership: p?.ownership
        }
      })

      //Sort players by VORP
      newPlayers.sort((a, b) => b.stats['vorp'].value - a.stats['vorp'].value)

      //Give a Rank to each player
      let rankedPlayers = newPlayers.map((p, i) => ({ ...p, rank: i + 1 }))

      //Filters
      // if (freeAgents) {
      //   if (!myTeam) {
      //     rankedPlayers = rankedPlayers.filter(
      //       (p) => p.ownership.ownership_type === 'freeagents'
      //     )
      //   } else {
      //     rankedPlayers = rankedPlayers.filter(
      //       (p) =>
      //         p.ownership.ownership_type === 'freeagents' ||
      //         p.ownership?.owner_team_key === teamKey
      //     )
      //   }
      // } else {
      //   if (myTeam) {
      //     rankedPlayers = rankedPlayers.filter(
      //       (p) => p.ownership?.owner_team_key === teamKey
      //     )
      //   }
      // }

      if (position === 'F') {
        rankedPlayers = rankedPlayers.filter(
          (p) =>
            p.positions?.includes('LW') ||
            p.positions?.includes('C') ||
            p.positions?.includes('RW')
        )
      } else if (position !== 'ALL') {
        rankedPlayers = rankedPlayers.filter((p) =>
          p.positions?.includes(position)
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
    if (players) {
      const newStats = []
      Object.entries(players[0].stats).forEach(([key, value]) => {
        newStats.push({
          value: value.value,
          id: key,
          name: value.name,
          shortname: value.shortname,
          weight: ['0', '15', '34'].includes(key) ? 0 : 2
        })
      })
      newStats.push({
        id: 'week',
        name: 'Current Week',
        shortname: 'WEEK',
        weight: 0
      })
      newStats.push({
        id: 'next',
        name: 'Next Week',
        shortname: 'NEXT',
        weight: 0
      })
      setStats(newStats)
    }
  }, [players, leagueStats])

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

  useEffect(() => {
    if (playerList) {
      const pageItems = []
      for (let i = 0; i < pages; i++) {
        pageItems.push(
          <Pagination.Item
            key={i}
            active={i === page}
            onClick={() => setPage(i)}
          >
            {i + 1}
          </Pagination.Item>
        )
        setPageItems(pageItems)
        setFilteredPlayers(playerList.slice(page * 25, (page + 1) * 25))
      }
    }
  }, [page, pages, playerList])

  const changeWeight = (id) => {
    const newStat = stats.find((stat) => stat.id === id)
    newStat.weight = (newStat.weight + 1) % weights.length
    const newStats = stats.map((stat) => (stat.id === id ? newStat : stat))
    setStats(newStats)
  }

  const prioritizeCurrent = () => {
    const newStats = stats.map((stat) => {
      let weight = 2
      if (loggedIn) {
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
        } else if (
          stat.id === weekWeight[2].id ||
          stat.id === weekWeight[3].id
        ) {
          weight = 3
        } else if (
          stat.id === weekWeight[weekWeight.length - 3].id ||
          stat.id === weekWeight[weekWeight.length - 4].id
        ) {
          weight = 1
        }
      } else {
        if (stat.id === 'week') {
          weight = 4
        } else if (stat.id === 'next') {
          weight = 0
        } else {
          weight = stat.weight
        }
      }
      return { ...stat, weight: weight }
    })

    setStats(newStats)
  }

  const prioritizeNext = () => {
    const newStats = stats.map((stat) => {
      let weight = 2
      if (loggedIn) {
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
        } else if (
          stat.id === nextWeight[2].id ||
          stat.id === nextWeight[3].id
        ) {
          weight = 3
        } else if (
          stat.id === nextWeight[nextWeight.length - 3].id ||
          stat.id === nextWeight[nextWeight.length - 4].id
        ) {
          weight = 1
        }
      } else {
        if (stat.id === 'next') {
          weight = 4
        } else if (stat.id === 'week') {
          weight = 0
        } else {
          weight = stat.weight
        }
      }
      return { ...stat, weight: weight }
    })

    setStats(newStats)
  }

  const handleClear = () => {
    const newStats = stats.map((stat) => {
      let weight = 2
      if (
        stat.id === 'next' ||
        stat.id === 'week' ||
        stat.id === '0' ||
        stat.id === '15' ||
        stat.id === '34'
      ) {
        weight = 0
      }
      return { ...stat, weight: weight }
    })

    setStats(newStats)
  }

  if (!filteredPlayers || !stats) return <Loading />
  return (
    <div>
      <Form className="player-filters">
        <h4>Filters</h4>
        {loggedIn && (
          <>
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
          </>
        )}
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
          {!loggedIn && (
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
          )}
        </div>
      </Form>

      {!loggedIn && (
        <Login
          setTeamKey={setTeamKey}
          setLeagueKey={setLeagueKey}
          setHelpScreen={setHelpScreen}
        />
      )}

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
                {stat.shortname}
              </th>
            ))}
            <th>VAL</th>
          </tr>
        </thead>
        <tbody>
          {filteredPlayers.map((player, i) => (
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
                  {player.positions?.toString()} ({player.team})
                </td>
              </tr>
              <tr
                className={
                  player.ownership?.owner_team_key === teamKey ? 'my-team' : ''
                }
              >
                <td className="desktop">{player.rank}</td>
                <td className="desktop">{player.name}</td>
                <td className="desktop">{player.positions?.toString()}</td>
                <td className="desktop">{player.team}</td>
                {Object.entries(player.stats).map(([key, stat]) => (
                  <td key={key}>
                    {stat.stat_id === '34'
                      ? utils.displayTOI(stat.value || 0)
                      : parseFloat(stat.value || 0).toFixed(
                          stat.stat_id === '15' ? 2 : 0
                        )}
                  </td>
                ))}
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </Table>
      <Pagination>{pageItems}</Pagination>
    </div>
  )
}

export default Players
