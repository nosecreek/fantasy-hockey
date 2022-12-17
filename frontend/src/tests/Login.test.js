import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../components/Login'

describe('Rendering the Login Screen', () => {
  const setTeamKey = jest.fn()
  const setLeagueKey = jest.fn()
  const setHelpScreen = jest.fn()

  test('displays the correct content when logged out', async () => {
    render(
      <Login
        setTeamKey={setTeamKey}
        setLeagueKey={setLeagueKey}
        setHelpScreen={setHelpScreen}
      />
    )

    expect(screen.getByText(/Fantasy Hockey Helper/)).toBeDefined()
    expect(screen.getByText(/tool/)).toBeDefined()
  })

  // test('clicking the help button changes setHelp', async () => {
  //   render(<Footer setHelpScreen={setHelpScreen} />)

  //   const helpLink = screen.getByText('Help')
  //   userEvent.click(helpLink)

  //   expect(setHelpScreen.mock.calls).toHaveLength(1)
  //   expect(setHelpScreen.mock.calls[0][0]).toBe(true)
  // })
})
