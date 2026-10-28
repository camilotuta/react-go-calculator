import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Como no uso los globals de vitest, el DOM se limpia a mano después de cada test
afterEach(() => {
  cleanup()
})
