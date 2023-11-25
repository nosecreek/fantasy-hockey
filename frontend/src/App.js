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
  const [teamRoster, setTeamRoster] = useState(null)
  const [matchup, setMatchup] = useState(null)
  const [week, setWeek] = useState(null)
  const [currentWeek, setCurrentWeek] = useState(null)
  const [helpScreen, setHelpScreen] = useState(false)
  const [lastMonthSchedule, setLastMonthSchedule] = useState(null)

  const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
    .toISOString()
    .split('T')[0]
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toISOString()
    .split('T')[0]

  useEffect(() => {
    const loadLeagueInfo = async () => {
      try {
        const week2 = new Date(
          new Date(lastMonth).setDate(new Date(lastMonth).getDate() + 7)
        )
          .toISOString()
          .split('T')[0]
        const week3 = new Date(
          new Date(lastMonth).setDate(new Date(lastMonth).getDate() + 14)
        )
          .toISOString()
          .split('T')[0]
        const week4 = new Date(
          new Date(lastMonth).setDate(new Date(lastMonth).getDate() + 21)
        )
          .toISOString()
          .split('T')[0]
        const week5 = new Date(
          new Date(lastMonth).setDate(new Date(lastMonth).getDate() + 28)
        )
          .toISOString()
          .split('T')[0]
        const [league, schedule1, schedule2, schedule3, schedule4, schedule5] =
          await Promise.all([
            axios.post('/api/league', {
              leagueKey: leagueKey
            }),
            axios.get(`/api/nhlschedule/${lastMonth}`),
            axios.get(`/api/nhlschedule/${week2}`),
            axios.get(`/api/nhlschedule/${week3}`),
            axios.get(`/api/nhlschedule/${week4}`),
            axios.get(`/api/nhlschedule/${week5}`)
          ])
        setLeague(league.data)
        setWeek(parseInt(league.data.current_week))
        setCurrentWeek(parseInt(league.data.current_week))
        setLastMonthSchedule([
          ...schedule1.data.gameWeek,
          ...schedule2.data.gameWeek,
          ...schedule3.data.gameWeek,
          ...schedule4.data.gameWeek,
          ...schedule5.data.gameWeek.filter(
            (day) =>
              new Date(day.date).getTime() <=
              new Date(matchup.matchups[week - 1].week_end).getTime()
          )
        ])
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

  if (!teamStats || !oppStats || !week || !matchup || !currentWeek || !stats)
    return <Loading />
  try {
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
    console.log(e)
    return <Loading />
  }
}

export default App
