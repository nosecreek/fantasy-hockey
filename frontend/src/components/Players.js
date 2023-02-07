import Table from 'react-bootstrap/Table'
import Loading from './Loading'

const Players = ({ players, stats }) => {
  if (!players || !stats) return <Loading />
  console.log(stats)
  return (
    <Table bordered hover>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Name</th>
          <th>Position</th>
          <th>Team</th>
          {stats.slice(0, players[0].stats.length - 1).map((stat) => (
            <th key={stat.id}>{stat.abbr}</th>
          ))}
          <th>VORP</th>
        </tr>
      </thead>
      <tbody>
        {players.map((player, i) => (
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
