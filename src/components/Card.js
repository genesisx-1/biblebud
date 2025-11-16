import React from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import theme from '../constants/theme';

const Card = ({
  children,
  style,
  variant = 'default',
  onPress,
  elevated = true,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primary;
      case 'success':
        return styles.success;
      case 'warning':
        return styles.warning;
      case 'lightBlue':
        return styles.lightBlue;
      default:
        return styles.default;
    }
  };

  const content = (
    <Animated.View
      style={[
        styles.card,
        getVariantStyle(),
        elevated && theme.shadows.medium,
        { transform: [{ scale: scaleAnim }] },
        style
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  default: {
    backgroundColor: theme.colors.background.card,
  },
  primary: {
    backgroundColor: theme.colors.secondary.lightBlue,
  },
  success: {
    backgroundColor: '#E8F5E9',
  },
  warning: {
    backgroundColor: '#FFF8E1',
  },
  lightBlue: {
    backgroundColor: theme.colors.background.lightBlue,
  },
});

export default Card;
