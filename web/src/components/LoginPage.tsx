import { useState } from 'react';
import { appleMusicService } from '../services/appleMusicService';
import { apiClient } from '../services/apiClient';
import './LoginPage.css';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAppleMusicLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const isAuthorized = await appleMusicService.authorize();
      
      if (isAuthorized) {
        // Get user info from Apple Music and login to our backend
        const appleMusicId = appleMusicService.getUserId() || 'demo_user_id';
        const result = await apiClient.login(appleMusicId, undefined, 'Apple Music User');
        
        if (result.success) {
          // Automatically import user's Apple Music library
          try {
            const library = await appleMusicService.getUserLibrary(0, 100);
            if (library && library.data && library.data.length > 0) {
              const importResult = await apiClient.importSongs(library.data);
              if (!importResult.success) {
                console.warn('Failed to import library:', importResult.error);
                // Don't block login for import failures, just log it
              }
            }
          } catch (importError) {
            console.warn('Failed to import library:', importError);
            // Don't block login for import failures
          }
          
          onLogin();
        } else {
          setError(result.error);
        }
      } else {
        setError('Please allow access to Apple Music');
      }
    } catch (error) {
      setError('Failed to connect to Apple Music');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h1 className="login-title">Apple Music Tagger</h1>
        <p className="login-subtitle">Add custom tags to your Apple Music library</p>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <button 
          className="login-button"
          onClick={handleAppleMusicLogin}
          disabled={isLoading}
        >
{isLoading ? 'Connecting & Importing Library...' : 'Connect Apple Music'}
        </button>
        
        <div className="login-info">
          <p>This app allows you to:</p>
          <ul>
            <li>Automatically sync your Apple Music library</li>
            <li>Create custom tags for organization</li>
            <li>Browse by songs, albums, and artists</li>
            <li>Filter and search your music by tags</li>
            <li>Play songs directly from the web</li>
          </ul>
        </div>
      </div>
    </div>
  );
}