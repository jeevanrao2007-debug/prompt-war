import { GoogleMap, MarkerF, InfoWindowF, PolylineF } from '@react-google-maps/api'
import { useCallback, useMemo, useState } from 'react'
import { computeShortestPath } from '../services/navigationService'
import { calculateWaitTime, formatWaitTime } from '../services/waitTimeService'

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '14px',
}

const stadiumCenter = {
  lat: 40.8135,
  lng: -74.0745, // MetLife Stadium, New Jersey
}

const navigationNodes = {
  gate: {
    title: 'Gate',
    position: { lat: 40.8145, lng: -74.0755 },
    description: 'Entry point',
  },
  corridor: {
    title: 'Corridor',
    position: { lat: 40.8139, lng: -74.0747 },
    description: 'Main walking corridor',
  },
  foodCourt: {
    title: 'Food Court',
    position: { lat: 40.8131, lng: -74.0740 },
    description: 'Concessions and dining',
  },
  seating: {
    title: 'Seating',
    position: { lat: 40.8124, lng: -74.0732 },
    description: 'Seating area',
  },
}

const markers = Object.entries(navigationNodes).map(([key, node], index) => ({
  id: index + 1,
  key,
  title: node.title,
  position: node.position,
  description: node.description,
}))

const mapOptions = {
  zoom: 17,
  streetViewControl: false,
}

const polylineOptions = {
  strokeColor: '#2563eb',
  strokeOpacity: 0.9,
  strokeWeight: 4,
}

export default function Map({ isLoaded, loadError, crowdData }) {
  const [activeMarker, setActiveMarker] = useState(null)

  const waitByMarkerKey = useMemo(() => {
    const gatePeople = crowdData?.gateA ?? 0
    const foodCourtPeople = crowdData?.foodCourt ?? 0
    const seatingPeople = crowdData?.seating ?? 0

    return {
      gate: calculateWaitTime(gatePeople),
      corridor: calculateWaitTime(Math.round((gatePeople + foodCourtPeople) / 2)),
      foodCourt: calculateWaitTime(foodCourtPeople),
      seating: calculateWaitTime(seatingPeople),
    }
  }, [crowdData])

  const pathNodeKeys = useMemo(() => computeShortestPath('gate', 'seating'), [])

  const polylinePath = useMemo(
    () =>
      pathNodeKeys
        .map((nodeKey) => navigationNodes[nodeKey]?.position)
        .filter(Boolean),
    [pathNodeKeys]
  )

  const handleMarkerClick = useCallback((markerId) => {
    setActiveMarker(markerId)
  }, [])

  if (loadError) return <div className="map-feedback map-error" role="alert">Map unavailable right now.</div>
  if (!isLoaded) return <div className="map-skeleton" role="status" aria-label="Loading map">Loading live map...</div>

  return (
    <div role="region" aria-label="Stadium map with live crowd data">
      <section className="sr-only" role="region" aria-label="Map marker controls">
        {markers.map((marker) => (
          <button
            key={`control-${marker.id}`}
            type="button"
            onClick={() => handleMarkerClick(marker.id)}
            aria-label={`Show map details for ${marker.title}`}
          >
            {marker.title}
          </button>
        ))}
      </section>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={stadiumCenter}
        options={mapOptions}
      >
        {polylinePath.length > 1 && (
          <PolylineF path={polylinePath} options={polylineOptions} />
        )}
        {markers.map((marker) => (
          <div key={marker.id}>
            <MarkerF
              position={marker.position}
              title={`${marker.title} — Wait: ${formatWaitTime(waitByMarkerKey[marker.key] ?? 0)}`}
              label={{
                text: formatWaitTime(waitByMarkerKey[marker.key] ?? 0),
                color: '#0f172a',
                fontSize: '12px',
                fontWeight: '600',
              }}
              onClick={() => handleMarkerClick(marker.id)}
            />
            {activeMarker === marker.id && (
              <InfoWindowF
                position={marker.position}
                onCloseClick={() => setActiveMarker(null)}
              >
                <div style={{ color: '#000' }}>
                  <strong>{marker.title}</strong>
                  <p>{marker.description}</p>
                  <p>Wait: {formatWaitTime(waitByMarkerKey[marker.key] ?? 0)}</p>
                </div>
              </InfoWindowF>
            )}
          </div>
        ))}
      </GoogleMap>
    </div>
  )
}
