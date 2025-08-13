import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { apiClient } from '../services/apiClient';

interface Song {
  id: number;
  title: string;
  artist: string;
  tags: string[];
}

interface Tag {
  id: number;
  name: string;
  color: string;
  song_count: number;
  is_visible?: boolean;
}

interface TagAssignmentModalProps {
  visible: boolean;
  song: Song | null;
  onClose: () => void;
  onTagsUpdated: () => void;
}

export default function TagAssignmentModal({ 
  visible, 
  song, 
  onClose, 
  onTagsUpdated 
}: TagAssignmentModalProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [assignedTags, setAssignedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible && song) {
      loadTags();
      setAssignedTags(song.tags || []);
    }
  }, [visible, song]);

  const loadTags = async () => {
    setIsLoading(true);
    try {
      const result = await apiClient.getTags();
      if (result.success) {
        setTags(result.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load tags');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTag = async (tag: Tag) => {
    if (!song) return;

    const isAssigned = assignedTags.includes(tag.name);
    setIsSaving(true);

    try {
      if (isAssigned) {
        // Remove tag
        const result = await apiClient.removeTag(song.id, tag.id);
        if (result.success) {
          setAssignedTags(prev => prev.filter(t => t !== tag.name));
        } else {
          Alert.alert('Error', result.error);
        }
      } else {
        // Assign tag
        const result = await apiClient.assignTag(song.id, tag.id);
        if (result.success) {
          setAssignedTags(prev => [...prev, tag.name]);
        } else {
          Alert.alert('Error', result.error);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update tag');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    onTagsUpdated(); // Refresh the parent list
    onClose();
  };

  if (!song) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.songInfo}>
              <Text style={styles.songTitle}>{song.title}</Text>
              <Text style={styles.songArtist}>{song.artist}</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Assign Tags</Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text>Loading tags...</Text>
            </View>
          ) : (
            <ScrollView style={styles.tagsContainer}>
              {tags.map(tag => {
                const isAssigned = assignedTags.includes(tag.name);
                return (
                  <TouchableOpacity
                    key={tag.id}
                    style={[
                      styles.tagItem,
                      isAssigned && styles.tagItemSelected,
                      isSaving && styles.tagItemDisabled
                    ]}
                    onPress={() => toggleTag(tag)}
                    disabled={isSaving}
                  >
                    <View style={styles.tagContent}>
                      <View 
                        style={[
                          styles.tagColor, 
                          { backgroundColor: tag.color }
                        ]} 
                      />
                      <Text style={[
                        styles.tagName,
                        isAssigned && styles.tagNameSelected
                      ]}>
                        {tag.name}
                      </Text>
                      <Text style={styles.tagCount}>({tag.song_count})</Text>
                    </View>
                    <View style={[
                      styles.checkbox,
                      isAssigned && styles.checkboxSelected
                    ]}>
                      {isAssigned && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {isSaving && (
            <View style={styles.savingIndicator}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.savingText}>Updating tags...</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  songInfo: {
    flex: 1,
    marginRight: 10,
  },
  songTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  tagsContainer: {
    maxHeight: 400,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tagItemSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  tagItemDisabled: {
    opacity: 0.6,
  },
  tagContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tagColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  tagName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  tagNameSelected: {
    color: '#2196f3',
    fontWeight: '600',
  },
  tagCount: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkboxSelected: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginTop: 10,
  },
  savingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
});