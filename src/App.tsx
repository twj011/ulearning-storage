import { useState, useEffect } from 'react'
import Login from './components/Login'
import FileManager from './components/FileManager'

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'))

  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }, [token])

  const handleLogout = () => {
    setToken(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!token ? (
        <Login onLogin={setToken} />
      ) : (
        <FileManager token={token} onLogout={handleLogout} />
      )}
    </div>
  )
}

export default App
