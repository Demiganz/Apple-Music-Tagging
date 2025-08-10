import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { appleMusicService } from '../services/appleMusicService';
import TagAssignmentModal from './TagAssignmentModal';
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
}

export default function LibraryPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showTagModal, setShowTagModal] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([loadSongs(), loadTags()]);
    setIsLoading(false);
  };

  const loadSongs = async () => {
    const result = await apiClient.getSongs({
      search: searchQuery,
      tags: selectedTags.join(','),
    });

    if (result.success) {
      setSongs(result.data.songs);
    }
  };

  const loadTags = async () => {
    const result = await apiClient.getTags();
    if (result.success) {
      setTags(result.data);
    }
  };

  const importFromAppleMusic = async () => {
    setIsImporting(true);
    try {
      const library = await appleMusicService.getUserLibrary(0, 100);
      if (library && library.data) {
        const result = await apiClient.importSongs(library.data);
        if (result.success) {
          alert(`Imported ${library.data.length} songs successfully!`);
          loadSongs();
        } else {
          alert(`Import failed: ${result.error}`);
        }
      } else {
        alert('No songs found in your Apple Music library');
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
      alert('Failed to play song. Make sure you have Apple Music subscription.');
    }
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
  };

  const toggleTagFilter = (tagName: string) => {
    const newSelectedTags = selectedTags.includes(tagName)
      ? selectedTags.filter(t => t !== tagName)
      : [...selectedTags, tagName];
    setSelectedTags(newSelectedTags);
    // Reload songs with new filter
    setTimeout(loadSongs, 100);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadSongs();
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
    <div className="library-container">
      <div className="library-header">
        <h1>Your Music Library</h1>
        
        <div className="library-controls">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">Search</button>
          </form>
          
          <button 
            className="import-button"
            onClick={importFromAppleMusic}
            disabled={isImporting}
          >
            {isImporting ? 'Importing...' : 'Import from Apple Music'}
          </button>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="tags-filter">
          <h3>Filter by tags:</h3>
          <div className="tag-filters">
            {tags.map(tag => (
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

      <div className="songs-grid">
        {songs.length === 0 ? (
          <div className="empty-state">
            <h3>No songs found</h3>
            <p>
              {songs.length === 0 && selectedTags.length === 0 && !searchQuery 
                ? 'Import songs from Apple Music to get started' 
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
                  <div className="no-artwork">♪</div>
                )}
              </div>
              <div className="song-info">
                <h4 className="song-title">{song.title}</h4>
                <p className="song-artist">{song.artist}</p>
                <p className="song-album">{song.album}</p>
                {song.tags && song.tags.length > 0 && (
                  <div className="song-tags">
                    {song.tags.map((tag, index) => (
                      <span key={index} className="song-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button 
                className="tag-button"
                onClick={(e) => openTagModal(song, e)}
                title="Manage tags"
              >
                🏷️
              </button>
            </div>
          ))
        )}
      </div>

      <TagAssignmentModal
        isOpen={showTagModal}
        song={selectedSong}
        onClose={closeTagModal}
        onTagsUpdated={handleTagsUpdated}
      />
    </div>
  );
}