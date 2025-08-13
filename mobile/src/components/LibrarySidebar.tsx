import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

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
    <View style={[styles.sidebar, isCollapsed && styles.sidebarCollapsed]}>
      <View style={styles.sidebarHeader}>
        <TouchableOpacity style={styles.collapseButton} onPress={toggleSidebar}>
          <Text style={styles.collapseButtonText}>
            {isCollapsed ? '→' : '←'}
          </Text>
        </TouchableOpacity>
        {!isCollapsed && <Text style={styles.headerTitle}>Library</Text>}
      </View>
      
      {!isCollapsed && (
        <>
          {isDetailView && currentSelection ? (
            <View style={styles.sidebarDetail}>
              <TouchableOpacity style={styles.backButton} onPress={onBackToList}>
                <Text style={styles.backButtonText}>
                  ← Back to {currentSelection.type === 'album' ? 'Albums' : 'Artists'}
                </Text>
              </TouchableOpacity>
              <View style={styles.currentSelection}>
                <Text style={styles.selectionTitle}>{currentSelection.name}</Text>
                {currentSelection.artist && (
                  <Text style={styles.selectionArtist}>by {currentSelection.artist}</Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.sidebarNavigation}>
              <TouchableOpacity 
                style={[
                  styles.navItem,
                  currentView === 'songs' && styles.navItemActive
                ]}
                onPress={() => onViewChange('songs')}
              >
                <Text style={styles.navIcon}>♪</Text>
                <Text style={[
                  styles.navLabel,
                  currentView === 'songs' && styles.navLabelActive
                ]}>Songs</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.navItem,
                  currentView === 'albums' && styles.navItemActive
                ]}
                onPress={() => onViewChange('albums')}
              >
                <Text style={styles.navIcon}>⚬</Text>
                <Text style={[
                  styles.navLabel,
                  currentView === 'albums' && styles.navLabelActive
                ]}>Albums</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.navItem,
                  currentView === 'artists' && styles.navItemActive
                ]}
                onPress={() => onViewChange('artists')}
              >
                <Text style={styles.navIcon}>♂</Text>
                <Text style={[
                  styles.navLabel,
                  currentView === 'artists' && styles.navLabelActive
                ]}>Artists</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
      
      {isCollapsed && (
        <View style={styles.sidebarNavigationCollapsed}>
          <TouchableOpacity 
            style={[
              styles.navItemCollapsed,
              currentView === 'songs' && styles.navItemCollapsedActive
            ]}
            onPress={() => onViewChange('songs')}
          >
            <Text style={[
              styles.navIconCollapsed,
              currentView === 'songs' && styles.navIconCollapsedActive
            ]}>♪</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.navItemCollapsed,
              currentView === 'albums' && styles.navItemCollapsedActive
            ]}
            onPress={() => onViewChange('albums')}
          >
            <Text style={[
              styles.navIconCollapsed,
              currentView === 'albums' && styles.navIconCollapsedActive
            ]}>⚬</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.navItemCollapsed,
              currentView === 'artists' && styles.navItemCollapsedActive
            ]}
            onPress={() => onViewChange('artists')}
          >
            <Text style={[
              styles.navIconCollapsed,
              currentView === 'artists' && styles.navIconCollapsedActive
            ]}>♂</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 250,
    backgroundColor: '#f8f9fa',
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 100,
  },
  sidebarCollapsed: {
    width: 70,
  },
  sidebarHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  collapseButton: {
    padding: 8,
    borderRadius: 4,
  },
  collapseButtonText: {
    fontSize: 18,
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sidebarNavigation: {
    flex: 1,
    paddingVertical: 20,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navItemActive: {
    backgroundColor: '#007AFF',
  },
  navIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  navLabel: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  navLabelActive: {
    color: 'white',
    fontWeight: '600',
  },
  sidebarNavigationCollapsed: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  navItemCollapsed: {
    padding: 12,
    marginVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
  navItemCollapsedActive: {
    backgroundColor: '#007AFF',
  },
  navIconCollapsed: {
    fontSize: 20,
    color: '#555',
  },
  navIconCollapsedActive: {
    color: 'white',
  },
  sidebarDetail: {
    padding: 20,
    flex: 1,
  },
  backButton: {
    paddingVertical: 8,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  currentSelection: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectionArtist: {
    fontSize: 14,
    color: '#666',
  },
});