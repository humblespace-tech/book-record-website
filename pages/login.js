import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/AuthContext'

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { isAdmin, loading, login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAdmin) {
      router.replace('/')
    }
  }, [loading, isAdmin, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const result = await login(password)
    if (result.success) {
      router.push('/')
    } else {
      setError(result.error)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={s.container}>
        <main style={s.main}>
          <p style={s.loadingText}>Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div style={s.container}>
      <Head>
        <title>Admin Login - humblespace</title>
      </Head>
      <main style={s.main}>
        <Link href="/" style={s.backBtn}>Back to Library</Link>
        <h1 style={s.title}>Admin Login</h1>
        <p style={s.subtitle}>Enter your password to manage the library</p>

        {error && (
          <p style={s.error}>{error}</p>
        )}

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={s.input}
              placeholder="Enter admin password"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{ ...s.button, opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </main>
    </div>
  )
}

const s = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #FFFDF7 0%, #F5EBE0 50%, #F0E4D6 100%)',
    padding: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    maxWidth: '420px',
    width: '100%',
    color: '#5D4E37',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.7rem 1.8rem',
    background: '#5D4E37',
    color: '#FFFDF7',
    border: '2px solid #5D4E37',
    borderRadius: '30px',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontFamily: "'Merriweather', Georgia, serif",
    fontWeight: '400',
    letterSpacing: '0.5px',
    cursor: 'pointer',
    transition: 'all 0.4s ease',
    boxShadow: '0 3px 10px rgba(93, 78, 55, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  title: {
    fontSize: '2.5rem',
    margin: '1.5rem 0 0.3rem',
    color: '#3E2723',
    fontWeight: '700',
    fontFamily: "'Playfair Display', Georgia, serif",
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: '#8B7E66',
    fontSize: '1rem',
    margin: '0 0 2rem',
    fontFamily: "'Lora', Georgia, serif",
  },
  loadingText: {
    textAlign: 'center',
    fontSize: '1.1rem',
    color: '#8B7E66',
    fontFamily: "'Lora', Georgia, serif",
    fontStyle: 'italic',
  },
  error: {
    padding: '0.8rem 1rem',
    borderRadius: '12px',
    border: '2px solid #b45050',
    background: 'rgba(180, 80, 80, 0.1)',
    color: '#b45050',
    marginBottom: '1.5rem',
    textAlign: 'center',
    fontSize: '0.9rem',
    fontFamily: "'Lora', Georgia, serif",
  },
  form: {
    background: 'linear-gradient(135deg, #FFFDF7 0%, rgba(244, 217, 198, 0.3) 100%)',
    padding: '2rem',
    borderRadius: '20px',
    border: '3px solid #F4D9C6',
    boxShadow: '0 10px 30px rgba(93, 78, 55, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
  },
  field: {
    marginBottom: '1.2rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.4rem',
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#5D4E37',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontFamily: "'Merriweather', Georgia, serif",
  },
  input: {
    width: '100%',
    padding: '0.8rem 1rem',
    borderRadius: '12px',
    border: '2px solid #F4D9C6',
    background: 'rgba(255, 253, 247, 0.8)',
    color: '#3E2723',
    fontSize: '1rem',
    boxSizing: 'border-box',
    fontFamily: "'Lora', Georgia, serif",
  },
  button: {
    width: '100%',
    padding: '1rem',
    borderRadius: '30px',
    border: 'none',
    background: '#D4774E',
    color: '#FFFDF7',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(212, 119, 78, 0.3)',
    fontFamily: "'Merriweather', Georgia, serif",
    transition: 'all 0.3s ease',
    letterSpacing: '0.5px',
  },
}
