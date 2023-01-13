import Table from 'react-bootstrap/Table'
import { ArrowLeftCircle, ArrowRightCircle } from 'react-bootstrap-icons'
import { useEffect, useState } from 'react'
import getStats from '../functions/getStats'
import matchupFunctions from '../functions/matchup'
const Matchup = ({
  teamStats,
  oppStats,
  league,
  week,
  setWeek,
  matchup,
  currentWeek,
  teamRoster,
  oppRoster,
  schedule
}) => {
  const [stats, setStats] = useState(null)

  const changeWeek = (x) => {
    if (week + x > 0 && week + x < matchup.matchups.length + 1) {
      setWeek(week + x)
    }
  }

  useEffect(() => {
    const loadStats = async () => {
      const stats = await getStats(
        league,
        teamStats,
        oppStats,
        teamRoster,
        oppRoster,
        schedule
      )
      setStats(stats)
    }
    if (league && teamStats && oppStats && teamRoster && oppRoster && schedule)
      loadStats()
  }, [league, teamRoster, oppRoster, schedule, teamStats, oppStats])

  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.keyCode === 37) changeWeek(-1)
      else if (event.keyCode === 39) changeWeek(1)
    }
    window.addEventListener('keydown', handleKeydown)

    return () => {
      window.removeEventListener('keydown', handleKeydown)
    }
  })

  if (!stats) return <div className="matchup"></div>
  console.log(stats)
  return (
    <div className="matchup">
      <div className="header">
        <ArrowLeftCircle
          onClick={() => changeWeek(-1)}
          className={week === 1 ? 'disabled' : undefined}
        />
        <h2>Week {week}</h2>
        <ArrowRightCircle
          onClick={() => changeWeek(1)}
          className={week === matchup.matchups.length ? 'disabled' : undefined}
        />
      </div>

      <Table bordered hover>
        <thead>
          <tr>
            <th>{teamStats.name}</th>
            <th>Category</th>
            <th>{oppStats.name}</th>
          </tr>
        </thead>
        <tbody>
          {stats.map(
            (cat) =>
              !cat.hidden && (
                <tr key={cat.id}>
                  <td
                    style={{
                      background: matchupFunctions.valueToColor(
                        cat.teamPredicted,
                        cat.oppPredicted,
                        cat.id
                      )
                    }}
                  >
                    {cat.id === 26
                      ? cat.teamPredicted.toFixed(3).replace('0.', '.')
                      : cat.teamPredicted.toFixed(2)}
                    <span className="avg">
                      {matchupFunctions.getAvg(cat, cat.teamStat, currentWeek)}
                    </span>
                  </td>
                  <td>
                    <strong> {cat.name} </strong>
                  </td>
                  <td
                    style={{
                      background: matchupFunctions.valueToColor(
                        cat.oppPredicted,
                        cat.teamPredicted,
                        cat.id
                      )
                    }}
                  >
                    {cat.id === 26
                      ? cat.oppPredicted.toFixed(3).replace('0.', '.')
                      : cat.oppPredicted.toFixed(2)}
                    <span className="avg">
                      {matchupFunctions.getAvg(cat, cat.oppStat, currentWeek)}
                    </span>
                  </td>
                </tr>
              )
          )}
        </tbody>
      </Table>
    </div>
  )
}

export default Matchup
