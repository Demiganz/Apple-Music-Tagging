import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { appleMusicService } from '../services/appleMusicService';
import TagAssignmentModal from './TagAssignmentModal';
import LibrarySidebar, { ViewMode } from './LibrarySidebar';
import './LibraryPage.css';

interface Song {
  id: number;
  apple_music_id: string;
  title: string;
  artist: string;
  album: string;
  artwork_url: string;
  tags: string[];
}

interface Tag {
  id: number;
  name: string;
  color: string;
  song_count: number;
  is_visible?: boolean;
}

interface Album {
  name: string;
  artist: string;
  song_count: number;
  artwork_urls: string[];
}

interface Artist {
  name: string;
  song_count: number;
  artwork_urls: string[];
}

export default function LibraryPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showTagModal, setShowTagModal] = useState(false);
  
  // New organizational state
  const [currentView, setCurrentView] = useState<ViewMode>('songs');
  const [currentSelection, setCurrentSelection] = useState<{
    type: 'album' | 'artist';
    name: string;
    artist?: string;
  } | undefined>(undefined);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const loadSongs = async () => {
    try {
      const result = await apiClient.getSongs({
        search: searchQuery,
        tags: selectedTags.join(','),
      });

      if (result.success) {
        setSongs(result.data.songs);
      } else {
        console.error('Failed to load songs:', result.error);
      }
    } catch (error) {
      console.error('Error loading songs:', error);
    }
  };

  const loadTags = async () => {
    try {
      const result = await apiClient.getTags();
      if (result.success) {
        setTags(result.data);
      } else {
        console.error('Failed to load tags:', result.error);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const loadAlbums = async () => {
    try {
      const result = await apiClient.getOrganizedData('albums');
      if (result.success) {
        setAlbums(result.data);
      } else {
        console.error('Failed to load albums:', result.error);
      }
    } catch (error) {
      console.error('Error loading albums:', error);
    }
  };

  const loadArtists = async () => {
    try {
      const result = await apiClient.getOrganizedData('artists');
      if (result.success) {
        setArtists(result.data);
      } else {
        console.error('Failed to load artists:', result.error);
      }
    } catch (error) {
      console.error('Error loading artists:', error);
    }
  };

  const loadSongsByCategory = async (type: 'album' | 'artist', name: string, artist?: string) => {
    try {
      const result = await apiClient.getSongsByCategory(type, name, artist);
      if (result.success) {
        setSongs(result.data.songs);
      } else {
        console.error(`Failed to load songs by ${type}:`, result.error);
      }
    } catch (error) {
      console.error(`Error loading songs by ${type}:`, error);
    }
  };

  const loadInitialData = async () => {
    try {
      await Promise.all([loadSongs(), loadTags(), loadAlbums(), loadArtists()]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
    setCurrentSelection(undefined);
    setSearchQuery(''); // Clear search when switching views
    setSelectedTags([]); // Clear tag filters when switching views
    
    if (view === 'songs') {
      loadSongs();
    }
    // Albums and artists are already loaded from initial data
  };

  const handleAlbumClick = (album: Album) => {
    setCurrentView('album-detail');
    setCurrentSelection({
      type: 'album',
      name: album.name,
      artist: album.artist
    });
    loadSongsByCategory('album', album.name, album.artist);
  };

  const handleArtistClick = (artist: Artist) => {
    setCurrentView('artist-detail');
    setCurrentSelection({
      type: 'artist',
      name: artist.name
    });
    loadSongsByCategory('artist', artist.name);
  };

  const handleBackToList = () => {
    if (currentView === 'album-detail') {
      setCurrentView('albums');
    } else if (currentView === 'artist-detail') {
      setCurrentView('artists');
    }
    setCurrentSelection(undefined);
  };

  useEffect(() => {
    loadInitialData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load songs when search query or selected tags change (only for songs view)
  useEffect(() => {
    if (!isLoading && currentView === 'songs') {
      loadSongs();
    }
  }, [searchQuery, selectedTags, currentView]); // eslint-disable-line react-hooks/exhaustive-deps

  const importFromAppleMusic = async () => {
    setIsImporting(true);
    try {
      const library = await appleMusicService.getUserLibrary(0, 100);
      if (library && library.data) {
        const result = await apiClient.importSongs(library.data);
        if (result.success) {
          alert(`Library refreshed! Found ${library.data.length} songs.`);
          // Refresh all data after import
          loadSongs();
          loadAlbums();
          loadArtists();
        } else {
          alert(`Import failed: ${result.error}`);
        }
      } else {
        alert('No new songs found in your Apple Music library.');
      }
    } catch (error) {
      alert('Failed to import songs');
    } finally {
      setIsImporting(false);
    }
  };

  const playSong = async (song: Song) => {
    const success = await appleMusicService.playSong(song.apple_music_id);
    if (!success) {
      alert('Failed to play song. In mock mode, songs should open in YouTube.');
    }
  };

  const getTagColor = (tagName: string): string | null => {
    const tag = tags.find(t => t.name === tagName);
    return tag?.color || null;
  };

  const isTagFiltered = (tagName: string): boolean => {
    return selectedTags.includes(tagName);
  };

  const openTagModal = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent song from playing
    setSelectedSong(song);
    setShowTagModal(true);
  };

  const closeTagModal = () => {
    setShowTagModal(false);
    setSelectedSong(null);
  };

  const handleTagsUpdated = () => {
    loadSongs(); // Refresh the songs list
    loadTags(); // Refresh the tags list with updated counts
  };

  const toggleTagFilter = (tagName: string) => {
    const newSelectedTags = selectedTags.includes(tagName)
      ? selectedTags.filter(t => t !== tagName)
      : [...selectedTags, tagName];
    setSelectedTags(newSelectedTags);
    // Don't call loadSongs() here - the useEffect will handle it
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The useEffect will handle calling loadSongs() when searchQuery changes
  };

  const renderSongsView = () => (
    <div className="songs-grid">
      {songs.length === 0 ? (
        <div className="empty-state">
          <h3>No songs found</h3>
          <p>
{songs.length === 0 && selectedTags.length === 0 && !searchQuery 
              ? 'No songs in your library yet. Try refreshing your library or check your Apple Music account.' 
              : 'Try adjusting your search or filters'}
          </p>
        </div>
      ) : (
        songs.map(song => (
          <div key={song.id} className="song-card" onClick={() => playSong(song)}>
            <div className="song-artwork">
              {song.artwork_url ? (
                <img 
                  src={song.artwork_url.replace('{w}x{h}', '200x200')} 
                  alt={`${song.title} artwork`}
                />
              ) : (
                <div className="no-artwork">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18V5l12-2v13M9 18c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zM21 16c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
            <div className="song-info">
              <h4 className="song-title">{song.title}</h4>
              <p className="song-artist">{song.artist}</p>
              <p className="song-album">{song.album}</p>
              {song.tags && song.tags.length > 0 && (
                <div className="song-tags">
                  {song.tags.map((tag, index) => {
                    const tagColor = getTagColor(tag);
                    const isFiltered = isTagFiltered(tag);
                    return (
                      <span 
                        key={index} 
                        className={`song-tag ${isFiltered ? 'song-tag-filtered' : ''}`}
                        style={isFiltered && tagColor ? { 
                          backgroundColor: tagColor,
                          color: 'white',
                          fontWeight: 'bold'
                        } : {}}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            <button 
              className="tag-button"
              onClick={(e) => openTagModal(song, e)}
              title="Manage tags"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        ))
      )}
    </div>
  );

  const renderAlbumsView = () => {
    const filteredAlbums = albums.filter(album => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return album.name.toLowerCase().includes(searchLower) || 
             album.artist.toLowerCase().includes(searchLower);
    });

    return (
      <div className="albums-grid">
        {filteredAlbums.length === 0 ? (
          <div className="empty-state">
            <h3>No albums found</h3>
            <p>
{albums.length === 0 
                ? 'No albums found. Try refreshing your library or check your Apple Music account.'
                : 'Try adjusting your search query'}
            </p>
          </div>
        ) : (
          filteredAlbums.map((album, index) => (
            <div key={`${album.name}-${album.artist}-${index}`} className="album-card" onClick={() => handleAlbumClick(album)}>
              <div className="album-artwork">
                {album.artwork_urls.length > 0 ? (
                  <img 
                    src={album.artwork_urls[0].replace('{w}x{h}', '200x200')} 
                    alt={`${album.name} artwork`}
                  />
                ) : (
                  <div className="no-artwork">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="album-info">
                <h4 className="album-title">{album.name}</h4>
                <p className="album-artist">{album.artist}</p>
                <p className="album-song-count">{album.song_count} songs</p>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderArtistsView = () => {
    const filteredArtists = artists.filter(artist => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return artist.name.toLowerCase().includes(searchLower);
    });

    return (
      <div className="artists-grid">
        {filteredArtists.length === 0 ? (
          <div className="empty-state">
            <h3>No artists found</h3>
            <p>
{artists.length === 0 
                ? 'No artists found. Try refreshing your library or check your Apple Music account.'
                : 'Try adjusting your search query'}
            </p>
          </div>
        ) : (
          filteredArtists.map((artist, index) => (
            <div key={`${artist.name}-${index}`} className="artist-card" onClick={() => handleArtistClick(artist)}>
              <div className="artist-artwork">
                {artist.artwork_urls.length > 0 ? (
                  <img 
                    src={artist.artwork_urls[0].replace('{w}x{h}', '200x200')} 
                    alt={`${artist.name} artwork`}
                  />
                ) : (
                  <div className="no-artwork">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="artist-info">
                <h4 className="artist-name">{artist.name}</h4>
                <p className="artist-song-count">{artist.song_count} songs</p>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'albums':
        return renderAlbumsView();
      case 'artists':
        return renderArtistsView();
      case 'album-detail':
      case 'artist-detail':
        return renderSongsView(); // Show songs for selected album/artist
      case 'songs':
      default:
        return renderSongsView();
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'albums':
        return 'Albums';
      case 'artists':
        return 'Artists';
      case 'album-detail':
        return currentSelection ? `Songs in "${currentSelection.name}"` : 'Album Songs';
      case 'artist-detail':
        return currentSelection ? `Songs by ${currentSelection.name}` : 'Artist Songs';
      case 'songs':
      default:
        return 'Songs';
    }
  };

  const shouldShowFilters = () => {
    return currentView === 'songs' || currentView === 'album-detail' || currentView === 'artist-detail';
  };

  const shouldShowSearch = () => {
    return currentView === 'songs' || currentView === 'albums' || currentView === 'artists' || currentView === 'album-detail' || currentView === 'artist-detail';
  };

  const getSearchPlaceholder = () => {
    switch (currentView) {
      case 'albums':
        return 'Search albums...';
      case 'artists':
        return 'Search artists...';
      case 'album-detail':
      case 'artist-detail':
      case 'songs':
      default:
        return 'Search songs...';
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your music library...</p>
      </div>
    );
  }

  return (
    <div className="library-layout">
      <LibrarySidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        currentSelection={currentSelection}
        onBackToList={handleBackToList}
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <div className={`library-main ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="library-header">
          <h1>{getViewTitle()}</h1>
          
          <div className="library-controls">
            {shouldShowSearch() && (
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder={getSearchPlaceholder()}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-button">Search</button>
              </form>
            )}
            
            <button 
              className="import-button"
              onClick={importFromAppleMusic}
              disabled={isImporting}
            >
              {isImporting ? 'Refreshing...' : 'Refresh Library'}
            </button>
          </div>
        </div>

        {shouldShowFilters() && tags.filter(tag => tag.is_visible !== false).length > 0 && (
          <div className="tags-filter">
            <h3>Filter by tags:</h3>
            <div className="tag-filters">
              {tags.filter(tag => tag.is_visible !== false).map(tag => (
                <button
                  key={tag.id}
                  className={`tag-filter ${selectedTags.includes(tag.name) ? 'active' : ''}`}
                  style={{ backgroundColor: selectedTags.includes(tag.name) ? tag.color : '#f0f0f0' }}
                  onClick={() => toggleTagFilter(tag.name)}
                >
                  {tag.name} ({tag.song_count})
                </button>
              ))}
            </div>
          </div>
        )}

        {renderContent()}

        <TagAssignmentModal
          isOpen={showTagModal}
          song={selectedSong}
          onClose={closeTagModal}
          onTagsUpdated={handleTagsUpdated}
        />
      </div>
    </div>
  );
}