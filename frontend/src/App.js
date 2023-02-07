import { useEffect, useState } from 'react'
import axios from 'axios'
import Matchup from './components/Matchup'
import Login from './components/Login'
import Loading from './components/Loading'
import Footer from './components/Footer'
import Help from './components/Help'
import getStats from './functions/getStats'
import Players from './components/Players'

const App = () => {
  const [teamKey, setTeamKey] = useState(null)
  const [leagueKey, setLeagueKey] = useState(null)
  const [league, setLeague] = useState(null)
  const [stats, setStats] = useState(null)
  const [teamStats, setTeamStats] = useState(null)
  const [oppStats, setOppStats] = useState(null)
  const [teamRoster, setTeamRoster] = useState(null)
  const [matchup, setMatchup] = useState(null)
  const [week, setWeek] = useState(null)
  const [currentWeek, setCurrentWeek] = useState(null)
  const [helpScreen, setHelpScreen] = useState(false)
  const [lastMonthSchedule, setLastMonthSchedule] = useState(null)
  const [players, setPlayers] = useState(null)

  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
    .toISOString()
    .split('T')[0]
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toISOString()
    .split('T')[0]

  useEffect(() => {
    const loadLeagueInfo = async () => {
      try {
        const [league, schedule, players] = await Promise.all([
          axios.post('/api/league', {
            leagueKey: leagueKey
          }),
          axios.get(
            `https://statsapi.web.nhl.com/api/v1/schedule?startDate=${lastMonth}&endDate=${yesterday}`
          ),
          await axios.post('/api/players', {
            leagueKey: leagueKey
          })
        ])
        setLeague(league.data)
        setWeek(parseInt(league.data.current_week))
        setCurrentWeek(parseInt(league.data.current_week))
        setLastMonthSchedule(schedule.data)
        setPlayers(players.data)
      } catch (e) {}
    }

    if (leagueKey) {
      loadLeagueInfo()
    }
  }, [lastMonth, leagueKey, yesterday])

  useEffect(() => {
    //Load team stats
    const getTeamStats = async () => {
      const result = await axios.post('/api/teamstats', {
        teamKey: teamKey
      })
      setTeamStats(result.data)
    }
    if (teamKey && !teamStats) getTeamStats()
  }, [teamKey, teamStats])

  useEffect(() => {
    //Load team roster
    const getRosters = async () => {
      const result = await axios.post('/api/rosters', {
        teamKeys: [teamKey]
      })
      setTeamRoster(result.data.team)
    }
    if (teamKey && !teamRoster) getRosters()
  }, [teamKey, teamRoster])

  useEffect(() => {
    //Load matchup information
    const loadMatchup = async () => {
      try {
        const result = await axios.post('/api/matchup', {
          teamKey: teamKey
        })
        setMatchup(result.data)
      } catch (e) {}
    }

    if (teamKey) {
      loadMatchup()
    }
  }, [teamKey])

  useEffect(() => {
    const loadStats = async () => {
      //Get Matchup Stats
      const [stats, oppStats] = await getStats(
        teamStats,
        teamRoster,
        league,
        lastMonthSchedule,
        matchup,
        week
      )

      //Set State
      setStats(stats)
      setOppStats(oppStats)
    }

    if (
      matchup &&
      week &&
      teamKey &&
      league &&
      lastMonthSchedule &&
      teamStats &&
      teamRoster
    )
      loadStats()
  }, [lastMonthSchedule, league, matchup, teamKey, teamRoster, teamStats, week])

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
    if (new URL(document.location).searchParams.has('players'))
      return <Players players={players} leagueStats={stats} />

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
