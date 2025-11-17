/**
 * CountUpNumber Component
 * Animated number counter with smooth transitions
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, TextStyle } from 'react-native';

interface CountUpNumberProps {
  value: number;
  duration?: number;
  style?: TextStyle;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export default function CountUpNumber({
  value,
  duration = 1000,
  style,
  decimals = 0,
  prefix = '',
  suffix = '',
}: CountUpNumberProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    // Set up listener to update display value
    const listenerId = animatedValue.addListener(({ value: animValue }) => {
      setDisplayValue(animValue.toFixed(decimals));
    });

    // Animate to new value
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();

    // Cleanup listener
    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [value, duration, decimals, animatedValue]);

  return (
    <Animated.Text style={style}>
      {prefix}
      {displayValue}
      {suffix}
    </Animated.Text>
  );
}

