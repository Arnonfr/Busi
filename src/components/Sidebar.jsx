import './Sidebar.css'

function Sidebar({ stations, bins, selectedItem, onItemSelect, filter, onFilterChange }) {
  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filter, [key]: value })
  }

  const getStatusText = (item) => {
    if (item.type === 'station') {
      return item.status === 'active' ? 'פעיל' : 'בתחזוקה'
    }
    return item.status === 'ok' ? 'תקין' : item.status === 'warning' ? 'כמעט מלא' : 'מלא'
  }

  return (
    <aside className="sidebar">
      {/* Filters Section */}
      <div className="sidebar-section">
        <h2>🔍 סינון תצוגה</h2>
        <div className="filter-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filter.showStations}
              onChange={(e) => handleFilterChange('showStations', e.target.checked)}
            />
            <span>הצג תחנות</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filter.showBins}
              onChange={(e) => handleFilterChange('showBins', e.target.checked)}
            />
            <span>הצג פחים</span>
          </label>
        </div>

        <div className="filter-group">
          <label>סטטוס פחים:</label>
          <select
            value={filter.statusFilter}
            onChange={(e) => handleFilterChange('statusFilter', e.target.value)}
          >
            <option value="all">הכל</option>
            <option value="ok">תקין</option>
            <option value="warning">כמעט מלא</option>
            <option value="full">מלא</option>
          </select>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="sidebar-section stats">
        <h2>📊 סטטיסטיקות</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stations.length}</span>
            <span className="stat-label">תחנות</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{bins.length}</span>
            <span className="stat-label">פחים</span>
          </div>
          <div className="stat-card warning">
            <span className="stat-value">{bins.filter(b => b.status === 'full').length}</span>
            <span className="stat-label">פחים מלאים</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stations.filter(s => s.status === 'active').length}</span>
            <span className="stat-label">תחנות פעילות</span>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="sidebar-section items-list">
        <h2>📍 רשימת מיקומים</h2>

        <div className="items-category">
          <h3>🚏 תחנות</h3>
          {stations.map(station => (
            <div
              key={station.id}
              className={`item-card ${selectedItem?.id === station.id ? 'selected' : ''}`}
              onClick={() => onItemSelect(station)}
            >
              <div className="item-info">
                <span className="item-name">{station.name}</span>
                <span className={`item-status ${station.status}`}>
                  {getStatusText(station)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="items-category">
          <h3>🗑️ פחים</h3>
          {bins.map(bin => (
            <div
              key={bin.id}
              className={`item-card ${selectedItem?.id === bin.id ? 'selected' : ''}`}
              onClick={() => onItemSelect(bin)}
            >
              <div className="item-info">
                <span className="item-name">{bin.name}</span>
                <div className="item-details">
                  <span className={`item-status ${bin.status}`}>
                    {getStatusText(bin)}
                  </span>
                  <span className="fill-level">{bin.fillLevel}%</span>
                </div>
              </div>
              <div className="fill-bar">
                <div
                  className={`fill-progress ${bin.status}`}
                  style={{ width: `${bin.fillLevel}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
