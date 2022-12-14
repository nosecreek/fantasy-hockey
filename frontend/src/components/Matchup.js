import Table from 'react-bootstrap/Table'
import Color from 'colorjs.io'
import { ArrowLeftCircle, ArrowRightCircle } from 'react-bootstrap-icons'
import { useEffect } from 'react'

const Matchup = ({
  teamStats,
  oppStats,
  league,
  week,
  setWeek,
  matchup,
  currentWeek
}) => {
  const c1 = new Color('red')
  const c2 = new Color('p3', [0, 1, 0])
  const range = c1.range(c2, { space: 'hsl' })

  const valueToColor = (stat, other, id) => {
    let x = parseFloat(stat) / (parseFloat(stat) + parseFloat(other))

    //custom calculation for plus/minus
    if (id === 4) {
      let offset = Math.min(parseInt(stat), parseInt(other))
      offset = offset < 0 ? Math.abs(offset) + 20 : 20
      x =
        (parseFloat(stat) + offset) /
        (parseFloat(stat) + parseFloat(other) + offset * 2)
    }

    //intensify colors for Save %
    if (id === 26) {
      x = x < 0.5 ? x * 0.95 : x * 1.05
    }

    x = id === 23 ? 1 - x : x //switch colors for GAA

    x *= 0.915 //offset to set equal stats to yellow

    return range(x)
  }

  const changeWeek = (x) => {
    if (week + x > 0 && week + x < matchup.matchups.length + 1) {
      setWeek(week + x)
    }
    console.log(x)
  }

  const values = league.settings.stat_categories.map((cat) => ({
    id: cat.stat_id,
    teamStat: teamStats.stats.find(
      (s) => parseInt(s.stat_id) === parseInt(cat.stat_id)
    ).value,
    name: cat.name,
    oppStat: oppStats.stats.find(
      (s) => parseInt(s.stat_id) === parseInt(cat.stat_id)
    ).value,
    is_only_display_stat: cat.is_only_display_stat || false
  }))

  const getAvg = (cat, stat) => {
    if (cat.id === 26 || cat.id === 23) return stat
    const dayofweek = new Date().getDay()
    const dayoffset = dayofweek === 6 ? 0 : (dayofweek + 1) / 7
    return (stat / (currentWeek - 1 + dayoffset)).toFixed(2)
  }

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
          {values.map(
            (cat) =>
              !cat.is_only_display_stat && (
                <tr key={cat.id}>
                  <td
                    style={{
                      background: valueToColor(
                        cat.teamStat,
                        cat.oppStat,
                        cat.id
                      )
                    }}
                  >
                    {cat.teamStat}
                    <span className="avg">{getAvg(cat, cat.teamStat)}</span>
                  </td>
                  <td>
                    <strong> {cat.name} </strong>
                  </td>
                  <td
                    style={{
                      background: valueToColor(
                        cat.oppStat,
                        cat.teamStat,
                        cat.id
                      )
                    }}
                  >
                    {cat.oppStat}
                    <span className="avg">{getAvg(cat, cat.oppStat)}</span>
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
