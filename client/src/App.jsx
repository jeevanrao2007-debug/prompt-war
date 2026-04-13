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
  writeAdminAlert,
} from './services/firebaseService'
import { isAdminUser, listenToAuthState, login, logout, setupAuthPersistence, signup } from './services/authService'
import { startCrowdSimulation } from './services/crowdSimulationService'
import {
  CROWD_ALERT_THRESHOLD,
  getNotificationPermission,
  requestNotificationPermission,
  sendCrowdNotification,
  zoneMessages,
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
  if (value > CROWD_ALERT_THRESHOLD + 15) {
    return 'critical'
  }

  if (value > CROWD_ALERT_THRESHOLD) {
    return 'warning'
  }

  return 'healthy'
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
      setCrowdData({})
      return undefined
    }

    const unsubscribe = listenToCrowdData((data) => {
      setCrowdData(data)
    })

    return () => unsubscribe()
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
      setAlerts((prev) => [{ zone: 'admin', message: alert.message, value: 'Admin' }, ...prev].slice(0, 5))
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
        const message = zoneMessages[zoneKey]
        sendCrowdNotification(message)

        setAlerts((prev) => [{ zone: zoneKey, message, value: currentValue }, ...prev].slice(0, 5))
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
      await writeAdminAlert('Gate A is crowded, use another entry')
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
      <div className="container auth-shell">
        <div className="card loading-card">
          <p>Loading session...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container auth-shell">
        <div className="app-header">
          <h1>Prompt Wars</h1>
          <p className="app-subtitle">Realtime crowd intelligence for safer stadium navigation.</p>
        </div>
        <AuthForm
          mode={authMode}
          onSubmit={handleAuthSubmit}
          loading={authSubmitting}
          error={authError}
          onModeChange={setAuthMode}
        />
      </div>
    )
  }

  return (
    <div className="container">
      <div className="app-header">
        <h1>Prompt Wars</h1>
        <p className="app-subtitle">Realtime dashboard for crowd flow, safety alerts, and live wayfinding.</p>
      </div>

      <div className="top-nav">
        <div className="nav-links">
          <Link className="nav-link" to="/">Overview</Link>
          {isAdmin && <Link className="nav-link" to="/admin">Admin</Link>}
        </div>
        <span className="user-chip">{user.email}</span>
        <button className="ghost-btn" onClick={handleLogout}>Logout</button>
      </div>

      <Routes>
        <Route
          path="/"
          element={
            <div className="dashboard-grid">
              <section className="card status-card">
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

              <section className="card crowd-card">
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
                <p className="meta-line">Notification Permission: {notificationPermission}</p>
                <div className="card-actions">
                  {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
                    <button className="notify-btn" onClick={handleEnableNotifications}>
                      Enable Notifications
                    </button>
                  )}
                  {!isFirebaseConfigured && (
                    <p className="error-text">Firebase env vars are missing.</p>
                  )}
                </div>
              </section>

              <section className="card alerts-card">
                <div className="card-head">
                  <h2>Alerts</h2>
                  <span className="status-pill neutral">Last 5</span>
                </div>
                <div className="alerts-list">
                  {alerts.length === 0 && <p className="muted-text">No crowd alerts yet.</p>}
                  {alerts.map((alert, index) => (
                    <div
                      key={`${alert.zone}-${index}`}
                      className={`alert-item ${typeof alert.value === 'number' && alert.value > CROWD_ALERT_THRESHOLD ? 'critical' : 'warning'}`}
                    >
                      <span className="alert-dot" />
                      <span>{alert.message}</span>
                      <span className="alert-value">{alert.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="card map-section">
                <div className="card-head">
                  <h2>Stadium Map</h2>
                  <span className="status-pill neutral">Live Route</span>
                </div>
                <div className="map-shell">
                  <MapLoader crowdData={crowdData} />
                </div>
              </section>
            </div>
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
    </div>
  )
}

export default App
