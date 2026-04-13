import { useJsApiLoader } from '@react-google-maps/api';
import Map from './Map';

const libraries = ['maps'];

export default function MapLoader({ crowdData }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('Google Maps API key is missing (VITE_GOOGLE_MAPS_API_KEY not set)')
    return <div className="map-feedback map-error">Map unavailable: API key not configured.</div>
  }

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
  })

  if (loadError) {
    console.error('Google Maps failed to load:', loadError)
    return <div className="map-feedback map-error">Map failed to load. Please refresh.</div>
  }

  return <Map isLoaded={isLoaded} loadError={loadError} crowdData={crowdData} />
}
