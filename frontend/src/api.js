const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

async function request(path, options) {
  let response

  try {
    response = await fetch(`${API_BASE}${path}`, options)
  } catch {
    throw new Error('Could not reach the server. Is the backend running?')
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  return { status: response.status, ok: response.ok, data }
}

export async function createSecret(message) {
  const { status, ok, data } = await request('/api/secrets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })

  if (!ok) {
    throw new Error(data?.error ?? 'The secret could not be created.')
  }

  if (status !== 200 || !data?.id) {
    throw new Error('The server sent an unexpected response.')
  }

  return data.id
}

export async function readSecret(id) {
  return request(`/api/secrets/${encodeURIComponent(id)}`, { method: 'GET' })
}
