import { useState } from 'react'

function AuthForm({ mode, onSubmit, loading, error, onModeChange }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const isLogin = mode === 'login'

  const handleSubmit = async (event) => {
    event.preventDefault()
    await onSubmit(email, password)
  }

  return (
    <section className="auth-card" role="region" aria-label="Authentication">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form className="auth-form" onSubmit={handleSubmit} aria-label={isLogin ? 'Login form' : 'Sign up form'}>
        <label htmlFor="auth-email" className="sr-only">Email address</label>
        <input
          id="auth-email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          aria-label="Email address"
          autoComplete="email"
        />
        <label htmlFor="auth-password" className="sr-only">Password</label>
        <input
          id="auth-password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          aria-label="Password"
          autoComplete={isLogin ? 'current-password' : 'new-password'}
        />
        <button
          className="notify-btn"
          type="submit"
          disabled={loading}
          aria-label={loading ? 'Submitting, please wait' : isLogin ? 'Login' : 'Sign Up'}
          aria-busy={loading}
        >
          {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>

      {error && (
        <p className="error-text" role="alert" aria-live="assertive">
          {error}
        </p>
      )}

      <p className="auth-switch">
        {isLogin ? 'Need an account?' : 'Already have an account?'}{' '}
        <button
          type="button"
          className="link-btn"
          onClick={() => onModeChange(isLogin ? 'signup' : 'login')}
          aria-label={isLogin ? 'Switch to sign up' : 'Switch to login'}
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </section>
  )
}

export default AuthForm
