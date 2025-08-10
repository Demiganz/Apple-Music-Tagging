import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import './TagAssignmentModal.css';

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
}

interface TagAssignmentModalProps {
  isOpen: boolean;
  song: Song | null;
  onClose: () => void;
  onTagsUpdated: () => void;
}

export default function TagAssignmentModal({ 
  isOpen, 
  song, 
  onClose, 
  onTagsUpdated 
}: TagAssignmentModalProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [assignedTags, setAssignedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && song) {
      loadTags();
      setAssignedTags(song.tags || []);
    }
  }, [isOpen, song]);

  const loadTags = async () => {
    setIsLoading(true);
    try {
      const result = await apiClient.getTags();
      if (result.success) {
        setTags(result.data);
      }
    } catch (error) {
      alert('Failed to load tags');
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
          alert(`Error: ${result.error}`);
        }
      } else {
        // Assign tag
        const result = await apiClient.assignTag(song.id, tag.id);
        if (result.success) {
          setAssignedTags(prev => [...prev, tag.name]);
        } else {
          alert(`Error: ${result.error}`);
        }
      }
    } catch (error) {
      alert('Failed to update tag');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    onTagsUpdated(); // Refresh the parent list
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !song) return null;

  return (
    <div className="tag-modal-overlay" onClick={handleOverlayClick}>
      <div className="tag-modal-content">
        <div className="tag-modal-header">
          <div className="song-info">
            <h3 className="song-title">{song.title}</h3>
            <p className="song-artist">{song.artist}</p>
          </div>
          <button 
            className="close-button" 
            onClick={handleClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <h4 className="section-title">Assign Tags</h4>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading tags...</p>
          </div>
        ) : (
          <div className="tags-list">
            {tags.map(tag => {
              const isAssigned = assignedTags.includes(tag.name);
              return (
                <button
                  key={tag.id}
                  className={`tag-item ${isAssigned ? 'selected' : ''} ${isSaving ? 'disabled' : ''}`}
                  onClick={() => toggleTag(tag)}
                  disabled={isSaving}
                >
                  <div className="tag-content">
                    <div 
                      className="tag-color" 
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="tag-name">{tag.name}</span>
                    <span className="tag-count">({tag.song_count})</span>
                  </div>
                  <div className={`checkbox ${isAssigned ? 'checked' : ''}`}>
                    {isAssigned && <span className="checkmark">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {isSaving && (
          <div className="saving-indicator">
            <div className="loading-spinner small"></div>
            <span>Updating tags...</span>
          </div>
        )}
      </div>
    </div>
  );
}