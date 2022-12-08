import Table from 'react-bootstrap/Table'
import Color from 'colorjs.io'

const Matchup = ({ teamStats, oppStats, league }) => {
  const c1 = new Color('red')
  const c2 = new Color('p3', [0, 1, 0])
  const range = c1.range(c2, { space: 'hsl' })

  const valueToColor = (stat, other, id) => {
    let x = (parseFloat(stat) / (parseFloat(stat) + parseFloat(other))) * 0.915
    x = id === 4 || id === 23 ? 1 - x : x //switch colors for +/- and GAA
    return range(x)
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
                    background: valueToColor(cat.teamStat, cat.oppStat, cat.id)
                  }}
                >
                  {cat.teamStat}
                </td>
                <td>
                  <strong> {cat.name} </strong>
                </td>
                <td
                  style={{
                    background: valueToColor(cat.oppStat, cat.teamStat, cat.id)
                  }}
                >
                  {cat.oppStat}
                </td>
              </tr>
            )
        )}
      </tbody>
    </Table>
  )
}

export default Matchup
