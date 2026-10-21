import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'

const AUTH_KEY = 'legato-auth'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const validUser = import.meta.env.VITE_AUTH_USERNAME
    const validPass = import.meta.env.VITE_AUTH_PASSWORD

    if (username === validUser && password === validPass) {
      localStorage.setItem(AUTH_KEY, 'true')
      navigate('/')
    } else {
      setError('Invalid username or password.')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#111',
      color: '#eee',
    }}>
      <div style={{ width: 320 }}>
        <h2 style={{ marginBottom: 24, fontWeight: 600, fontSize: 20 }}>Legato Business Tools</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type='text'
            placeholder='Username'
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={inputStyle}
            autoFocus
          />
          <input
            type='password'
            placeholder='Password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle}
          />
          {error && <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>}
          <button type='submit' style={buttonStyle}>Sign in</button>
        </form>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  background: '#1e1e1e',
  border: '1px solid #333',
  borderRadius: 6,
  color: '#eee',
  fontSize: 14,
  outline: 'none',
}

const buttonStyle: React.CSSProperties = {
  padding: '10px 12px',
  background: '#6d28d9',
  border: 'none',
  borderRadius: 6,
  color: '#fff',
  fontSize: 14,
  cursor: 'pointer',
  marginTop: 4,
}
