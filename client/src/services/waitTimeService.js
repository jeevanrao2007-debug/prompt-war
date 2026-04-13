const DEFAULT_SERVICE_RATE = 10

export const calculateWaitTime = (people, serviceRate = DEFAULT_SERVICE_RATE) => {
  if (!serviceRate || serviceRate <= 0) {
    return 0
  }

  const safePeople = Number.isFinite(people) ? Math.max(0, people) : 0
  return Math.round((safePeople / serviceRate) * 10) / 10
}

export const formatWaitTime = (minutes) => `${minutes} min`
