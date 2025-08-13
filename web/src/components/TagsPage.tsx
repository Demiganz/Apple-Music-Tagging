import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import './TagsPage.css';

interface Tag {
  id: number;
  name: string;
  color: string;
  song_count: number;
  order_index?: number;
  is_visible?: boolean;
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
  const [draggedTag, setDraggedTag] = useState<Tag | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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

  const handleDragStart = (e: React.DragEvent, tag: Tag) => {
    setDraggedTag(tag);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', (e.currentTarget as HTMLElement).outerHTML);
    (e.currentTarget as HTMLElement).style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = '1';
    setDraggedTag(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (!draggedTag) return;

    const dragIndex = tags.findIndex(tag => tag.id === draggedTag.id);
    if (dragIndex === dropIndex) return;

    // Create new array with reordered tags
    const newTags = [...tags];
    const [draggedItem] = newTags.splice(dragIndex, 1);
    newTags.splice(dropIndex, 0, draggedItem);

    // Update local state immediately for responsive UI
    setTags(newTags);
    setDragOverIndex(null);

    // Send update to backend
    const tagIds = newTags.map(tag => tag.id);
    const result = await apiClient.updateTagOrder(tagIds);
    
    if (!result.success) {
      // Revert on error
      setTags(tags);
      alert(`Failed to update tag order: ${result.error}`);
    }
  };

  const toggleTagVisibility = async (tag: Tag, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag from starting
    
    const newIsVisible = !tag.is_visible;
    
    // Update local state immediately for responsive UI
    setTags(prevTags => 
      prevTags.map(t => 
        t.id === tag.id ? { ...t, is_visible: newIsVisible } : t
      )
    );

    // Send update to backend
    const result = await apiClient.updateTagVisibility(tag.id, newIsVisible);
    
    if (!result.success) {
      // Revert on error
      setTags(prevTags => 
        prevTags.map(t => 
          t.id === tag.id ? { ...t, is_visible: tag.is_visible } : t
        )
      );
      alert(`Failed to update tag visibility: ${result.error}`);
    }
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
          tags.map((tag, index) => (
            <div 
              key={tag.id} 
              className={`tag-card ${dragOverIndex === index ? 'drag-over' : ''} ${draggedTag?.id === tag.id ? 'dragging' : ''} ${tag.is_visible === false ? 'hidden' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, tag)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="drag-handle">
                <span>⋮⋮</span>
              </div>
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
              <button 
                className="visibility-toggle"
                onClick={(e) => toggleTagVisibility(tag, e)}
                title={tag.is_visible === false ? 'Show tag on Library page' : 'Hide tag from Library page'}
              >
                {tag.is_visible === false ? (
                  // Hidden eye icon (crossed out)
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3l18 18M10.584 10.587a2 2 0 002.828 2.826M9.363 5.365A9.466 9.466 0 0112 5c4.418 0 8 2.686 8 6 0 1.3-.8 2.5-2.1 3.4M6.74 15.1C4.8 14.2 4 13 4 11c0-1.657 1.5-3.1 3.8-4.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  // Visible eye icon
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
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