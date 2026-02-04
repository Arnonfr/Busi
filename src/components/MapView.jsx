import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapView.css'

function MapView({ buses, userLocation, selectedBus, onBusSelect }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})
  const userMarkerRef = useRef(null)

  // אתחול המפה
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [32.0853, 34.7818], // תל אביב
      zoom: 14,
      zoomControl: false
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)

    // הוספת כפתור zoom
    L.control.zoom({ position: 'topright' }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // עדכון מיקום המשתמש
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return

    const map = mapInstanceRef.current

    // הסרת מרקר קודם
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current)
    }

    // יצירת אייקון מיקום משתמש
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: `
        <div class="user-marker-inner">
          <div class="user-marker-pulse"></div>
          <div class="user-marker-dot"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
      icon: userIcon,
      zIndexOffset: 1000
    }).addTo(map)

    map.setView([userLocation.lat, userLocation.lng], 15)
  }, [userLocation])

  // עדכון מרקרים של אוטובוסים
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const map = mapInstanceRef.current
    const currentMarkers = markersRef.current

    // הסרת מרקרים ישנים
    Object.keys(currentMarkers).forEach(id => {
      if (!buses.find(b => b.id === id)) {
        map.removeLayer(currentMarkers[id])
        delete currentMarkers[id]
      }
    })

    // הוספה/עדכון מרקרים
    buses.forEach(bus => {
      if (!bus.lat || !bus.lng) return

      const isSelected = selectedBus && selectedBus.id === bus.id

      const busIcon = L.divIcon({
        className: `bus-marker ${isSelected ? 'selected' : ''}`,
        html: `
          <div class="bus-marker-inner" style="background-color: ${bus.operatorColor};">
            <span class="bus-line-number">${bus.lineNumber}</span>
            <svg class="bus-icon" viewBox="0 0 24 24" width="14" height="14" fill="white">
              <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
            </svg>
          </div>
        `,
        iconSize: [48, 36],
        iconAnchor: [24, 18]
      })

      if (currentMarkers[bus.id]) {
        // עדכון מרקר קיים
        currentMarkers[bus.id].setLatLng([bus.lat, bus.lng])
        currentMarkers[bus.id].setIcon(busIcon)
      } else {
        // יצירת מרקר חדש
        const marker = L.marker([bus.lat, bus.lng], { icon: busIcon })
          .addTo(map)
          .on('click', () => onBusSelect(bus))

        marker.bindPopup(`
          <div class="bus-popup">
            <div class="popup-header" style="background-color: ${bus.operatorColor}">
              <span class="popup-line">קו ${bus.lineNumber}</span>
            </div>
            <div class="popup-content">
              <div class="popup-operator">${bus.operator}</div>
              <div class="popup-info">
                <span class="popup-distance">${bus.distanceText}</span>
                <span class="popup-eta">${bus.etaText}</span>
              </div>
            </div>
          </div>
        `, { className: 'bus-popup-container' })

        currentMarkers[bus.id] = marker
      }
    })

    markersRef.current = currentMarkers
  }, [buses, selectedBus, onBusSelect])

  // התמקדות באוטובוס נבחר
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedBus || !selectedBus.lat) return
    mapInstanceRef.current.setView([selectedBus.lat, selectedBus.lng], 16)
  }, [selectedBus])

  return <div ref={mapRef} className="map-container" />
}

export default MapView
