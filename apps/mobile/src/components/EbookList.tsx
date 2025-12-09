import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import type { Ebook } from '@librarydock/types';

interface EbookListProps {
  ebooks: Ebook[];
  isDarkMode: boolean;
}

const EbookList = ({ ebooks, isDarkMode }: EbookListProps) => {
  if (ebooks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, isDarkMode && styles.emptyTextDark]}>
          No ebooks in your library yet.
        </Text>
        <Text style={[styles.emptySubtext, isDarkMode && styles.emptySubtextDark]}>
          Sync with your desktop to view your collection.
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Ebook }) => (
    <TouchableOpacity style={[styles.card, isDarkMode && styles.cardDark]}>
      <View style={styles.coverPlaceholder}>
        <Text style={styles.formatBadge}>{item.format.toUpperCase()}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.title, isDarkMode && styles.titleDark]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.author, isDarkMode && styles.authorDark]}>{item.author}</Text>
        {item.description && (
          <Text style={[styles.description, isDarkMode && styles.descriptionDark]} numberOfLines={3}>
            {item.description}
          </Text>
        )}
        <View style={styles.metadata}>
          <Text style={[styles.metaText, isDarkMode && styles.metaTextDark]}>
            {item.format} • {formatFileSize(item.fileSize)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, isDarkMode && styles.headingDark]}>
        Your Library ({ebooks.length})
      </Text>
      <FlatList
        data={ebooks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        scrollEnabled={false}
      />
    </View>
  );
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  headingDark: {
    color: '#e0e0e0',
  },
  list: {
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#2a2a2a',
  },
  coverPlaceholder: {
    height: 120,
    backgroundColor: '#667eea',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  formatBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#667eea',
  },
  cardContent: {
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  titleDark: {
    color: '#e0e0e0',
  },
  author: {
    fontSize: 14,
    color: '#666',
  },
  authorDark: {
    color: '#b0b0b0',
  },
  description: {
    fontSize: 13,
    color: '#777',
    lineHeight: 18,
  },
  descriptionDark: {
    color: '#999',
  },
  metadata: {
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#888',
  },
  metaTextDark: {
    color: '#888',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyTextDark: {
    color: '#b0b0b0',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  emptySubtextDark: {
    color: '#999',
  },
});

export default EbookList;
