import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapView.css'

// Custom icons
const stationIcon = (status) => L.divIcon({
  className: 'custom-marker',
  html: `<div class="marker-station ${status}">
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
})

const binIcon = (status, fillLevel) => L.divIcon({
  className: 'custom-marker',
  html: `<div class="marker-bin ${status}">
    <div class="fill-indicator" style="height: ${fillLevel}%"></div>
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
    </svg>
    <span class="fill-text">${fillLevel}%</span>
  </div>`,
  iconSize: [36, 48],
  iconAnchor: [18, 48],
  popupAnchor: [0, -48]
})

// Component to handle map center changes
function MapController({ selectedItem }) {
  const map = useMap()

  useEffect(() => {
    if (selectedItem) {
      map.flyTo([selectedItem.lat, selectedItem.lng], 16, { duration: 0.5 })
    }
  }, [selectedItem, map])

  return null
}

function MapView({ stations, bins, selectedItem, onItemSelect }) {
  const center = [32.0853, 34.7818] // תל אביב

  return (
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController selectedItem={selectedItem} />

        {/* Station markers */}
        {stations.map(station => (
          <Marker
            key={station.id}
            position={[station.lat, station.lng]}
            icon={stationIcon(station.status)}
            eventHandlers={{
              click: () => onItemSelect(station)
            }}
          >
            <Popup>
              <div className="popup-content">
                <h3>🚏 {station.name}</h3>
                <p className={`status-badge ${station.status}`}>
                  {station.status === 'active' ? 'פעיל' : 'בתחזוקה'}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Bin markers */}
        {bins.map(bin => (
          <Marker
            key={bin.id}
            position={[bin.lat, bin.lng]}
            icon={binIcon(bin.status, bin.fillLevel)}
            eventHandlers={{
              click: () => onItemSelect(bin)
            }}
          >
            <Popup>
              <div className="popup-content">
                <h3>🗑️ {bin.name}</h3>
                <p>רמת מילוי: <strong>{bin.fillLevel}%</strong></p>
                <p className={`status-badge ${bin.status}`}>
                  {bin.status === 'ok' ? 'תקין' : bin.status === 'warning' ? 'כמעט מלא' : 'מלא'}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="map-legend">
        <h4>מקרא</h4>
        <div className="legend-item">
          <span className="legend-icon station active"></span>
          <span>תחנה פעילה</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon station maintenance"></span>
          <span>תחנה בתחזוקה</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon bin ok"></span>
          <span>פח תקין</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon bin warning"></span>
          <span>פח כמעט מלא</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon bin full"></span>
          <span>פח מלא</span>
        </div>
      </div>
    </div>
  )
}

export default MapView
