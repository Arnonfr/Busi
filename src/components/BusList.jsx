import './BusList.css'

function BusList({
  buses,
  loading,
  selectedBus,
  onBusSelect,
  onToggleFavorite,
  isFavorite,
  showSearch,
  searchQuery,
  onSearchChange
}) {
  if (loading) {
    return (
      <div className="bus-list">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>טוען אוטובוסים...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bus-list">
      {showSearch && (
        <div className="search-bar">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#718096" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder="חפש קו או מפעיל..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}

      {buses.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48">
            <path fill="#cbd5e0" d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
          </svg>
          <span>לא נמצאו אוטובוסים בקרבת מקום</span>
        </div>
      ) : (
        <div className="buses-scroll">
          {buses.map((bus, i) => (
            <div
              key={bus.id || i}
              className={`bus-card ${selectedBus?.id === bus.id ? 'selected' : ''}`}
              onClick={() => onBusSelect(bus)}
            >
              <div className="bus-card-main">
                <div
                  className="bus-line-badge"
                  style={{ backgroundColor: bus.operatorColor }}
                >
                  {bus.lineNumber}
                </div>
                <div className="bus-details">
                  <span className="bus-operator">{bus.operator}</span>
                  <span className="bus-distance">{bus.distanceText || '-'}</span>
                </div>
                <div className="bus-eta-container">
                  <span className={`bus-eta ${bus.eta <= 2 ? 'arriving' : ''}`}>
                    {bus.etaText || '-'}
                  </span>
                </div>
                <button
                  className={`favorite-btn ${isFavorite(bus) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite(bus)
                  }}
                  title={isFavorite(bus) ? 'הסר ממועדפים' : 'הוסף למועדפים'}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    {isFavorite(bus) ? (
                      <path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    ) : (
                      <path fill="currentColor" d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/>
                    )}
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BusList
