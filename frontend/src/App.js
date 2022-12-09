import { useEffect, useState } from 'react'
import axios from 'axios'
import Matchup from './components/Matchup'
import Login from './components/Login'
import Loading from './components/Loading'

const App = () => {
  const [auth, setAuth] = useState(null)
  const [teamKey, setTeamKey] = useState(null)
  const [leagueKey, setLeagueKey] = useState(null)
  const [league, setLeague] = useState(null)
  const [teamStats, setTeamStats] = useState(null)
  const [oppStats, setOppStats] = useState(null)
  const [matchup, setMatchup] = useState(null)
  const [week, setWeek] = useState(null)

  useEffect(() => {
    const loadLeagueInfo = async () => {
      try {
        const result = await axios.post('https://localhost:3003/api/league', {
          leagueKey: leagueKey
        })
        setLeague(result.data)
        setWeek(result.data.current_week)
      } catch (e) {
        console.log(e)
      }
    }

    if (leagueKey) {
      loadLeagueInfo()
    }
  }, [leagueKey])

  useEffect(() => {
    const loadMatchup = async () => {
      try {
        const result = await axios.post('https://localhost:3003/api/matchup', {
          teamKey: teamKey,
          week: week
        })
        setMatchup(result.data)
      } catch (e) {
        console.log(e)
      }
    }

    if (teamKey && week) {
      loadMatchup()
    }
  }, [teamKey, week])

  useEffect(() => {
    const loadStats = async () => {
      try {
        const result = await axios.post(
          'https://localhost:3003/api/teamstats',
          {
            teamKey: teamKey
          }
        )
        setTeamStats(result.data)
      } catch (e) {
        console.log(e)
      }
      try {
        const result = await axios.post(
          'https://localhost:3003/api/teamstats',
          {
            teamKey: matchup.matchups[0].teams[1].team_key
          }
        )
        setOppStats(result.data)
      } catch (e) {
        console.log(e)
      }
    }

    if (matchup && teamKey) {
      loadStats()
    }
  }, [matchup, teamKey])

  if (!teamKey)
    return (
      <Login
        auth={auth}
        setAuth={setAuth}
        setTeamKey={setTeamKey}
        setLeagueKey={setLeagueKey}
      />
    )

  try {
    return (
      <div>
        {!(
          parseInt(matchup.matchups[0].week) === parseInt(week) &&
          oppStats.team_key === matchup.matchups[0].teams[1].team_key
        ) && <Loading />}
        <Matchup
          teamStats={teamStats}
          oppStats={oppStats}
          league={league}
          week={week}
          setWeek={setWeek}
        />
      </div>
    )
  } catch {
    return <Loading />
  }
}

export default App
