import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';

const StreakCounter = ({ streak = 0, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="flame" size={32} color={theme.colors.primary.warmGold} />
      <View style={styles.textContainer}>
        <Text style={styles.number}>{streak}</Text>
        <Text style={styles.label}>Day Streak</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.lightBlue,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  number: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.royalBlue,
  },
  label: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
});

export default StreakCounter;
