import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

const IconButton = ({
  name,
  size = 22,
  color = colors.primary,
  bgColor = colors.primarySoft,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, { backgroundColor: bgColor }, style]}>
      <Ionicons name={name} size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default IconButton;
