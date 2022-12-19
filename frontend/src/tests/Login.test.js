import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../components/Login'
import axios from 'axios'
import { teams } from './axiosValues'

describe('Rendering the Login Screen', () => {
  const setTeamKey = jest.fn()
  const setLeagueKey = jest.fn()
  const setHelpScreen = jest.fn()

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('displays the correct content when logged out', async () => {
    render(
      <Login
        setTeamKey={setTeamKey}
        setLeagueKey={setLeagueKey}
        setHelpScreen={setHelpScreen}
      />
    )

    expect(screen.getByText(/Fantasy Hockey Helper/)).toBeDefined()
    expect(screen.getByText(/Log in to Yahoo!/)).toBeDefined()
    expect(screen.getByText(/tool/)).toBeDefined()
  })

  test('clicking the login button redirects window.location', async () => {
    render(
      <Login
        setTeamKey={setTeamKey}
        setLeagueKey={setLeagueKey}
        setHelpScreen={setHelpScreen}
      />
    )

    delete window.location
    window.location = { replace: jest.fn() }

    const loginButton = screen.getByText('Log in to Yahoo!')
    userEvent.click(loginButton)

    expect(window.location.replace.mock.calls).toHaveLength(1)
  })

  test('clicking learn more shows help screen', async () => {
    render(
      <Login
        setTeamKey={setTeamKey}
        setLeagueKey={setLeagueKey}
        setHelpScreen={setHelpScreen}
      />
    )

    const helpLink = screen.getByText(/learn more/)
    userEvent.click(helpLink)

    expect(setHelpScreen.mock.calls).toHaveLength(1)
    expect(setHelpScreen.mock.calls[0][0]).toBe(true)
  })

  test('if authorized, show team selection', async () => {
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: 'loggedIn=true'
    })

    jest
      .spyOn(axios, 'get')
      .mockReturnValueOnce(Promise.resolve({ data: JSON.parse(teams) }))

    render(
      <Login
        setTeamKey={setTeamKey}
        setLeagueKey={setLeagueKey}
        setHelpScreen={setHelpScreen}
      />
    )

    const title = await screen.findByText(/Select Your Team/)
    const teamName = await screen.findByText(/The Roman Yoshis/)

    expect(title).toBeDefined()
    expect(teamName).toBeDefined()
  })
})
