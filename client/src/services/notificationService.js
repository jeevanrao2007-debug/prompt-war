export const CROWD_ALERT_THRESHOLD = 80

export const zoneMessages = {
  gateA: 'Gate A is crowded, use another entry',
  foodCourt: 'Food Court is crowded, consider another area',
  seating: 'Seating area is crowded, try a different section',
}

export const isNotificationSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window
}

export const getNotificationPermission = () => {
  if (!isNotificationSupported()) {
    return 'unsupported'
  }

  return Notification.permission
}

export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    return 'unsupported'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  return Notification.requestPermission()
}

export const sendCrowdNotification = (message) => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false
  }

  new Notification('Crowd Alert', { body: message })
  return true
}
