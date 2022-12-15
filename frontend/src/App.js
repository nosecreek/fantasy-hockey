import { useEffect, useState } from 'react'
import axios from 'axios'
import Matchup from './components/Matchup'
import Login from './components/Login'
import Loading from './components/Loading'
import Footer from './components/Footer'

const App = () => {
  const [auth, setAuth] = useState(null)
  const [teamKey, setTeamKey] = useState(null)
  const [leagueKey, setLeagueKey] = useState(null)
  const [league, setLeague] = useState(null)
  const [teamStats, setTeamStats] = useState(null)
  const [oppStats, setOppStats] = useState(null)
  const [matchup, setMatchup] = useState(null)
  const [week, setWeek] = useState(null)
  const [currentWeek, setCurrentWeek] = useState(null)

  useEffect(() => {
    const loadLeagueInfo = async () => {
      try {
        const result = await axios.post('/api/league', {
          leagueKey: leagueKey
        })
        setLeague(result.data)
        setWeek(parseInt(result.data.current_week))
        setCurrentWeek(parseInt(result.data.current_week))
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
        const result = await axios.post('/api/matchup', {
          teamKey: teamKey
        })
        setMatchup(result.data)
      } catch (e) {
        console.log(e)
      }
    }

    if (teamKey) {
      loadMatchup()
    }
  }, [teamKey])

  useEffect(() => {
    const loadStats = async () => {
      try {
        const result = await axios.post('/api/teamstats', {
          teamKey: teamKey
        })
        setTeamStats(result.data)
      } catch (e) {
        console.log(e)
      }
      try {
        const result = await axios.post('/api/teamstats', {
          teamKey: matchup.matchups[week - 1].teams[1].team_key
        })
        setOppStats(result.data)
      } catch (e) {
        console.log(e)
      }
    }

    if (matchup && teamKey) {
      loadStats()
    }
  }, [matchup, week, teamKey])

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
          oppStats.team_key === matchup.matchups[week - 1].teams[1].team_key
        ) && <Loading />}
        <Matchup
          teamStats={teamStats}
          oppStats={oppStats}
          league={league}
          week={week}
          setWeek={setWeek}
          matchup={matchup}
          currentWeek={currentWeek}
        />
        <Footer />
      </div>
    )
  } catch {
    return <Loading />
  }
}

export default App
