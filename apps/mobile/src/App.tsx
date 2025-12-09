import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import type { Ebook } from '@librarydock/types';
import EbookList from './components/EbookList';
import SyncButton from './components/SyncButton';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [ebooks, setEbooks] = useState<Ebook[]>([]);

  useEffect(() => {
    fetchEbooks();
  }, []);

  const fetchEbooks = async () => {
    try {
      // In production, use actual API URL from config
      const response = await fetch('http://localhost:3001/api/ebooks');
      if (response.ok) {
        const data = await response.json();
        setEbooks(data);
      }
    } catch (error) {
      console.error('Failed to fetch ebooks:', error);
    }
  };

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    flex: 1,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={[styles.title, isDarkMode && styles.titleDark]}>📚 LibraryDock</Text>
            <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>
              Your Mobile Library
            </Text>
          </View>

          <SyncButton onSync={fetchEbooks} />

          <EbookList ebooks={ebooks} isDarkMode={isDarkMode} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#667eea',
    borderRadius: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  titleDark: {
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 8,
    opacity: 0.9,
  },
  subtitleDark: {
    color: '#ffffff',
  },
});

export default App;
