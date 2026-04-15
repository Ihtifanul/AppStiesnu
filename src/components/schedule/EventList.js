import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

const SUBJECT_COLORS = [
  colors.subjectGreen,
  colors.subjectBlue,
  colors.subjectPurple,
  colors.subjectOrange,
];

const EventList = ({ events = [] }) => {
  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={48} color={colors.gray200} />
        <Text style={styles.emptyText}>Tidak ada jadwal hari ini</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {events.map((event, index) => {
        const accentColor = SUBJECT_COLORS[index % SUBJECT_COLORS.length];
        return (
          <View key={event.id} style={styles.eventRow}>
            {/* Time column */}
            <View style={styles.timeCol}>
              <Text style={styles.timeStart}>{event.startTime}</Text>
              <View style={[styles.timeLine, { backgroundColor: accentColor }]} />
              <Text style={styles.timeEnd}>{event.endTime}</Text>
            </View>

            {/* Card */}
            <TouchableOpacity style={[styles.card, { borderLeftColor: accentColor }]} activeOpacity={0.85}>
              <View style={styles.cardHeader}>
                <Text style={styles.subject}>{event.subject}</Text>
                <View style={[styles.typeBadge, { backgroundColor: accentColor + '20' }]}>
                  <Text style={[styles.typeText, { color: accentColor }]}>{event.type}</Text>
                </View>
              </View>
              <Text style={styles.lecturer}>{event.lecturer}</Text>
              <View style={styles.roomRow}>
                <Ionicons name="location-outline" size={12} color={colors.gray400} />
                <Text style={styles.room}>{event.room}</Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    color: colors.gray400,
    fontSize: 14,
  },
  eventRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
  },
  timeCol: {
    alignItems: 'center',
    width: 44,
    paddingTop: 4,
  },
  timeStart: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gray600,
  },
  timeLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
    borderRadius: 2,
    minHeight: 20,
  },
  timeEnd: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gray600,
  },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderLeftWidth: 4,
    padding: 14,
    gap: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  subject: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.gray800,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  lecturer: {
    fontSize: 12,
    color: colors.gray500,
    fontWeight: '500',
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  room: {
    fontSize: 11,
    color: colors.gray400,
  },
});

export default EventList;
