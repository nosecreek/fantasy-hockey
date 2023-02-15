import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Help from '../components/Help'

const swatch =
  '--stops:rgb(100% 0% 0%),rgb(99.96% 1.6821% 0%),rgb(99.921% 3.3629% 0%),rgb(99.881% 5.0424% 0%),rgb(99.841% 6.7205% 0%),rgb(99.802% 8.3973% 0%),rgb(99.762% 10.073% 0%),rgb(99.722% 11.747% 0%),rgb(99.683% 13.42% 0%),rgb(99.643% 15.091% 0%),rgb(99.603% 16.761% 0%),rgb(99.564% 18.43% 0%),rgb(99.524% 20.098% 0%),rgb(99.484% 21.764% 0%),rgb(99.445% 23.428% 0%),rgb(99.405% 25.092% 0%),rgb(99.365% 26.754% 0%),rgb(99.326% 28.415% 0%),rgb(99.286% 30.074% 0%),rgb(99.246% 31.732% 0%),rgb(99.207% 33.389% 0%),rgb(99.167% 35.044% 0%),rgb(99.127% 36.699% 0%),rgb(99.088% 38.351% 0%),rgb(99.048% 40.003% 0%),rgb(99.008% 41.653% 0%),rgb(98.968% 43.302% 0%),rgb(98.929% 44.949% 0%),rgb(98.889% 46.595% 0%),rgb(98.849% 48.24% 0%),rgb(98.81% 49.883% 0%),rgb(98.77% 51.525% 0%),rgb(98.73% 53.166% 0%),rgb(98.691% 54.806% 0%),rgb(98.651% 56.444% 0%),rgb(98.611% 58.08% 0%),rgb(98.572% 59.716% 0%),rgb(98.532% 61.35% 0%),rgb(98.492% 62.983% 0%),rgb(98.453% 64.614% 0%),rgb(98.413% 66.244% 0%),rgb(98.373% 67.873% 0%),rgb(98.334% 69.5% 0%),rgb(98.294% 71.126% 0%),rgb(98.254% 72.751% 0%),rgb(98.215% 74.374% 0%),rgb(98.175% 75.996% 0%),rgb(98.135% 77.617% 0%),rgb(98.096% 79.236% 0%),rgb(98.056% 80.854% 0%),rgb(98.016% 82.471% 0%),rgb(97.977% 84.087% 0%),rgb(97.937% 85.701% 0%),rgb(97.897% 87.313% 0%),rgb(97.858% 88.925% 0%),rgb(97.818% 90.535% 0%),rgb(97.778% 92.143% 0%),rgb(97.739% 93.751% 0%),rgb(97.699% 95.357% 0%),rgb(97.659% 96.961% 0%),rgb(96.674% 97.62% 0%),rgb(94.993% 97.58% 0%),rgb(93.313% 97.54% 0%),rgb(91.634% 97.501% 0%),rgb(89.957% 97.461% 0%),rgb(88.281% 97.421% 0%),rgb(86.606% 97.382% 0%),rgb(84.933% 97.342% 0%),rgb(83.261% 97.302% 0%),rgb(81.59% 97.263% 0%),rgb(79.921% 97.223% 0%),rgb(78.253% 97.183% 0%),rgb(76.586% 97.144% 0%),rgb(74.921% 97.104% 0%),rgb(73.257% 97.064% 0%),rgb(71.594% 97.024% 0%),rgb(69.933% 96.985% 0%),rgb(68.273% 96.945% 0%),rgb(66.614% 96.905% 0%),rgb(64.957% 96.866% 0%),rgb(63.301% 96.826% 0%),rgb(61.646% 96.786% 0%),rgb(59.993% 96.747% 0%),rgb(58.341% 96.707% 0%),rgb(56.69% 96.667% 0%),rgb(55.041% 96.628% 0%),rgb(53.393% 96.588% 0%),rgb(51.746% 96.548% 0%),rgb(50.101% 96.509% 0%),rgb(48.457% 96.469% 0%),rgb(46.814% 96.429% 0%),rgb(45.173% 96.39% 0%),rgb(43.533% 96.35% 0%),rgb(41.894% 96.31% 0%),rgb(40.257% 96.271% 0%),rgb(38.621% 96.231% 0%),rgb(36.986% 96.191% 0%),rgb(35.353% 96.152% 0%),rgb(33.721% 96.112% 0%),rgb(32.09% 96.072% 0%),rgb(30.461% 96.033% 0%),rgb(28.833% 95.993% 0%),rgb(27.207% 95.953% 0%),rgb(25.581% 95.914% 0%),rgb(23.957% 95.874% 0%),rgb(22.335% 95.834% 0%),rgb(20.713% 95.795% 0%),rgb(19.093% 95.755% 0%),rgb(17.475% 95.715% 0%),rgb(15.858% 95.676% 0%),rgb(14.242% 95.636% 0%),rgb(12.627% 95.596% 0%),rgb(11.014% 95.557% 0%),rgb(9.4018% 95.517% 0%),rgb(7.7912% 95.477% 0%),rgb(6.1819% 95.438% 0%),rgb(4.574% 95.398% 0%),rgb(2.9674% 95.358% 0%),rgb(1.3621% 95.319% 0%),rgb(0% 95.279% 0.2418%),rgb(0% 95.239% 1.8444%),rgb(0% 95.2% 3.4456%),rgb(0% 95.16% 5.0456%),rgb(0% 95.12% 6.6442%),rgb(0% 95.08% 8.2414%),rgb(0% 95.041% 9.8373%),rgb(0% 95.001% 11.432%),rgb(0% 94.961% 13.025%),rgb(0% 94.922% 14.617%),rgb(0% 94.882% 16.208%),rgb(0% 94.842% 17.797%);'

describe('Rendering the Help Screen', () => {
  const setHelpScreen = jest.fn()
  window.scrollTo = jest.fn()

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('help screen displays the correct content', async () => {
    render(<Help />)

    expect(
      screen.getByText(
        /This is a tool for analyzing your weekly matchups in Yahoo!/
      )
    ).toBeDefined()
    expect(screen.getByText(/30.15/)).toBeDefined()
    expect(screen.getByText(/23.74/)).toBeDefined()

    expect(screen.getByTitle('Color Gradient')).toHaveStyle(swatch)
  })

  test('clicking "go back" closes the help screen', async () => {
    render(<Help setHelpScreen={setHelpScreen} helpScreen={true} />)

    const goBack = screen.getByText('Go Back')
    userEvent.click(goBack)

    expect(setHelpScreen.mock.calls).toHaveLength(1)
    expect(setHelpScreen.mock.calls[0][0]).toBe(false)
  })
})
