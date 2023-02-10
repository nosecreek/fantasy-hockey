import { useEffect } from 'react'
import Table from 'react-bootstrap/Table'
import matchupFunctions from '../functions/matchup'

const Help = ({ setHelpScreen, helpScreen }) => {
  const closeHelp = (e) => {
    e.preventDefault()
    setHelpScreen(false)
  }

  useEffect(() => {
    //Scroll to the top when component is displayed
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    })
  }, [])

  const steps = matchupFunctions.c1
    .steps(matchupFunctions.c2, {
      space: 'hsl',
      outputSpace: 'srgb',
      maxDeltaE: 3, // max deltaE between consecutive steps (optional)
      steps: 10 // min number of steps
    })
    .join(',')

  const Swatch = () => {
    return (
      <Table className="swatchTable">
        <tbody>
          <tr>
            <td>Less Likely</td>
            <td className="swatch">
              <div
                title="Color Gradient"
                style={{
                  '--stops': steps
                }}
              ></div>
            </td>
            <td>More Likely</td>
          </tr>
        </tbody>
      </Table>
    )
  }

  return (
    <div className="help">
      <div className="helpBox">
        <h2>Help</h2>
        <p>
          This is a tool for analyzing your weekly matchups in Yahoo!
          head-to-head fantasy hockey leagues.
        </p>

        <h2>Matchup Tab</h2>
        <p>
          Your currently weekly matchup will be displayed, similar to the
          example below. You can use the left/right arrows to analyze upcoming
          and already completed matchups.
        </p>

        <Table bordered hover>
          <thead>
            <tr>
              <th>Your Team Name</th>
              <th>Category</th>
              <th>Opponent Team Name</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  background: 'rgb(222, 248, 0)'
                }}
              >
                29.42
                <br />
                (Predicted Total)
                <span className="avg">
                  30.15
                  <br />
                  (Weekly Average)
                </span>
              </td>
              <td>
                <strong>
                  Assists
                  <br />
                  (Category Name)
                </strong>
              </td>
              <td
                style={{
                  background: 'rgb(250, 223, 0)'
                }}
              >
                23.74
                <br />
                (Predicted Total)
                <span className="avg">
                  22.86
                  <br />
                  (Weekly Average)
                </span>
              </td>
            </tr>
          </tbody>
        </Table>

        <p>
          The background color of each cell indicates how likely that player is
          to win vs the current opponent.
        </p>

        <Swatch />

        <h3>Predicted Total</h3>
        <p>
          Considers each player's current roster, average stats for each player
          on the roster, injury status, and the number of games each of those
          players is expected to play in the selected week.
        </p>
        <h3>Weekly Average</h3>
        <p>
          Season total stats divided by the number of weeks played so far. Does
          not consider current rosters, and is therefore likely to be less
          accurate.
        </p>

        <h2>Players Tab</h2>
        <p>
          View and customize player rankings (skaters only) based on your league
          settings and matchups!
        </p>

        <p>
          Click on a category name to toggle how much weight it is given when
          calculating the rankings:
        </p>

        <ul className="players-help">
          <li>
            <div className="example-block">
              <div className="example-cell weight0">G</div>
            </div>
            <span>Not considered in player rankings</span>
          </li>
          <li>
            <div className="example-block">
              <div className="example-cell weight1">A</div>
            </div>
            <span>Given minimal consideration</span>
          </li>
          <li>
            <div className="example-block">
              <div className="example-cell weight2">PPP</div>
            </div>
            <span>Given default consideration</span>
          </li>
          <li>
            <div className="example-block">
              <div className="example-cell weight3">SOG</div>
            </div>
            <span>Given slightly extra consideration</span>
          </li>
          <li>
            <div className="example-block">
              <div className="example-cell weight4">HIT</div>
            </div>
            <span>Given heavy consideration</span>
          </li>
        </ul>

        <p>Two additional categories will be shown:</p>
        <ul>
          <li>WEEK: The number of games remaining this week</li>
          <li>
            NEXT: The number of games this player is scheduled to play next week
          </li>
        </ul>
        <p>
          You can also click on these headings to toggle how much value these
          schedules are given when calculating each player's ranking.
        </p>
        <p>
          The <em>Current Matchup</em> and <em>Next Matchup</em> buttons at the
          top of the page will automatically optimize the ranking for the
          appropriate week. Categories where you and your opponent opponent have
          similar projections will be given extra weight, and categories where
          you are projected to easily win/lose are given less weight or no
          weight at all. This helps to create a custom set of rankings for the
          streamers that are most likely to help you win your matchups!
        </p>

        {helpScreen && (
          <a href="/" onClick={(e) => closeHelp(e)}>
            Go Back
          </a>
        )}
      </div>
    </div>
  )
}

export default Help
