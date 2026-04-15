import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

const FALLBACK_IMAGE = 'https://picsum.photos/seed/stiesnu/400/200';

const NewsCard = ({ title, category = 'Berita', time, image, onPress }) => {
  const imageUrl = (() => {
    if (!image) return FALLBACK_IMAGE;
    if (image.startsWith('http') || image.startsWith('data:')) return image;
    return FALLBACK_IMAGE;
  })();

  return (
    <View style={styles.card}>
      {/* Gambar Berita */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          defaultSource={{ uri: FALLBACK_IMAGE }}
        />
        <View style={styles.catBadge}>
          <Text style={styles.catText}>{category}</Text>
        </View>
      </View>

      {/* Konten */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <View style={styles.footer}>
          <Ionicons name="time-outline" size={11} color={colors.gray400} />
          <Text style={styles.time}>{time}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginRight: 12,
  },
  imageWrapper: {
    position: 'relative',
    height: 120,
    backgroundColor: colors.gray200,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  catBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  catText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    padding: 12,
    gap: 6,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gray800,
    lineHeight: 17,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 11,
    color: colors.gray400,
  },
});

export default NewsCard;
