import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// Using static data to match the UI precisely for demonstration.
// In a real app, you would dynamically generate the calendar.
const MONTHS = [
  { label: 'Januari', active: false },
  { label: 'Februari', active: true },
  { label: 'Maret', active: false },
];

const CALENDAR_DATA = [
  { date: 1, type: 'current' }, { date: 2, type: 'current' }, { date: 3, type: 'current' }, { date: 4, type: 'current' }, { date: 5, type: 'current' }, { date: 6, type: 'current' }, { date: 7, type: 'current' },
  { date: 8, type: 'current' }, { date: 9, type: 'active' }, { date: 10, type: 'current' }, { date: 11, type: 'current' }, { date: 12, type: 'current' }, { date: 13, type: 'current' }, { date: 14, type: 'current' },
  { date: 15, type: 'current' }, { date: 16, type: 'current' }, { date: 17, type: 'current' }, { date: 18, type: 'current' }, { date: 19, type: 'current' }, { date: 20, type: 'current' }, { date: 21, type: 'current' },
  { date: 22, type: 'current' }, { date: 23, type: 'current' }, { date: 24, type: 'current' }, { date: 25, type: 'current' }, { date: 26, type: 'current' }, { date: 27, type: 'current' }, { date: 28, type: 'current' },
  { date: 1, type: 'next' }, { date: 2, type: 'next' }, { date: 3, type: 'next' }, { date: 4, type: 'next' }, { date: 5, type: 'next' }, { date: 6, type: 'next' }, { date: 7, type: 'next' },
];

const CalendarGrid = ({ onSelectDay }) => {
  const [selectedDay, setSelectedDay] = useState(9); // Feb 9 is highlighted

  return (
    <View style={styles.container}>
      {/* Months Header */}
      <View style={styles.monthHeader}>
        {MONTHS.map((month, idx) => (
          <Text
            key={idx}
            style={[
              styles.monthText,
              month.active && styles.monthTextActive,
            ]}
          >
            {month.label}
          </Text>
        ))}
      </View>

      {/* Days of Week */}
      <View style={styles.daysHeader}>
        {DAYS.map((day, idx) => (
          <Text key={idx} style={styles.dayLabel}>{day}</Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>
        {CALENDAR_DATA.map((item, idx) => {
          const isSelected = item.date === selectedDay && item.type === 'active';
          
          let textStyle = styles.dateText;
          if (item.type === 'next') textStyle = styles.dateTextNext;
          if (isSelected) textStyle = styles.dateTextSelected;

          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.dateItem,
                isSelected && styles.dateItemActive,
              ]}
              onPress={() => {
                if (item.type !== 'next') {
                  setSelectedDay(item.date);
                  onSelectDay && onSelectDay(item.date);
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={textStyle}>{item.date}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000', // Black for inactive months
  },
  monthTextActive: {
    fontSize: 16,
    fontWeight: '700',
    color: '#34d399', // Bright green for active month
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayLabel: {
    fontSize: 10,
    color: '#4b5563', // Gray text
    width: 30,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12, // vertical gap between rows
  },
  dateItem: {
    width: 30, // matched with dayLabel width
    height: 30, // Make it square for better circle background
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8, // slight rounding for selection
  },
  dateItemActive: {
    backgroundColor: '#34d399', // Bright green highlight
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  dateTextNext: {
    fontSize: 12,
    fontWeight: '400',
    color: '#d1d5db', // Light gray for next month days
  },
  dateTextSelected: {
    color: '#ffffff',
  },
});

export default CalendarGrid;
