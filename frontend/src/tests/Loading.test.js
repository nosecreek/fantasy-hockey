import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import Loading from '../components/Loading'

describe('Rendering the Loading screen', () => {
  test('loading screen displays the correct content', async () => {
    render(<Loading />)

    expect(screen.getByText(/Loading.../)).toBeDefined()
  })
})
