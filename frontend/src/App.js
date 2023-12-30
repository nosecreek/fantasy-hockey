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
    const getPlayerAndScheduleData = async () => {
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

      try {
        console.log('loading schedule data')
        let thisWeekStart = new Date(
          new Date().setDate(new Date().getDate() - new Date().getDay())
        )
        thisWeekStart = thisWeekStart.toISOString().split('T')[0]
        let nextWeekStart = new Date(
          new Date().setDate(new Date().getDate() - new Date().getDay() + 7)
        )
        nextWeekStart = nextWeekStart.toISOString().split('T')[0]
        let nextWeekEnd = new Date(nextWeekStart)
        nextWeekEnd.setDate(nextWeekEnd.getDate() + 7)
        nextWeekEnd = nextWeekEnd.toISOString().split('T')[0]
        let thisWeekEnd = new Date(nextWeekStart)
        thisWeekEnd.setDate(thisWeekEnd.getDate() - 1)
        thisWeekEnd = thisWeekEnd.toISOString().split('T')[0]

        const [
          players,
          bangers,
          schedule1,
          schedule2,
          schedule3,
          schedule4,
          schedule5,
          thisWeekSchedule,
          nextWeekSchedule
        ] = await Promise.all([
          axios.get('/api/nhlplayers'),
          axios.get('/api/nhlbangers'),
          axios.get(`/api/nhlschedule/${lastMonth}`),
          axios.get(`/api/nhlschedule/${week2}`),
          axios.get(`/api/nhlschedule/${week3}`),
          axios.get(`/api/nhlschedule/${week4}`),
          axios.get(`/api/nhlschedule/${week5}`),
          axios.get(`/api/nhlschedule/${thisWeekStart}`),
          axios.get(`/api/nhlschedule/${nextWeekStart}`)
        ])
        setPlayers(
          playerMapping.mapNHLtoYahoo([...players.data, ...bangers.data])
        )

        setLastMonthSchedule([
          ...schedule1.data.gameWeek,
          ...schedule2.data.gameWeek,
          ...schedule3.data.gameWeek,
          ...schedule4.data.gameWeek,
          ...schedule5.data.gameWeek.filter(
            (day) => new Date(day.date).getTime() <= new Date().getTime()
          )
        ])

        //exclude this week's games that have already started
        const filteredWeekSchedule = thisWeekSchedule.data.gameWeek.filter(
          (game) => new Date(game.date).getTime() <= new Date().getTime()
        )
        setWeekSchedule(filteredWeekSchedule)
        setNextSchedule(nextWeekSchedule.data.gameWeek)
      } catch (e) {
        console.log(e)
      }
    }

    if (
      !players
      // || !weekSchedule || !nextSchedule
    ) {
      getPlayerAndScheduleData()
    }
  }, [
    currentWeek,
    lastMonth,
    matchup,
    nextSchedule,
    players,
    today,
    weekSchedule
  ])

  useEffect(() => {
    const loadLeagueInfo = async () => {
      try {
        const [
          league
          // playersSummary,
          // playersMisc,
          // schedule1,
          // schedule2,
          // schedule3,
          // schedule4,
          // schedule5
        ] = await Promise.all([
          axios.post('/api/league', {
            leagueKey: leagueKey
          })
          // axios.get(
          //   'https://api.nhle.com/stats/rest/en/skater/summary?isAggregate=false&isGame=false&sort=%5B%7B%22property%22:%22points%22,%22direction%22:%22DESC%22%7D,%7B%22property%22:%22goals%22,%22direction%22:%22DESC%22%7D,%7B%22property%22:%22assists%22,%22direction%22:%22DESC%22%7D,%7B%22property%22:%22playerId%22,%22direction%22:%22ASC%22%7D%5D&start=0&limit=1000&factCayenneExp=gamesPlayed%3E=1&cayenneExp=gameTypeId=2%20and%20seasonId%3C=20232024%20and%20seasonId%3E=20232024'
          // ),
          // axios.get(
          //   'https://api.nhle.com/stats/rest/en/skater/realtime?isAggregate=false&isGame=false&sort=%5B%7B%22property%22:%22hits%22,%22direction%22:%22DESC%22%7D,%7B%22property%22:%22playerId%22,%22direction%22:%22ASC%22%7D%5D&start=0&limit=1000&factCayenneExp=gamesPlayed%3E=1&cayenneExp=gameTypeId=2%20and%20seasonId%3C=20232024%20and%20seasonId%3E=20232024'
          // ),
          // axios.get(`/api/nhlschedule/${lastMonth}`),
          // axios.get(`/api/nhlschedule/${week2}`),
          // axios.get(`/api/nhlschedule/${week3}`),
          // axios.get(`/api/nhlschedule/${week4}`),
          // axios.get(`/api/nhlschedule/${week5}`)
        ])
        setLeague(league.data)
        setWeek(parseInt(league.data.current_week))
        setCurrentWeek(parseInt(league.data.current_week))
        // setLastMonthSchedule([
        //   ...schedule1.data.gameWeek,
        //   ...schedule2.data.gameWeek,
        //   ...schedule3.data.gameWeek,
        //   ...schedule4.data.gameWeek,
        //   ...schedule5.data.gameWeek.filter(
        //     (day) =>
        //       new Date(day.date).getTime() <=
        //       new Date(matchup.matchups[week - 1].week_end).getTime()
        //   )
        // ])
        // setPlayers(
        //   playerMapping.mapNHLtoYahoo({
        //     ...playersSummary.data,
        //     ...playersMisc.data
        //   })
        // )
      } catch (e) {
        console.log(e)
      }
    }

    if (leagueKey && matchup?.matchups) {
      console.log('loading league info')
      loadLeagueInfo()
    }
  }, [leagueKey, matchup])

  useEffect(() => {
    //Load team stats
    const getTeamStats = async () => {
      const [stats] = await Promise.all([
        axios.post('/api/teamstats', {
          teamKey: teamKey
        })
      ])

      setTeamStats(stats.data)
    }
    if (teamKey && !teamStats) getTeamStats()
  }, [teamStats, teamKey])

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

  if (!teamKey && players && weekSchedule && nextSchedule) {
    return (
      <>
        <Players
          players={players}
          weekSchedule={weekSchedule}
          nextSchedule={nextSchedule}
          setTeamKey={setTeamKey}
          setLeagueKey={setLeagueKey}
          setHelpScreen={setHelpScreen}
          loggedIn={false}
        />
      </>
    )
  }

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
