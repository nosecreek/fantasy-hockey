import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import Footer from '../components/Footer'

describe('Rendering the Footer', () => {
  test('footer displays the correct content', async () => {
    render(<Footer />)

    expect(screen.getByText(/GitHub/)).toBeDefined()
    expect(screen.getByText(/Logout/)).toBeDefined()
  })
})
