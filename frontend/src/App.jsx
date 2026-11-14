import { useEffect, useState } from 'react'
import CreateSecret from './CreateSecret'
import ReadSecret from './ReadSecret'
import Shell from './Shell'

function readIdFromPath() {
  const match = window.location.pathname.match(/^\/s\/([^/]+)\/?$/)
  return match ? decodeURIComponent(match[1]) : null
}

export default function App() {
  const [secretId, setSecretId] = useState(readIdFromPath)

  useEffect(() => {
    function syncWithUrl() {
      setSecretId(readIdFromPath())
    }

    window.addEventListener('popstate', syncWithUrl)
    return () => window.removeEventListener('popstate', syncWithUrl)
  }, [])

  function navigate(path) {
    window.history.pushState({}, '', path)
    setSecretId(readIdFromPath())
    window.scrollTo({ top: 0 })
  }

  return (
    <Shell onHome={() => navigate('/')}>
      {secretId ? (
        <ReadSecret
          key={secretId}
          id={secretId}
          onCreate={() => navigate('/')}
        />
      ) : (
        <CreateSecret />
      )}
    </Shell>
  )
}
