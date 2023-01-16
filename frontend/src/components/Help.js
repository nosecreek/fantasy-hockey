import { useEffect } from 'react'
import Table from 'react-bootstrap/Table'
import matchupFunctions from '../functions/matchup'

const Help = ({ setHelpScreen }) => {
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
          head-to-head leagues. Your currently weekly matchup will be displayed,
          similar to the example below. You can use the left/right arrows to
          analyze upcoming and already completed matchups.
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

        <a href="/" onClick={(e) => closeHelp(e)}>
          Go Back
        </a>
      </div>
    </div>
  )
}

export default Help
