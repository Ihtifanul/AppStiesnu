import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
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
    <View style={styles.cardContainer}>
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
            <Ionicons name="time-outline" size={12} color={colors.gray400} />
            <Text style={styles.time}>{time}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    paddingVertical: 10, // Memberikan ruang untuk shadow agar tidak terpotong
    paddingRight: 16,
  },
  card: {
    width: 240, // Sedikit lebih lebar agar lebih premium
    backgroundColor: colors.white,
    borderRadius: 20,
    overflow: Platform.OS === 'ios' ? 'visible' : 'hidden', // Shadow fix untuk iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: colors.white,
  },
  imageWrapper: {
    width: '100%',
    height: 135, // Tinggi konsisten untuk semua gambar
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.gray100,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Menjamin semua gambar memenuhi area dengan ukuran yang sama
  },
  catBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(5, 150, 105, 0.9)', // Warna primary dengan transparansi sedikit
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  catText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  content: {
    padding: 14,
    height: 85, // Tinggi tetap untuk konten agar kartu seragam
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.gray800,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  time: {
    fontSize: 11,
    color: colors.gray400,
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default NewsCard;
