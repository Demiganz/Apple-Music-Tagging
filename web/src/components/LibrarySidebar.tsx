import { useState } from 'react';
import './LibrarySidebar.css';

export type ViewMode = 'songs' | 'albums' | 'artists' | 'album-detail' | 'artist-detail';

interface LibrarySidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  currentSelection?: {
    type: 'album' | 'artist';
    name: string;
    artist?: string; // For album detail view
  };
  onBackToList?: () => void;
  onCollapseChange?: (isCollapsed: boolean) => void;
}

export default function LibrarySidebar({ 
  currentView, 
  onViewChange, 
  currentSelection,
  onBackToList,
  onCollapseChange
}: LibrarySidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isDetailView = currentView === 'album-detail' || currentView === 'artist-detail';

  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onCollapseChange) {
      onCollapseChange(newCollapsedState);
    }
  };

  return (
    <div className={`library-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="collapse-button" onClick={toggleSidebar}>
          {isCollapsed ? '→' : '←'}
        </button>
        {!isCollapsed && <h3>Library</h3>}
      </div>
      
      {!isCollapsed && (
        <>
          {isDetailView && currentSelection ? (
            <div className="sidebar-detail">
              <button className="back-button" onClick={onBackToList}>
                ← Back to {currentSelection.type === 'album' ? 'Albums' : 'Artists'}
              </button>
              <div className="current-selection">
                <h4>{currentSelection.name}</h4>
                {currentSelection.artist && (
                  <p className="selection-artist">by {currentSelection.artist}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="sidebar-navigation">
              <button 
                className={`nav-item ${currentView === 'songs' ? 'active' : ''}`}
                onClick={() => onViewChange('songs')}
              >
                <span className="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18V5l12-2v13M9 18c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zM21 16c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="nav-label">Songs</span>
              </button>
              
              <button 
                className={`nav-item ${currentView === 'albums' ? 'active' : ''}`}
                onClick={() => onViewChange('albums')}
              >
                <span className="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </span>
                <span className="nav-label">Albums</span>
              </button>
              
              <button 
                className={`nav-item ${currentView === 'artists' ? 'active' : ''}`}
                onClick={() => onViewChange('artists')}
              >
                <span className="nav-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="nav-label">Artists</span>
              </button>
            </div>
          )}
        </>
      )}
      
      {isCollapsed && (
        <div className="sidebar-navigation-collapsed">
          <button 
            className={`nav-item-collapsed ${currentView === 'songs' ? 'active' : ''}`}
            onClick={() => onViewChange('songs')}
            title="Songs"
          >
            <span className="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18V5l12-2v13M9 18c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zM21 16c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
          
          <button 
            className={`nav-item-collapsed ${currentView === 'albums' ? 'active' : ''}`}
            onClick={() => onViewChange('albums')}
            title="Albums"
          >
            <span className="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
          </button>
          
          <button 
            className={`nav-item-collapsed ${currentView === 'artists' ? 'active' : ''}`}
            onClick={() => onViewChange('artists')}
            title="Artists"
          >
            <span className="nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}