import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import NewsCard from './NewsCard';
import colors from '../../constants/colors';
import api from '../../config/api';
import { formatDateID } from '../../utils/formatDate';
import { useAppContext } from '../../context/AppContext';

const FeaturedNews = ({ onSeeAll }) => {
  const { themeColors } = useAppContext();
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.get('/berita');
        if (res.data?.success) {
          const beritaArray = res.data.data.berita || [];
          setNewsData(beritaArray.slice(0, 3));
        }
      } catch (e) {
        console.error('Fetch news error', e);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const openNews = (url) => {
    if (url) {
      Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={[styles.heading, { color: themeColors.text }]}>Berita Kampus</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>Lainnya</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 10 }} />
      ) : newsData.length === 0 ? (
        <Text style={{ paddingHorizontal: 20, color: colors.gray400 }}>Belum ada berita.</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {newsData.map((item) => (
            <TouchableOpacity key={item.id_berita} activeOpacity={0.8} onPress={() => openNews(item.link_url)}>
              <NewsCard
                title={item.judul}
                category="Berita"
                time={formatDateID(new Date(item.createdAt))}
                image={item.gambar}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  heading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.gray800,
  },
  seeAll: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  scroll: {
    paddingLeft: 20,
    paddingRight: 8,
    paddingVertical: 10, // Memberikan ruang agar shadow kartu tidak terpotong saat scrolling
  },
});

export default FeaturedNews;
