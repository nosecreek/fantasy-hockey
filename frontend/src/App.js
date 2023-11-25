import { useEffect, useState } from 'react'
import axios from 'axios'
import Matchup from './components/Matchup'
import Login from './components/Login'
import Loading from './components/Loading'
import Footer from './components/Footer'
import Help from './components/Help'
import getStats from './functions/getStats'
import Players from './components/Players'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import playerMapping from './functions/playerMapping'

const App = () => {
  const [teamKey, setTeamKey] = useState(null)
  const [leagueKey, setLeagueKey] = useState(null)
  const [league, setLeague] = useState(null)
  const [stats, setStats] = useState(null)
  const [weekStats, setWeekStats] = useState(null)
  const [nextStats, setNextStats] = useState(null)
  const [teamStats, setTeamStats] = useState(null)
  const [oppStats, setOppStats] = useState(null)
  const [teamRoster, setTeamRoster] = useState(null)
  const [matchup, setMatchup] = useState(null)
  const [week, setWeek] = useState(null)
  const [currentWeek, setCurrentWeek] = useState(null)
  const [weekSchedule, setWeekSchedule] = useState(null)
  const [nextSchedule, setNextSchedule] = useState(null)
  const [helpScreen, setHelpScreen] = useState(false)
  const [lastMonthSchedule, setLastMonthSchedule] = useState(null)
  const [players, setPlayers] = useState(null)

  //EST Time
  const tZone = new Date(new Date().getTime() - 5 * 3600000)
  const today = tZone.toISOString().split('T')[0]
  const yesterday = new Date(tZone.setDate(new Date().getDate() - 1))
    .toISOString()
    .split('T')[0]
  const lastMonth = new Date(tZone.setMonth(new Date().getMonth() - 1))
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
        setPlayers(playerMapping.mapNHLtoYahoo(players.data))
      } catch (e) {
        console.log(e)
      }
    }

    if (leagueKey) {
      loadLeagueInfo()
    }
  }, [lastMonth, leagueKey, yesterday])

  useEffect(() => {
    //Load team stats
    const getTeamStats = async () => {
      let nextWeekStart = new Date(matchup.matchups[currentWeek - 1].week_end)
      nextWeekStart.setDate(nextWeekStart.getDate() + 1)
      nextWeekStart = nextWeekStart.toISOString().split('T')[0]
      let nextWeekEnd = new Date(matchup.matchups[currentWeek - 1].week_end)
      nextWeekEnd.setDate(nextWeekEnd.getDate() + 7)
      nextWeekEnd = nextWeekEnd.toISOString().split('T')[0]

      const [stats, weekSchedule, nextSchedule] = await Promise.all([
        axios.post('/api/teamstats', {
          teamKey: teamKey
        }),
        axios.get(
          `https://statsapi.web.nhl.com/api/v1/schedule?startDate=${today}&endDate=${
            matchup.matchups[currentWeek - 1].week_end
          }`
        ),
        axios.get(
          `https://statsapi.web.nhl.com/api/v1/schedule?startDate=${
            matchup?.matchups?.[currentWeek]?.week_start
              ? matchup?.matchups?.[currentWeek]?.week_start
              : nextWeekStart
          }&endDate=${
            matchup?.matchups[currentWeek]?.week_end
              ? matchup.matchups[currentWeek].week_end
              : nextWeekEnd
          }`
        )
      ])

      //exclude today's game that have already started
      const filteredWeekSchedule = weekSchedule.data
      filteredWeekSchedule.dates[0].games =
        filteredWeekSchedule.dates[0].games.filter(
          (game) => new Date(game.gameDate).getTime() >= new Date().getTime()
        )
      setTeamStats(stats.data)
      setWeekSchedule(filteredWeekSchedule)
      setNextSchedule(nextSchedule.data)
    }
    if (teamKey && matchup && currentWeek && !teamStats) getTeamStats()
  }, [currentWeek, matchup, teamKey, teamStats, today])

  useEffect(() => {
    //Load team roster and nhl schedule for this week/next week
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
        week,
        currentWeek,
        weekSchedule,
        nextSchedule,
        weekStats,
        nextStats
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
      teamRoster &&
      currentWeek &&
      weekSchedule &&
      nextSchedule &&
      weekStats &&
      nextStats
    )
      loadStats()
  }, [
    currentWeek,
    lastMonthSchedule,
    league,
    matchup,
    nextSchedule,
    nextStats,
    teamKey,
    teamRoster,
    teamStats,
    week,
    weekSchedule,
    weekStats
  ])

  useEffect(() => {
    const loadWeekNextStats = async () => {
      try {
        //Get Current and Next Matchup Stats
        const [weekStats, nextStats] = await Promise.all([
          getStats(
            teamStats,
            teamRoster,
            league,
            lastMonthSchedule,
            matchup,
            currentWeek,
            currentWeek,
            weekSchedule,
            nextSchedule
          ),
          getStats(
            teamStats,
            teamRoster,
            league,
            lastMonthSchedule,
            matchup,
            currentWeek,
            currentWeek + 1,
            weekSchedule,
            nextSchedule
          )
        ])
        //Set State
        setWeekStats(weekStats[0])
        setNextStats(nextStats[0])
      } catch (e) {}
    }

    if (
      matchup &&
      teamKey &&
      league &&
      lastMonthSchedule &&
      teamStats &&
      teamRoster &&
      currentWeek &&
      weekSchedule &&
      nextSchedule
    )
      loadWeekNextStats()
  }, [
    currentWeek,
    lastMonthSchedule,
    league,
    matchup,
    nextSchedule,
    teamKey,
    teamRoster,
    teamStats,
    weekSchedule
  ])

  if (helpScreen)
    return <Help setHelpScreen={setHelpScreen} helpScreen={true} />

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
      <>
        <Tabs justify defaultActiveKey="matchup" className="tab-menu">
          <Tab eventKey="matchup" title="Matchups">
            <div>
              {!(
                oppStats.team_key ===
                matchup.matchups[week - 1].teams[1].team_key
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
            </div>
          </Tab>
          <Tab eventKey="players" title="Players">
            <Players
              players={players}
              leagueStats={stats}
              teamKey={teamKey}
              weekSchedule={weekSchedule}
              nextSchedule={nextSchedule}
              weekStats={weekStats}
              nextStats={nextStats}
            />
          </Tab>
          <Tab eventKey="help" title="Help">
            <Help helpScreen={false} />
          </Tab>
        </Tabs>
        <Footer />
      </>
    )
  } catch (e) {
    console.log(e)
    return <Loading />
  }
}

export default App
