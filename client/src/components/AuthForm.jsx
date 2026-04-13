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
    <div className="auth-card">
      <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button className="notify-btn" type="submit" disabled={loading}>
          {loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      <p className="auth-switch">
        {isLogin ? 'Need an account?' : 'Already have an account?'}{' '}
        <button
          type="button"
          className="link-btn"
          onClick={() => onModeChange(isLogin ? 'signup' : 'login')}
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </div>
  )
}

export default AuthForm
