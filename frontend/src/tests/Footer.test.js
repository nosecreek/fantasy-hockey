import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Footer from '../components/Footer'

describe('Rendering the Footer', () => {
  const setHelpScreen = jest.fn()

  test('footer display the correct content', async () => {
    render(<Footer />)

    expect(screen.getByText(/Help/)).toBeDefined()
    expect(screen.getByText(/Logout/)).toBeDefined()
  })

  test('clicking the help button changes setHelp', async () => {
    render(<Footer setHelpScreen={setHelpScreen} />)

    const helpLink = screen.getByText('Help')
    userEvent.click(helpLink)

    expect(setHelpScreen.mock.calls).toHaveLength(1)
    expect(setHelpScreen.mock.calls[0][0]).toBe(true)
  })
})
