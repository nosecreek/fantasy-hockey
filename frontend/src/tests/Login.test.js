import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../components/Login'
import axios from 'axios'
import { teams, team, leagueKey, teamKey } from './axiosValues'

describe('Login Screen', () => {
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
})

describe('Team Selection', () => {
  const setTeamKey = jest.fn()
  const setLeagueKey = jest.fn()
  const setHelpScreen = jest.fn()
  let mockAxios

  beforeEach(() => {
    Object.defineProperty(window.document, 'cookie', {
      writable: true,
      value: 'loggedIn=true'
    })

    mockAxios = jest.spyOn(axios, 'get')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('if authorized, show team selection', async () => {
    mockAxios.mockReturnValueOnce(Promise.resolve({ data: JSON.parse(teams) }))

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

  test('skip team selection if saved in localstorage', async () => {
    mockAxios.mockReturnValueOnce(Promise.resolve({ data: JSON.parse(teams) }))
    Storage.prototype.getItem = jest.fn(() => team)

    render(
      <Login
        setTeamKey={setTeamKey}
        setLeagueKey={setLeagueKey}
        setHelpScreen={setHelpScreen}
      />
    )

    await screen.findByText(/Select Your Team/)

    expect(setLeagueKey.mock.calls).toHaveLength(1)
    expect(setLeagueKey.mock.calls[0][0]).toBe(leagueKey)
    expect(setTeamKey.mock.calls).toHaveLength(1)
    expect(setTeamKey.mock.calls[0][0]).toBe(teamKey)
  })

  test('choosing a team updates state properly', async () => {
    mockAxios.mockReturnValueOnce(Promise.resolve({ data: JSON.parse(teams) }))
    render(
      <Login
        setTeamKey={setTeamKey}
        setLeagueKey={setLeagueKey}
        setHelpScreen={setHelpScreen}
      />
    )

    const teamName = await screen.findByText(/The Roman Yoshis/)
    userEvent.click(teamName)

    expect(setLeagueKey.mock.calls).toHaveLength(1)
    expect(setLeagueKey.mock.calls[0][0]).toBe(leagueKey)
    expect(setTeamKey.mock.calls).toHaveLength(1)
    expect(setTeamKey.mock.calls[0][0]).toBe(teamKey)
  })

  test('show login screen if api auth fails', async () => {
    mockAxios.mockRejectedValueOnce()
    render(
      <Login
        setTeamKey={setTeamKey}
        setLeagueKey={setLeagueKey}
        setHelpScreen={setHelpScreen}
      />
    )

    const loginButton = await screen.findByText(/Log in to Yahoo!/)
    expect(loginButton).toBeDefined()
  })

  test('show error message if no teams of correct type', async () => {
    const badTeams = JSON.parse(teams)
    badTeams.teams[0].code = 'nba'
    mockAxios.mockReturnValueOnce(Promise.resolve({ data: badTeams }))

    render(
      <Login
        setTeamKey={setTeamKey}
        setLeagueKey={setLeagueKey}
        setHelpScreen={setHelpScreen}
      />
    )

    const message = await screen.findByText(/no supported teams found/)

    expect(message).toBeDefined()
  })
})
