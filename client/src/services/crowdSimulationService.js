import { writeCrowdData } from './firebaseService'

export const ZONES = ['gateA', 'foodCourt', 'seating']
export const INTERVAL_MS = 5000

let simulationIntervalId = null

export const normalizeCrowdValue = (value) => {
  if (!Number.isFinite(value)) {
    return 0
  }

  if (value < 0) {
    return 0
  }

  if (value > 100) {
    return 100
  }

  return Math.round(value)
}

export const normalizeCrowdData = (data) => {
  const safeData = data && typeof data === 'object' ? data : {}

  return {
    gateA: normalizeCrowdValue(safeData.gateA),
    foodCourt: normalizeCrowdValue(safeData.foodCourt),
    seating: normalizeCrowdValue(safeData.seating),
  }
}

export const generateRandomCrowdData = () => ({
  gateA: normalizeCrowdValue(Math.random() * 100),
  foodCourt: normalizeCrowdValue(Math.random() * 100),
  seating: normalizeCrowdValue(Math.random() * 100),
})

const writeSimulationTick = async () => {
  const crowdData = normalizeCrowdData(generateRandomCrowdData())

  await Promise.allSettled(
    ZONES.map((zone) => writeCrowdData(zone, crowdData[zone]))
  )
}

export const startCrowdSimulation = () => {
  if (simulationIntervalId) {
    return () => stopCrowdSimulation()
  }

  writeSimulationTick()
  simulationIntervalId = setInterval(writeSimulationTick, INTERVAL_MS)

  return () => stopCrowdSimulation()
}

export const stopCrowdSimulation = () => {
  if (simulationIntervalId) {
    clearInterval(simulationIntervalId)
    simulationIntervalId = null
  }
}
