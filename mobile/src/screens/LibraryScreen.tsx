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

export default function LibraryScreen() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

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
          Alert.alert('Success', `Imported ${library.data.length} songs`);
          loadSongs();
        } else {
          Alert.alert('Import Failed', result.error);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to import songs');
    } finally {
      setIsImporting(false);
    }
  };

  const playSong = async (song: Song) => {
    const success = await appleMusicService.playSong(song.apple_music_id);
    if (!success) {
      Alert.alert('Playback Error', 'Failed to play song');
    }
  };

  const renderSong = ({ item }: { item: Song }) => (
    <TouchableOpacity style={styles.songItem} onPress={() => playSong(item)}>
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
        loadSongs();
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
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={loadSongs}
        />
        
        <TouchableOpacity 
          style={styles.importButton} 
          onPress={importFromAppleMusic}
          disabled={isImporting}
        >
          <Text style={styles.importButtonText}>
            {isImporting ? 'Importing...' : 'Import Songs'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {tags.length > 0 && (
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
              {songs.length === 0 ? 'Import songs from Apple Music to get started' : 'Try adjusting your search or filters'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
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
});