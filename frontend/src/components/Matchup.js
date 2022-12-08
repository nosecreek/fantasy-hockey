import Table from 'react-bootstrap/Table'

const Matchup = ({ teamStats, oppStats, league }) => {
  return (
    <Table bordered hover>
      <thead>
        <tr striped>
          <th>{teamStats.name}</th>
          <th>Category</th>
          <th>{oppStats.name}</th>
        </tr>
      </thead>
      <tbody>
        {league.settings.stat_categories.map(
          (cat) =>
            !cat.is_only_display_stat && (
              <tr key={cat.stat_id}>
                <td>
                  {
                    teamStats.stats.find(
                      (s) => parseInt(s.stat_id) === parseInt(cat.stat_id)
                    ).value
                  }
                </td>
                <td>
                  <strong> {cat.name} </strong>
                </td>
                <td>
                  {
                    oppStats.stats.find(
                      (s) => parseInt(s.stat_id) === parseInt(cat.stat_id)
                    ).value
                  }
                </td>
              </tr>
            )
        )}
      </tbody>
    </Table>
  )
}

export default Matchup
