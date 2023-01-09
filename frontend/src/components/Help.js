import Table from 'react-bootstrap/Table'
import Color from 'colorjs.io'

const Help = ({ setHelpScreen }) => {
  const closeHelp = (e) => {
    e.preventDefault()
    setHelpScreen(false)
  }

  const c1 = new Color('red')
  const c2 = new Color('p3', [0, 1, 0])
  // const range = c1.range(c2, { space: 'hsl' })
  const steps = c1
    .steps(c2, {
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
                290
                <br />
                (Season Total)
                <span className="avg">
                  29.42
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
                234
                <br />
                (Season Total)
                <span className="avg">
                  23.74
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

        <a href="/" onClick={(e) => closeHelp(e)}>
          Go Back
        </a>
      </div>
    </div>
  )
}

export default Help
