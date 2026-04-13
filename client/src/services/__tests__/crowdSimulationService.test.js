import { describe, expect, it } from 'vitest'
import {
  generateRandomCrowdData,
  normalizeCrowdData,
  normalizeCrowdValue,
} from '../crowdSimulationService'

describe('crowd simulation logic', () => {
  it('generates random values within 0 to 100', () => {
    const crowdData = generateRandomCrowdData()

    expect(crowdData.gateA).toBeGreaterThanOrEqual(0)
    expect(crowdData.gateA).toBeLessThanOrEqual(100)
    expect(crowdData.foodCourt).toBeGreaterThanOrEqual(0)
    expect(crowdData.foodCourt).toBeLessThanOrEqual(100)
    expect(crowdData.seating).toBeGreaterThanOrEqual(0)
    expect(crowdData.seating).toBeLessThanOrEqual(100)
  })

  it('handles no data input by returning safe defaults', () => {
    const normalized = normalizeCrowdData(null)

    expect(normalized).toEqual({
      gateA: 0,
      foodCourt: 0,
      seating: 0,
    })
  })

  it('handles invalid values by clamping and sanitizing', () => {
    expect(normalizeCrowdValue(-20)).toBe(0)
    expect(normalizeCrowdValue(200)).toBe(100)
    expect(normalizeCrowdValue(Number.NaN)).toBe(0)
    expect(normalizeCrowdValue('bad')).toBe(0)
  })

  it('normalizes mixed edge case crowd data', () => {
    const normalized = normalizeCrowdData({
      gateA: -1,
      foodCourt: 88.6,
      seating: 150,
    })

    expect(normalized).toEqual({
      gateA: 0,
      foodCourt: 89,
      seating: 100,
    })
  })
})
