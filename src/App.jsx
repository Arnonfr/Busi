import { useState, useEffect, useCallback } from 'react'
import MapView from './components/MapView'
import BusList from './components/BusList'
import './App.css'

const API_BASE = 'https://open-bus-stride-api.hasadna.org.il'

// מפעילי אוטובוסים בישראל
const OPERATORS = {
  3: { name: 'אגד', color: '#00a651' },
  5: { name: 'דן', color: '#0066b3' },
  15: { name: 'מטרופולין', color: '#e4002b' },
  18: { name: 'קווים', color: '#9b2d96' },
  25: { name: 'סופרבוס', color: '#ff6600' },
  34: { name: 'נתיב אקספרס', color: '#1e3a8a' },
  32: { name: 'אפיקים', color: '#fbbf24' },
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [buses, setBuses] = useState([])
  const [nearbyBuses, setNearbyBuses] = useState([])
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteBuses')
    return saved ? JSON.parse(saved) : []
  })
  const [userLocation, setUserLocation] = useState(null)
  const [selectedBus, setSelectedBus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // קבלת מיקום המשתמש
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          // ברירת מחדל - תל אביב
          setUserLocation({ lat: 32.0853, lng: 34.7818 })
        }
      )
    } else {
      setUserLocation({ lat: 32.0853, lng: 34.7818 })
    }
  }, [])

  // חישוב מרחק בין שתי נקודות (בק"מ)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // טעינת אוטובוסים בזמן אמת
  const fetchBuses = useCallback(async () => {
    if (!userLocation) return

    setLoading(true)
    try {
      // קבלת נסיעות שמתרחשות עכשיו
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0]

      const response = await fetch(
        `${API_BASE}/siri_vehicle_locations/list?limit=100&recorded_at_time_from=${encodeURIComponent(new Date(now - 5*60*1000).toISOString())}&recorded_at_time_to=${encodeURIComponent(now.toISOString())}`
      )

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data = await response.json()

      // עיבוד הנתונים
      const processedBuses = data.map(bus => {
        const distance = userLocation
          ? calculateDistance(userLocation.lat, userLocation.lng, bus.lat, bus.lon)
          : null

        const operator = OPERATORS[bus.operator_ref] || { name: 'אחר', color: '#666' }

        // חישוב זמן הגעה משוער (דקות)
        const etaMinutes = distance ? Math.round((distance / 30) * 60) : null

        return {
          id: bus.id || `${bus.siri_route_id}-${bus.siri_ride_id}`,
          lineNumber: bus.line_ref || bus.published_line_name || 'לא ידוע',
          routeName: bus.route_short_name || '',
          operator: operator.name,
          operatorColor: operator.color,
          operatorId: bus.operator_ref,
          lat: bus.lat,
          lng: bus.lon,
          distance: distance,
          distanceText: distance ? (distance < 1 ? `${Math.round(distance * 1000)} מטר` : `${distance.toFixed(1)} ק"מ`) : '',
          eta: etaMinutes,
          etaText: etaMinutes !== null ? (etaMinutes <= 1 ? 'מגיע עכשיו' : `${etaMinutes} דק'`) : '',
          bearing: bus.bearing,
          velocity: bus.velocity,
          recordedAt: bus.recorded_at_time
        }
      })

      // מיון לפי מרחק
      const sorted = processedBuses
        .filter(b => b.lat && b.lng)
        .sort((a, b) => (a.distance || 999) - (b.distance || 999))

      setBuses(sorted)
      setNearbyBuses(sorted.filter(b => b.distance && b.distance < 2))

    } catch (error) {
      console.error('Error fetching buses:', error)
      // נתוני דוגמה במקרה שה-API לא זמין
      const demoData = generateDemoData(userLocation)
      setBuses(demoData)
      setNearbyBuses(demoData.filter(b => b.distance < 2))
    } finally {
      setLoading(false)
    }
  }, [userLocation])

  // יצירת נתוני דוגמה
  const generateDemoData = (location) => {
    if (!location) return []

    const demoLines = [
      { lineNumber: '5', operator: 'דן', operatorColor: '#0066b3', operatorId: 5 },
      { lineNumber: '142', operator: 'מטרופולין', operatorColor: '#e4002b', operatorId: 15 },
      { lineNumber: '480', operator: 'אגד', operatorColor: '#00a651', operatorId: 3 },
      { lineNumber: '51', operator: 'דן', operatorColor: '#0066b3', operatorId: 5 },
      { lineNumber: '89', operator: 'קווים', operatorColor: '#9b2d96', operatorId: 18 },
      { lineNumber: '947', operator: 'נתיב אקספרס', operatorColor: '#1e3a8a', operatorId: 34 },
    ]

    return demoLines.map((line, i) => {
      const distance = 0.3 + Math.random() * 3
      const eta = Math.round((distance / 25) * 60)
      return {
        id: `demo-${i}`,
        lineNumber: line.lineNumber,
        routeName: '',
        operator: line.operator,
        operatorColor: line.operatorColor,
        operatorId: line.operatorId,
        lat: location.lat + (Math.random() - 0.5) * 0.03,
        lng: location.lng + (Math.random() - 0.5) * 0.03,
        distance: distance,
        distanceText: distance < 1 ? `${Math.round(distance * 1000)} מטר` : `${distance.toFixed(1)} ק"מ`,
        eta: eta,
        etaText: eta <= 1 ? 'מגיע עכשיו' : `${eta} דק'`,
        bearing: Math.random() * 360,
        velocity: 20 + Math.random() * 30
      }
    })
  }

  // הוספה/הסרה ממועדפים
  const toggleFavorite = (bus) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.lineNumber === bus.lineNumber && f.operatorId === bus.operatorId)
      const newFavs = exists
        ? prev.filter(f => !(f.lineNumber === bus.lineNumber && f.operatorId === bus.operatorId))
        : [...prev, { lineNumber: bus.lineNumber, operator: bus.operator, operatorColor: bus.operatorColor, operatorId: bus.operatorId }]
      localStorage.setItem('favoriteBuses', JSON.stringify(newFavs))
      return newFavs
    })
  }

  const isFavorite = (bus) => {
    return favorites.some(f => f.lineNumber === bus.lineNumber && f.operatorId === bus.operatorId)
  }

  useEffect(() => {
    getUserLocation()
  }, [getUserLocation])

  useEffect(() => {
    if (userLocation) {
      fetchBuses()
      const interval = setInterval(fetchBuses, 30000) // עדכון כל 30 שניות
      return () => clearInterval(interval)
    }
  }, [userLocation, fetchBuses])

  // סינון לפי חיפוש
  const filteredBuses = searchQuery
    ? buses.filter(b => b.lineNumber.includes(searchQuery) || b.operator.includes(searchQuery))
    : buses

  // קווים מועדפים עם נתונים בזמן אמת
  const favoriteBusesWithData = favorites.map(fav => {
    const liveData = buses.find(b => b.lineNumber === fav.lineNumber && b.operatorId === fav.operatorId)
    return liveData || { ...fav, distance: null, distanceText: '', eta: null, etaText: 'אין מידע' }
  })

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>מעקב אוטובוסים | Israel Bus Tracker</h1>
        <button className="location-btn" onClick={getUserLocation} title="מיקום נוכחי">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Map */}
        <MapView
          buses={filteredBuses}
          userLocation={userLocation}
          selectedBus={selectedBus}
          onBusSelect={setSelectedBus}
        />

        {/* Bus Count Badge */}
        <div className="bus-count-badge">
          {loading ? '...' : buses.length} אוטובוסים
        </div>

        {/* Bottom Panel */}
        <div className="bottom-panel">
          {/* Favorites Section (shown on home tab) */}
          {activeTab === 'home' && favoriteBusesWithData.length > 0 && (
            <div className="favorites-section">
              <h2>קווים מועדפים</h2>
              <div className="favorites-scroll">
                {favoriteBusesWithData.map((bus, i) => (
                  <div
                    key={`fav-${i}`}
                    className="favorite-card"
                    onClick={() => setSelectedBus(bus)}
                  >
                    <div className="line-badge" style={{ backgroundColor: bus.operatorColor }}>
                      {bus.lineNumber}
                    </div>
                    <div className="favorite-info">
                      <span className="operator">{bus.operator}</span>
                      <span className="distance">{bus.distanceText || '-'}</span>
                    </div>
                    <div className="eta">{bus.etaText || '-'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bus List */}
          <BusList
            buses={activeTab === 'favorites' ? favoriteBusesWithData : (activeTab === 'search' ? filteredBuses : nearbyBuses)}
            loading={loading}
            selectedBus={selectedBus}
            onBusSelect={setSelectedBus}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
            showSearch={activeTab === 'search'}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          <span>בית</span>
        </button>
        <button
          className={`nav-btn ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
          <span>מועדפים</span>
        </button>
        <button
          className={`nav-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <span>חיפוש</span>
        </button>
        <button
          className={`nav-btn ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
          <span>התראות</span>
        </button>
      </nav>
    </div>
  )
}

export default App
