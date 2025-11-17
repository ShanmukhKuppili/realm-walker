/**
 * Auth Navigator
 * Handles navigation between login and sign-up screens
 */
import LoginScreen from '@/screens/LoginScreen';
import SignUpScreen from '@/screens/SignUpScreen';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

export default function AuthNavigator() {
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <View style={styles.container}>
      {showSignUp ? (
        <SignUpScreen onNavigateToLogin={() => setShowSignUp(false)} />
      ) : (
        <LoginScreen onNavigateToSignUp={() => setShowSignUp(true)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
