import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import axios from 'axios'
import { TrophyFill } from 'react-bootstrap-icons'

const Login = ({ auth, setAuth, setTeamKey, setLeagueKey }) => {
  const [teams, setTeams] = useState(null)

  const onClickLogin = () => {
    window.location.replace('/auth/yahoo')
  }

  const setTeam = (team) => {
    setLeagueKey(team.team_key.split('.').slice(0, 3).join('.'))
    setTeamKey(team.team_key)
    localStorage.setItem('team', JSON.stringify(team))
  }

  useEffect(() => {
    const testAuth = async () => {
      if (document.cookie.indexOf('loggedIn') === -1) {
        localStorage.removeItem('team')
        setAuth(false)
      } else {
        try {
          const result = await axios.get('/api/team')
          setTeams(result.data)
          setAuth(true)
        } catch (e) {
          localStorage.removeItem('team')
          setAuth(false)
        }
      }
    }
    if (auth === null) {
      testAuth()
    }
  }, [auth, setAuth])

  useEffect(() => {
    if (auth && localStorage.getItem('team')) {
      setTeam(JSON.parse(localStorage.getItem('team')))
    }
  })

  if (auth === false) {
    return (
      <div className="login">
        <Button variant="primary" onClick={onClickLogin} className="btn-lg">
          <TrophyFill /> Log in to Yahoo!
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
