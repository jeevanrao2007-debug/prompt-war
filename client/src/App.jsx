import { useEffect, useRef, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import AdminDashboard from './components/AdminDashboard'
import AuthForm from './components/AuthForm'
import MapLoader from './components/MapLoader'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'
import {
  isFirebaseConfigured,
  listenToAdminAlert,
  listenToCrowdData,
  listenToRecentAlerts,
  saveAlertToFirestore,
  writeAdminAlert,
} from './services/firebaseService'
import { isAdminUser, listenToAuthState, login, logout, setupAuthPersistence, signup } from './services/authService'
import { startCrowdSimulation } from './services/crowdSimulationService'
import {
  CROWD_ALERT_THRESHOLD,
  getNotificationPermission,
  requestNotificationPermission,
  sendCrowdNotification,
} from './services/notificationService'

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const crowdZones = [
  { key: 'gateA', label: 'Gate A' },
  { key: 'foodCourt', label: 'Food Court' },
  { key: 'seating', label: 'Seating' },
]

const normalizeCrowd = (value) => {
  const parsed = Number(value)
  if (Number.isNaN(parsed)) {
    return 0
  }

  return Math.max(0, Math.min(parsed, 100))
}

const getCrowdTone = (value) => {
  if (value > 75) {
    return 'critical'
  }

  if (value > 50) {
    return 'warning'
  }

  return 'healthy'
}

const getCrowdLevel = (value) => {
  if (value > 75) {
    return 'High'
  }

  if (value > 50) {
    return 'Medium'
  }

  return 'Low'
}

const getRecommendationZone = (zoneKey) => {
  if (zoneKey === 'foodCourt') {
    return 'Gate A'
  }

  if (zoneKey === 'gateA') {
    return 'Seating'
  }

  return 'Food Court'
}

const buildRecommendationMessage = (zoneKey) => {
  const zoneLabel = crowdZones.find((zone) => zone.key === zoneKey)?.label ?? zoneKey
  const recommendationZone = getRecommendationZone(zoneKey)
  return `${zoneLabel} crowded -> redirect to ${recommendationZone}`
}

const normalizeAlertLevel = (level, value) => {
  if (level === 'critical') {
    return 'High'
  }

  if (level === 'warning') {
    return 'Medium'
  }

  if (level === 'healthy') {
    return 'Low'
  }

  if (level === 'High' || level === 'Medium' || level === 'Low') {
    return level
  }

  if (typeof value === 'number') {
    return getCrowdLevel(value)
  }

  return 'High'
}

// Diagnostic logging
console.log('🔍 Environment Check:')
console.log('  API Base URL:', VITE_API_BASE_URL)
console.log('  Google Maps API Key:', import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? '✓ Set' : '❌ Missing')
console.log('  Firebase Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✓ Set' : '❌ Missing')

function App() {
  const [serverStatus, setServerStatus] = useState('Checking...')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [crowdData, setCrowdData] = useState({})
  const [notificationPermission, setNotificationPermission] = useState('default')
  const [alerts, setAlerts] = useState([])
  const [isSendingAlert, setIsSendingAlert] = useState(false)
  const [alertStatus, setAlertStatus] = useState('')
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authMode, setAuthMode] = useState('login')
  const [authError, setAuthError] = useState('')
  const [authSubmitting, setAuthSubmitting] = useState(false)

  const previousCrowdRef = useRef({})
  const latestAdminAlertIdRef = useRef(null)

  const isAdmin = isAdminUser(user)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${VITE_API_BASE_URL}/api/health`)
        if (!response.ok) throw new Error('Health check failed')
        const data = await response.json()
        setServerStatus(data.message)
        setError(null)
      } catch (err) {
        setError(err.message)
        setServerStatus('Disconnected')
      } finally {
        setLoading(false)
      }
    }

    checkHealth()
  }, [])

  useEffect(() => {
    setNotificationPermission(getNotificationPermission())
  }, [])

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await setupAuthPersistence()
      } finally {
        const unsubscribe = listenToAuthState((nextUser) => {
          setUser(nextUser)
          setAuthLoading(false)
        })

        return unsubscribe
      }
    }

    let unsubscribe = () => {}

    initializeAuth().then((cleanup) => {
      if (typeof cleanup === 'function') {
        unsubscribe = cleanup
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) {
      setAlerts([])
      latestAdminAlertIdRef.current = null
      setCrowdData({})
      return undefined
    }

    const unsubscribeRecentAlerts = listenToRecentAlerts((recentAlerts) => {
      setAlerts(recentAlerts)
    })

    const unsubscribe = listenToCrowdData((data) => {
      setCrowdData(data)
    })

    return () => {
      unsubscribeRecentAlerts()
      unsubscribe()
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      return undefined
    }

    const unsubscribe = listenToAdminAlert((alert) => {
      if (!alert || !alert.id) {
        return
      }

      if (latestAdminAlertIdRef.current === null) {
        latestAdminAlertIdRef.current = alert.id
        return
      }

      if (latestAdminAlertIdRef.current === alert.id) {
        return
      }

      latestAdminAlertIdRef.current = alert.id
      sendCrowdNotification(alert.message)
      setAlerts((prev) => [{ zone: 'admin', message: alert.message, level: 'High' }, ...prev].slice(0, 5))
    })

    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    if (!user) {
      previousCrowdRef.current = {}
      return
    }

    const zoneKeys = ['gateA', 'foodCourt', 'seating']

    zoneKeys.forEach((zoneKey) => {
      const currentValue = Number(crowdData[zoneKey] ?? 0)
      const previousValue = Number(previousCrowdRef.current[zoneKey] ?? 0)

      const crossedThreshold =
        previousValue <= CROWD_ALERT_THRESHOLD && currentValue > CROWD_ALERT_THRESHOLD

      if (crossedThreshold) {
        const level = getCrowdLevel(currentValue)
        const message = buildRecommendationMessage(zoneKey)
        sendCrowdNotification(message)

        setAlerts((prev) => [{ zone: zoneKey, message, value: currentValue, level }, ...prev].slice(0, 5))
        saveAlertToFirestore(message, level).catch(() => {})
      }
    })

    previousCrowdRef.current = {
      gateA: Number(crowdData.gateA ?? 0),
      foodCourt: Number(crowdData.foodCourt ?? 0),
      seating: Number(crowdData.seating ?? 0),
    }
  }, [crowdData, user])

  useEffect(() => {
    if (!user || !isFirebaseConfigured) {
      return undefined
    }

    const stopSimulation = startCrowdSimulation()
    return () => stopSimulation()
  }, [user])

  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission()
    setNotificationPermission(permission)
  }

  const handleSendAlert = async () => {
    if (!isFirebaseConfigured) {
      setAlertStatus('Firebase is not configured.')
      return
    }

    setIsSendingAlert(true)
    setAlertStatus('')

    try {
      const message = 'Gate A is crowded, use another entry'
      await writeAdminAlert(message)
      await saveAlertToFirestore(message, 'High')
      setAlertStatus('Alert sent successfully.')
    } catch (sendError) {
      setAlertStatus('Failed to send alert.')
    } finally {
      setIsSendingAlert(false)
    }
  }

  const handleAuthSubmit = async (email, password) => {
    setAuthError('')
    setAuthSubmitting(true)

    try {
      if (authMode === 'login') {
        await login(email, password)
      } else {
        await signup(email, password)
      }
    } catch (submitError) {
      setAuthError(submitError.message)
    } finally {
      setAuthSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  if (authLoading) {
    return (
      <main className="container auth-shell" aria-label="Loading session">
        <div className="card loading-card" role="status" aria-live="polite">
          <p>Loading session...</p>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="container auth-shell">
        <header className="app-header">
          <h1>Prompt Wars</h1>
          <p className="app-subtitle">Realtime crowd intelligence for safer stadium navigation.</p>
        </header>
        <AuthForm
          mode={authMode}
          onSubmit={handleAuthSubmit}
          loading={authSubmitting}
          error={authError}
          onModeChange={setAuthMode}
        />
      </main>
    )
  }

  return (
    <main className="container" role="main" aria-label="Prompt Wars dashboard">
      <header className="app-header">
        <h1>Prompt Wars</h1>
        <p className="app-subtitle">Realtime dashboard for crowd flow, safety alerts, and live wayfinding.</p>
      </header>

      <nav className="top-nav" aria-label="Main navigation">
        <div className="nav-links" role="list">
          <Link className="nav-link" to="/" role="listitem">Overview</Link>
          {isAdmin && <Link className="nav-link" to="/admin" role="listitem">Admin</Link>}
        </div>
        <span className="user-chip" aria-label={`Signed in as ${user.email}`}>{user.email}</span>
        <button
          className="ghost-btn"
          onClick={handleLogout}
          aria-label="Logout of your account"
        >
          Logout
        </button>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <section className="dashboard-grid" role="region" aria-label="Overview dashboard">
              <section className="card status-card" role="region" aria-label="Server status">
                <div className="card-head">
                  <h2>Server Status</h2>
                  <span className={`status-pill ${error ? 'error' : 'success'}`}>
                    {loading ? 'Checking' : error ? 'Offline' : 'Online'}
                  </span>
                </div>
                <p className={`status-text ${error ? 'error' : 'success'}`}>
                  {loading ? 'Checking...' : serverStatus}
                </p>
                {error && <p className="error-text">Error: {error}</p>}
                <p className="meta-line">Backend: {VITE_API_BASE_URL}/api/health</p>
              </section>

              <section className="card crowd-card" role="region" aria-label="Crowd data">
                <div className="card-head">
                  <h2>Crowd Data</h2>
                  <span className="status-pill neutral">Realtime</span>
                </div>
                <div className="crowd-metrics">
                  {crowdZones.map((zone) => {
                    const rawValue = crowdData[zone.key]
                    const displayValue = rawValue ?? '-'
                    const value = Number(rawValue ?? 0)
                    const tone = getCrowdTone(value)
                    const width = normalizeCrowd(value)

                    return (
                      <div key={zone.key} className="metric-row">
                        <div className="metric-meta">
                          <span>{zone.label}</span>
                          <span className={`metric-value ${tone}`}>{displayValue}</span>
                        </div>
                        <div className="metric-bar">
                          <div className={`metric-fill ${tone}`} style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="meta-line" aria-live="polite" aria-atomic="true">
                  Notification Permission: {notificationPermission}
                </p>
                <div className="card-actions">
                  {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
                    <button
                      className="notify-btn"
                      onClick={handleEnableNotifications}
                      aria-label="Enable browser notifications for crowd alerts"
                    >
                      Enable Notifications
                    </button>
                  )}
                  {!isFirebaseConfigured && (
                    <p className="error-text" role="alert">Firebase env vars are missing.</p>
                  )}
                </div>
              </section>

              <section className="card alerts-card" role="region" aria-label="Crowd alerts">
                <div className="card-head">
                  <h2>Alerts</h2>
                  <span className="status-pill neutral">Last 5</span>
                </div>
                <p style={{ fontSize: '12px', opacity: 0.7 }}>
                  Smart system dynamically redirects users based on crowd density
                </p>
                <div className="alerts-list" role="list" aria-label="Recent crowd alerts" aria-live="polite" aria-relevant="additions">
                  {alerts.length === 0 && <p className="muted-text">No crowd alerts yet.</p>}
                  {alerts.map((alert, index) => {
                    const level = normalizeAlertLevel(alert.level, alert.value)

                    return (
                      <div
                        key={alert.id ?? `${alert.zone}-${index}`}
                        className={`alert-item ${
                          level === 'High'
                            ? 'critical'
                            : level === 'Medium'
                            ? 'warning'
                            : 'healthy'
                        }`}
                        role="listitem"
                        aria-label={`${alert.message} — severity: ${level}`}
                      >
                        <span className="alert-dot" aria-hidden="true" />
                        <div>
                          <strong>{alert.message.split('->')[0]}</strong>
                          <br />
                          <small style={{ opacity: 0.7 }}>
                            Recommendation: {alert.message.split('->')[1]}
                          </small>
                        </div>
                        <span className="alert-value" aria-hidden="true">{level}</span>
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className="card map-section" role="region" aria-label="Live stadium map">
                <div className="card-head">
                  <h2>Stadium Map</h2>
                  <span className="status-pill neutral">Live Route</span>
                </div>
                <div className="map-shell">
                  <MapLoader crowdData={crowdData} />
                </div>
              </section>
            </section>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute isAdmin={isAdmin}>
              <AdminDashboard
                crowdData={crowdData}
                onSendAlert={handleSendAlert}
                isSendingAlert={isSendingAlert}
                alertStatus={alertStatus}
              />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </main>
  )
}

export default App
