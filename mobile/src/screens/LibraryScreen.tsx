import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { apiClient } from '../services/apiClient';
import { appleMusicService } from '../services/appleMusicService';
import TagAssignmentModal from '../components/TagAssignmentModal';
import LibrarySidebar, { ViewMode } from '../components/LibrarySidebar';

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

export default function LibraryScreen() {
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

  const loadAlbums = async () => {
    const result = await apiClient.getOrganizedData('albums');
    if (result.success) {
      setAlbums(result.data);
    }
  };

  const loadArtists = async () => {
    const result = await apiClient.getOrganizedData('artists');
    if (result.success) {
      setArtists(result.data);
    }
  };

  const loadSongsByCategory = async (type: 'album' | 'artist', name: string, artist?: string) => {
    const result = await apiClient.getSongsByCategory(type, name, artist);
    if (result.success) {
      setSongs(result.data.songs);
    }
  };

  const loadInitialData = async () => {
    await Promise.all([loadSongs(), loadTags(), loadAlbums(), loadArtists()]);
    setIsLoading(false);
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

  const importFromAppleMusic = async () => {
    setIsImporting(true);
    try {
      const library = await appleMusicService.getUserLibrary(0, 100);
      if (library && library.data) {
        const result = await apiClient.importSongs(library.data);
        if (result.success) {
          Alert.alert('Library Refreshed', `Found ${library.data.length} songs in your library.`);
          // Refresh all data after import
          loadSongs();
          loadAlbums();
          loadArtists();
        } else {
          Alert.alert('Refresh Failed', result.error);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh library');
    } finally {
      setIsImporting(false);
    }
  };

  const playSong = async (song: Song) => {
    const success = await appleMusicService.playSong(song.apple_music_id);
    if (!success) {
      Alert.alert('Playback Error', 'Failed to play song. In mock mode, songs should show YouTube links.');
    }
  };

  const openTagModal = (song: Song) => {
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

  const renderSong = ({ item }: { item: Song }) => (
    <View style={styles.songItem}>
      <TouchableOpacity 
        style={styles.songContent} 
        onPress={() => playSong(item)}
      >
        {item.artwork_url && (
          <Image 
            source={{ uri: item.artwork_url.replace('{w}x{h}', '60x60') }} 
            style={styles.artwork}
          />
        )}
        <View style={styles.songInfo}>
          <Text style={styles.songTitle}>{item.title}</Text>
          <Text style={styles.songArtist}>{item.artist}</Text>
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.tagButton}
        onPress={() => openTagModal(item)}
      >
                        <Text style={styles.tagButtonText}>⚹</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTagFilter = ({ item }: { item: Tag }) => (
    <TouchableOpacity
      style={[
        styles.filterTag,
        selectedTags.includes(item.name) && styles.filterTagSelected
      ]}
      onPress={() => {
        const newSelectedTags = selectedTags.includes(item.name)
          ? selectedTags.filter(t => t !== item.name)
          : [...selectedTags, item.name];
        setSelectedTags(newSelectedTags);
        // Don't call loadSongs() here - the useEffect will handle it
      }}
    >
      <Text style={[
        styles.filterTagText,
        selectedTags.includes(item.name) && styles.filterTagTextSelected
      ]}>
        {item.name} ({item.song_count})
      </Text>
    </TouchableOpacity>
  );

  const renderAlbum = ({ item }: { item: Album }) => (
    <TouchableOpacity style={styles.albumItem} onPress={() => handleAlbumClick(item)}>
      <View style={styles.albumArtwork}>
        {item.artwork_urls.length > 0 ? (
          <Image 
            source={{ uri: item.artwork_urls[0].replace('{w}x{h}', '120x120') }} 
            style={styles.albumImage}
          />
        ) : (
          <View style={styles.noArtwork}>
                            <Text style={styles.noArtworkText}>⚬</Text>
          </View>
        )}
      </View>
      <View style={styles.albumInfo}>
        <Text style={styles.albumTitle}>{item.name}</Text>
        <Text style={styles.albumArtist}>{item.artist}</Text>
        <Text style={styles.albumSongCount}>{item.song_count} songs</Text>
      </View>
    </TouchableOpacity>
  );

  const renderArtist = ({ item }: { item: Artist }) => (
    <TouchableOpacity style={styles.artistItem} onPress={() => handleArtistClick(item)}>
      <View style={styles.artistArtwork}>
        {item.artwork_urls.length > 0 ? (
          <Image 
            source={{ uri: item.artwork_urls[0].replace('{w}x{h}', '80x80') }} 
            style={styles.artistImage}
          />
        ) : (
          <View style={styles.noArtwork}>
                            <Text style={styles.noArtworkText}>♂</Text>
          </View>
        )}
      </View>
      <View style={styles.artistInfo}>
        <Text style={styles.artistName}>{item.name}</Text>
        <Text style={styles.artistSongCount}>{item.song_count} songs</Text>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'albums':
        const filteredAlbums = albums.filter(album => {
          if (!searchQuery) return true;
          const searchLower = searchQuery.toLowerCase();
          return album.name.toLowerCase().includes(searchLower) || 
                 album.artist.toLowerCase().includes(searchLower);
        });
        return (
          <FlatList
            data={filteredAlbums}
            renderItem={renderAlbum}
            keyExtractor={(item, index) => `${item.name}-${item.artist}-${index}`}
            numColumns={2}
            columnWrapperStyle={styles.albumRow}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No albums found</Text>
                <Text style={styles.emptySubtext}>
{albums.length === 0 
                    ? 'No albums found. Try refreshing your library or check your Apple Music account.'
                    : 'Try adjusting your search query'}
                </Text>
              </View>
            }
          />
        );
      case 'artists':
        const filteredArtists = artists.filter(artist => {
          if (!searchQuery) return true;
          const searchLower = searchQuery.toLowerCase();
          return artist.name.toLowerCase().includes(searchLower);
        });
        return (
          <FlatList
            data={filteredArtists}
            renderItem={renderArtist}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No artists found</Text>
                <Text style={styles.emptySubtext}>
{artists.length === 0 
                    ? 'No artists found. Try refreshing your library or check your Apple Music account.'
                    : 'Try adjusting your search query'}
                </Text>
              </View>
            }
          />
        );
      case 'album-detail':
      case 'artist-detail':
      case 'songs':
      default:
        return (
          <FlatList
            data={songs}
            renderItem={renderSong}
            keyExtractor={(item) => item.id.toString()}
            refreshing={isLoading}
            onRefresh={loadInitialData}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No songs found</Text>
                <Text style={styles.emptySubtext}>
{songs.length === 0 && selectedTags.length === 0 && !searchQuery 
                    ? 'No songs in your library yet. Try refreshing your library or check your Apple Music account.' 
                    : 'Try adjusting your search or filters'}
                </Text>
              </View>
            }
          />
        );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading your music library...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LibrarySidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        currentSelection={currentSelection}
        onBackToList={handleBackToList}
        onCollapseChange={setIsSidebarCollapsed}
      />
      
      <View style={[styles.mainContent, isSidebarCollapsed && styles.mainContentCollapsed]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{getViewTitle()}</Text>
          
          {shouldShowSearch() && (
            <TextInput
              style={styles.searchInput}
              placeholder={getSearchPlaceholder()}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => {}} // The useEffect will handle the search
            />
          )}
          
          <TouchableOpacity 
            style={styles.importButton} 
            onPress={importFromAppleMusic}
            disabled={isImporting}
          >
            <Text style={styles.importButtonText}>
              {isImporting ? 'Refreshing...' : 'Refresh Library'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {shouldShowFilters() && tags.length > 0 && (
          <View style={styles.tagsFilterContainer}>
            <Text style={styles.filterLabel}>Filter by tags:</Text>
            <FlatList
              horizontal
              data={tags}
              renderItem={renderTagFilter}
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        {renderContent()}

        <TagAssignmentModal
          visible={showTagModal}
          song={selectedSong}
          onClose={closeTagModal}
          onTagsUpdated={handleTagsUpdated}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
    marginLeft: 250,
  },
  mainContentCollapsed: {
    marginLeft: 70,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  searchInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 10,
  },
  importButton: {
    backgroundColor: '#34C759',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  importButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tagsFilterContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  filterTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterTagSelected: {
    backgroundColor: '#007AFF',
  },
  filterTagText: {
    fontSize: 12,
    color: '#333',
  },
  filterTagTextSelected: {
    color: 'white',
  },
  songItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  songContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tagButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagButtonText: {
    fontSize: 16,
  },
  artwork: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  songArtist: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 4,
    marginTop: 2,
  },
  tagText: {
    fontSize: 10,
    color: '#1976d2',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  // Album styles
  albumRow: {
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  albumItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '45%',
  },
  albumArtwork: {
    alignItems: 'center',
    marginBottom: 10,
  },
  albumImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  noArtwork: {
    width: 120,
    height: 120,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noArtworkText: {
    fontSize: 40,
  },
  albumInfo: {
    alignItems: 'center',
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  albumSongCount: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  // Artist styles
  artistItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  artistArtwork: {
    marginRight: 15,
  },
  artistImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  artistSongCount: {
    fontSize: 14,
    color: '#666',
  },
});