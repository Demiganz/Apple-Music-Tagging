import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { appleMusicService } from '../services/appleMusicService';
import { apiClient } from '../services/apiClient';

interface LoginScreenProps {
  navigation: any;
  onLogin: () => void;
}

export default function LoginScreen({ navigation, onLogin }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAppleMusicLogin = async () => {
    setIsLoading(true);
    
    try {
      const isAuthorized = await appleMusicService.authorize();
      
      if (isAuthorized) {
        // Get user info from Apple Music and login to our backend
        const appleMusicId = appleMusicService.getUserId() || 'demo_user_id';
        const result = await apiClient.login(appleMusicId, undefined, 'Apple Music User');
        
        if (result.success) {
          onLogin();
        } else {
          Alert.alert('Login Failed', result.error);
        }
      } else {
        Alert.alert('Authorization Failed', 'Please allow access to Apple Music');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to Apple Music');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apple Music Tagger</Text>
      <Text style={styles.subtitle}>Add custom tags to your Apple Music library</Text>
      
      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={handleAppleMusicLogin}
        disabled={isLoading}
      >
        <Text style={styles.loginButtonText}>
          {isLoading ? 'Connecting...' : 'Connect Apple Music'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 200,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});