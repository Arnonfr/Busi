import { useState } from 'react'
import MapView from './components/MapView'
import Sidebar from './components/Sidebar'
import './App.css'

// נתוני תחנות לדוגמה
const initialStations = [
  { id: 1, name: 'תחנה מרכזית תל אביב', lat: 32.0561, lng: 34.7817, type: 'station', status: 'active' },
  { id: 2, name: 'תחנת רכבת השלום', lat: 32.0725, lng: 34.7925, type: 'station', status: 'active' },
  { id: 3, name: 'תחנת סבידור', lat: 32.0855, lng: 34.7811, type: 'station', status: 'maintenance' },
  { id: 4, name: 'תחנת אוניברסיטה', lat: 32.1133, lng: 34.8044, type: 'station', status: 'active' },
]

// נתוני פחים לדוגמה
const initialBins = [
  { id: 101, name: 'פח רחוב דיזנגוף 50', lat: 32.0751, lng: 34.7744, type: 'bin', fillLevel: 75, status: 'warning' },
  { id: 102, name: 'פח כיכר רבין', lat: 32.0804, lng: 34.7810, type: 'bin', fillLevel: 30, status: 'ok' },
  { id: 103, name: 'פח שדרות רוטשילד', lat: 32.0633, lng: 34.7728, type: 'bin', fillLevel: 90, status: 'full' },
  { id: 104, name: 'פח פארק הירקון', lat: 32.0994, lng: 34.8103, type: 'bin', fillLevel: 45, status: 'ok' },
  { id: 105, name: 'פח נמל תל אביב', lat: 32.0972, lng: 34.7714, type: 'bin', fillLevel: 60, status: 'ok' },
  { id: 106, name: 'פח שוק הכרמל', lat: 32.0678, lng: 34.7700, type: 'bin', fillLevel: 95, status: 'full' },
]

function App() {
  const [stations] = useState(initialStations)
  const [bins] = useState(initialBins)
  const [selectedItem, setSelectedItem] = useState(null)
  const [filter, setFilter] = useState({ showStations: true, showBins: true, statusFilter: 'all' })

  const handleItemSelect = (item) => {
    setSelectedItem(item)
  }

  const filteredStations = filter.showStations ? stations : []
  const filteredBins = filter.showBins
    ? bins.filter(bin => filter.statusFilter === 'all' || bin.status === filter.statusFilter)
    : []

  return (
    <div className="app">
      <header className="header">
        <h1>🚌 Busi - מערכת מעקב תחנות ופחים</h1>
      </header>
      <div className="main-content">
        <Sidebar
          stations={stations}
          bins={bins}
          selectedItem={selectedItem}
          onItemSelect={handleItemSelect}
          filter={filter}
          onFilterChange={setFilter}
        />
        <MapView
          stations={filteredStations}
          bins={filteredBins}
          selectedItem={selectedItem}
          onItemSelect={handleItemSelect}
        />
      </div>
    </div>
  )
}

export default App
