const navigationGraph = {
  gate: ['corridor'],
  corridor: ['gate', 'foodCourt'],
  foodCourt: ['corridor', 'seating'],
  seating: ['foodCourt'],
}

export const computeShortestPath = (start, end) => {
  if (!navigationGraph[start] || !navigationGraph[end]) {
    return []
  }

  if (start === end) {
    return [start]
  }

  const queue = [[start]]
  const visited = new Set([start])

  while (queue.length > 0) {
    const path = queue.shift()
    const current = path[path.length - 1]

    for (const neighbor of navigationGraph[current]) {
      if (visited.has(neighbor)) {
        continue
      }

      const nextPath = [...path, neighbor]

      if (neighbor === end) {
        return nextPath
      }

      visited.add(neighbor)
      queue.push(nextPath)
    }
  }

  return []
}
