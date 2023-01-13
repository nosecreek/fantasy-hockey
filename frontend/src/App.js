import { useEffect, useState } from 'react'
import axios from 'axios'
import Matchup from './components/Matchup'
import Login from './components/Login'
import Loading from './components/Loading'
import Footer from './components/Footer'
import Help from './components/Help'

const App = () => {
  const [teamKey, setTeamKey] = useState(null)
  const [leagueKey, setLeagueKey] = useState(null)
  const [league, setLeague] = useState(null)
  const [teamStats, setTeamStats] = useState(null)
  const [oppStats, setOppStats] = useState(null)
  const [teamRoster, setTeamRoster] = useState(null)
  const [oppRoster, setOppRoster] = useState(null)
  const [matchup, setMatchup] = useState(null)
  const [week, setWeek] = useState(null)
  const [currentWeek, setCurrentWeek] = useState(null)
  const [schedule, setSchedule] = useState(null)
  const [seasonStats, setSeasonStats] = useState()
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
      try {
        const result = await axios.post('/api/teamstats', {
          teamKey: teamKey
        })
        setTeamStats(result.data)
      } catch (e) {
        console.log(e)
      }

      //Load opponent stats
      try {
        const result = await axios.post('/api/teamstats', {
          teamKey: matchup.matchups[week - 1].teams[1].team_key
        })
        setOppStats(result.data)
      } catch (e) {
        console.log(e)
      }

      //Load team rosters
      try {
        const result = await axios.post('/api/rosters', {
          teamKeys: [teamKey, matchup.matchups[week - 1].teams[1].team_key]
        })
        setTeamRoster(result.data.team)
        setOppRoster(result.data.opp)
        console.log(result.data)
      } catch (e) {
        console.log(e)
      }

      //Load nhl schedule
      try {
        const result = await axios.get(
          `https://statsapi.web.nhl.com/api/v1/schedule?startDate=${
            matchup.matchups[week - 1].week_start
          }&endDate=${matchup.matchups[week - 1].week_end}`
        )
        setSchedule(result.data)
        console.log(result.data)
      } catch (e) {
        console.log(e)
      }

      //Load nhl season stats
      // try {
      //   const result = await axios.get(
      //     'https://statsapi.web.nhl.com/api/v1/teams?expand=team.stats'
      //   )
      //   setSeasonStats(result.data)
      //   console.log(result.data)
      // } catch (e) {
      //   console.log(e)
      // }
    }

    if (matchup && teamKey) {
      loadStats()
    }
  }, [matchup, week, teamKey])

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
          teamRoster={teamRoster}
          oppRoster={oppRoster}
          schedule={schedule}
          // seasonStats={seasonStats}
        />
        <Footer setHelpScreen={setHelpScreen} />
      </div>
    )
  } catch (e) {
    return <Loading />
  }
}

export default App
