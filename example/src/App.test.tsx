import {render, screen} from '@testing-library/react'
import React from 'react'

import App from './App'

test('renders loading at the beginning', () => {
  render(<App />)
  const loadingElement = screen.getByText(/loading/i)
  expect(loadingElement).toBeInTheDocument()
})
