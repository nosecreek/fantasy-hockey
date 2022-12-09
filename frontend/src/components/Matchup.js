import Table from 'react-bootstrap/Table'
import Color from 'colorjs.io'
import { ArrowLeftCircle, ArrowRightCircle } from 'react-bootstrap-icons'

const Matchup = ({ teamStats, oppStats, league, week, setWeek, matchup }) => {
  const c1 = new Color('red')
  const c2 = new Color('p3', [0, 1, 0])
  const range = c1.range(c2, { space: 'hsl' })

  const valueToColor = (stat, other, id) => {
    let x = (parseFloat(stat) / (parseFloat(stat) + parseFloat(other))) * 0.915

    //custom calculation for plus/minus
    if (id === 4) {
      let offset = Math.min(parseInt(stat), parseInt(other))
      offset = offset < 0 ? Math.abs(offset) + 20 : 20
      x =
        ((parseFloat(stat) + offset) /
          (parseFloat(stat) + parseFloat(other) + offset * 2)) *
        0.915
    }

    x = id === 23 ? 1 - x : x //switch colors for GAA
    return range(x)
  }

  const changeWeek = (x) => {
    if (week + x > 0 && week + x < matchup.matchups.length + 1) {
      setWeek(week + x)
    }
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
