import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import './TagsPage.css';

interface Tag {
  id: number;
  name: string;
  color: string;
  song_count: number;
}

const TAG_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#10AC84', '#EE5A24', '#0652DD', '#9C88FF', '#FFC312'
];

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    setIsLoading(true);
    const result = await apiClient.getTags();
    if (result.success) {
      setTags(result.data);
    } else {
      alert('Failed to load tags');
    }
    setIsLoading(false);
  };

  const createTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) {
      alert('Please enter a tag name');
      return;
    }

    setIsCreating(true);
    const result = await apiClient.createTag(newTagName.trim(), selectedColor);
    
    if (result.success) {
      setNewTagName('');
      setSelectedColor(TAG_COLORS[0]);
      setShowCreateModal(false);
      loadTags();
    } else {
      alert(`Error: ${result.error}`);
    }
    setIsCreating(false);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setNewTagName('');
    setSelectedColor(TAG_COLORS[0]);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading tags...</p>
      </div>
    );
  }

  return (
    <div className="tags-container">
      <div className="tags-header">
        <h1>Tags</h1>
        <button 
          className="create-tag-button"
          onClick={() => setShowCreateModal(true)}
        >
          + New Tag
        </button>
      </div>

      <div className="tags-grid">
        {tags.length === 0 ? (
          <div className="empty-state">
            <h3>No tags yet</h3>
            <p>Create tags to organize your music library</p>
          </div>
        ) : (
          tags.map(tag => (
            <div key={tag.id} className="tag-card">
              <div 
                className="tag-color-indicator" 
                style={{ backgroundColor: tag.color }}
              ></div>
              <div className="tag-info">
                <h3 className="tag-name">{tag.name}</h3>
                <p className="tag-count">
                  {tag.song_count} {tag.song_count === 1 ? 'song' : 'songs'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Tag</h2>
            
            <form onSubmit={createTag}>
              <div className="form-group">
                <label htmlFor="tagName">Tag Name:</label>
                <input
                  id="tagName"
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name"
                  maxLength={50}
                  required
                />
              </div>

              <div className="form-group">
                <label>Choose a color:</label>
                <div className="color-grid">
                  {TAG_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="modal-buttons">
                <button type="button" onClick={closeModal} className="cancel-button">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="create-button"
                  style={{ backgroundColor: selectedColor }}
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create Tag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}