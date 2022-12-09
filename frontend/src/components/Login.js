import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import axios from 'axios'

const Login = ({ auth, setAuth, setTeamKey, setLeagueKey }) => {
  const [teams, setTeams] = useState(null)

  const onClickLogin = () => {
    window.location.replace('https://localhost:3003/auth/yahoo')
  }

  const setTeam = (team) => {
    setLeagueKey(team.team_key.split('.').slice(0, 3).join('.'))
    setTeamKey(team.team_key)
  }

  useEffect(() => {
    const testAuth = async () => {
      try {
        const result = await axios.get('https://localhost:3003/api/team')
        setTeams(result.data)
        setAuth(true)
      } catch (e) {
        setAuth(false)
      }
    }
    if (auth === null) {
      testAuth()
    }
  }, [auth, setAuth])

  if (auth === false) {
    return (
      <div class="login">
        <Button variant="primary" onClick={onClickLogin} className="btn-lg">
          Log in to Yahoo!
        </Button>
      </div>
    )
  }

  if (auth && teams) {
    return (
      <Card>
        <h2>Select Your Team</h2>
        {teams['teams'][0]['teams'].map((team) => (
          <div onClick={() => setTeam(team)} key={team.team_key}>
            <h3>{team.name}</h3>
            <img
              src={team['team_logos'][0].url}
              alt="Team Logo"
              className="rounded-circle"
            />
          </div>
        ))}
      </Card>
    )
  }
}

export default Login
