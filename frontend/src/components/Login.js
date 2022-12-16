import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import axios from 'axios'
import { TrophyFill } from 'react-bootstrap-icons'
import { MdSportsHockey } from 'react-icons/md'

const Login = ({ auth, setAuth, setTeamKey, setLeagueKey, setHelpScreen }) => {
  const [teams, setTeams] = useState(null)

  const onClickLogin = () => {
    window.location.replace('/auth/yahoo')
  }

  const setTeam = (team) => {
    setLeagueKey(team.team_key.split('.').slice(0, 3).join('.'))
    setTeamKey(team.team_key)
    localStorage.setItem('team', JSON.stringify(team))
  }

  const displayHelp = (e) => {
    e.preventDefault()
    setHelpScreen(true)
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
        <div className="loginBox">
          <h1>Fantasy Hockey Helper</h1>
          <Button variant="primary" onClick={onClickLogin} className="btn-lg">
            <TrophyFill /> Log in to Yahoo!
          </Button>
          <MdSportsHockey className="icon" />
          <p>
            A tool for analyzing your weekly matchups in Yahoo! head-to-head
            leagues. Login with Yahoo! to continue or{' '}
            <a href="/" onClick={(e) => displayHelp(e)}>
              click here to learn more
            </a>
            .
          </p>
        </div>
      </div>
    )
  }

  if (auth && teams) {
    const teamsList = teams['teams']
      .flatMap((league) => (league.code === 'nhl' ? league.teams : []))
      .filter((team) => team.league_scoring_type.includes('head'))
    if (teamsList.length) {
      return (
        <div className="login">
          <Card>
            <h2>Select Your Team</h2>
            {teamsList.map((team) => (
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
        </div>
      )
    } else {
      return (
        <Card>
          <h2>Select Your Team</h2>
          <p>
            Sorry, no supported teams found. This app currently only works with
            Fantasy Hockey leagues which use head-to-head matchups.
          </p>
        </Card>
      )
    }
  }
}

export default Login
