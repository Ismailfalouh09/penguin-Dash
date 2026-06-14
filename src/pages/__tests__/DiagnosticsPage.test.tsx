import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { render, screen, waitFor } from '@/test/utils/render'
import userEvent from '@testing-library/user-event'
import { server } from '@/test/mocks/server'
import { apiUrl } from '@/test/mocks/api'
import { apiBaseUrl } from '@/config/env'
import { DiagnosticsPage } from '../DiagnosticsPage'

describe('DiagnosticsPage', () => {
  it('displays the configured API base URL and contract metadata', () => {
    render(<DiagnosticsPage />)
    expect(screen.getByText(apiBaseUrl)).toBeInTheDocument()
    expect(screen.getByText('Beauty Pack Recommendation API')).toBeInTheDocument()
    expect(screen.getByText('1.0.0')).toBeInTheDocument()
    expect(screen.getByText('Development only')).toBeInTheDocument()
  })

  it('does not display any secret-like values', () => {
    const { container } = render(<DiagnosticsPage />)
    const text = container.textContent ?? ''
    expect(text).not.toMatch(/bearer\s+ey/i)
    expect(text).not.toMatch(/password/i)
    expect(text).not.toMatch(/secret/i)
  })

  it('reports a reachable backend after a successful probe', async () => {
    server.use(http.get(apiUrl('/'), () => HttpResponse.json('API root', { status: 200 })))
    const user = userEvent.setup()
    render(<DiagnosticsPage />)

    await user.click(screen.getByRole('button', { name: /test connection/i }))

    await waitFor(() => expect(screen.getByText(/reachable/i)).toBeInTheDocument())
  })

  it('shows a normalized error message when the probe fails', async () => {
    server.use(http.get(apiUrl('/'), () => HttpResponse.json({ statusCode: 503 }, { status: 503 })))
    const user = userEvent.setup()
    render(<DiagnosticsPage />)

    await user.click(screen.getByRole('button', { name: /test connection/i }))

    // A friendly, normalized message is shown — never a raw stack trace.
    await waitFor(() =>
      expect(screen.getByText(/something went wrong on the server/i)).toBeInTheDocument()
    )
  })
})
