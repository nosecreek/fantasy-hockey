import { useEffect, useState } from 'react'
import axios from 'axios'
import Matchup from './components/Matchup'
import Login from './components/Login'
import Loading from './components/Loading'
import Footer from './components/Footer'
import Help from './components/Help'
import getStats from './functions/getStats'

const App = () => {
  const [teamKey, setTeamKey] = useState(null)
  const [leagueKey, setLeagueKey] = useState(null)
  const [league, setLeague] = useState(null)
  const [stats, setStats] = useState(null)
  const [teamStats, setTeamStats] = useState(null)
  const [oppStats, setOppStats] = useState(null)
  // const [teamRoster, setTeamRoster] = useState(null)
  const [matchup, setMatchup] = useState(null)
  const [week, setWeek] = useState(null)
  const [currentWeek, setCurrentWeek] = useState(null)
  const [helpScreen, setHelpScreen] = useState(false)

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
      //Load team stats
      let teamStats
      try {
        const result = await axios.post('/api/teamstats', {
          teamKey: teamKey
        })
        teamStats = result.data
      } catch (e) {
        console.log(e)
      }

      //Load opponent stats
      let oppStats
      try {
        const result = await axios.post('/api/teamstats', {
          teamKey: matchup.matchups[week - 1].teams[1].team_key
        })
        oppStats = result.data
      } catch (e) {
        console.log(e)
      }

      //Get Matchup Stats
      const stats = await getStats(
        matchup,
        week,
        teamKey,
        teamStats,
        oppStats,
        league
      )
      setStats(stats)
      setTeamStats(teamStats)
      setOppStats(oppStats)
    }

    if (matchup && week && teamKey && league) loadStats()
  }, [matchup, week, teamKey, league])

  if (helpScreen) return <Help setHelpScreen={setHelpScreen} />

  if (!teamKey)
    return (
      <Login
        setTeamKey={setTeamKey}
        setLeagueKey={setLeagueKey}
        setHelpScreen={setHelpScreen}
      />
    )

  try {
    console.log(oppStats.team_key, matchup.matchups[week - 1].teams[1].team_key)
    return (
      <div>
        {!(
          oppStats.team_key === matchup.matchups[week - 1].teams[1].team_key
        ) && <Loading />}
        <Matchup
          teamStats={teamStats}
          oppStats={oppStats}
          week={week}
          setWeek={setWeek}
          matchup={matchup}
          currentWeek={currentWeek}
          stats={stats}
        />
        <Footer setHelpScreen={setHelpScreen} />
      </div>
    )
  } catch (e) {
    return <Loading />
  }
}

export default App
