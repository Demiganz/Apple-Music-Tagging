import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import LibraryPage from './components/LibraryPage';
import TagsPage from './components/TagsPage';
import { appleMusicService } from './services/appleMusicService';
import { apiClient } from './services/apiClient';
import './App.css';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check if user is already logged in
      const isAuthenticated = apiClient.isAuthenticated();
      setIsLoggedIn(isAuthenticated);

      // Initialize Apple Music
      const success = await appleMusicService.initialize();
      setIsInitialized(success);
    } catch (error) {
      console.error('App initialization failed:', error);
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    apiClient.logout();
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <h2>Initializing Apple Music Tagger...</h2>
        <p>Setting up your music experience</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            <h1>🎵 Apple Music Tagger</h1>
          </div>
          <div className="nav-links">
            <Link to="/library" className="nav-link">Library</Link>
            <Link to="/tags" className="nav-link">Tags</Link>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/library" replace />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/tags" element={<TagsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;