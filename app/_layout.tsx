// app/_layout.tsx (THIS IS YOUR ROOT LAYOUT FILE)
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, View, StyleSheet, Text as RNText } from 'react-native'; // Import Text as RNText to avoid conflicts

// Import default Expo theme stuff (keep these)
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';

// Import custom hooks/components (keep these if they exist in your project)
import { useColorScheme } from '@/hooks/useColorScheme';

// Import Auth and Cart Contexts
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';

// Main RootLayout component that wraps the entire app
export default function RootLayout() {
  const colorScheme = useColorScheme(); // From your existing hooks

  // Keep font loading logic as is
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null; // Don't render anything until fonts are loaded
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider> {/* AuthProvider wraps everything else */}
        <CartProvider> {/* CartProvider wraps the navigation structure */}
          <RootLayoutNav /> {/* Child component to handle conditional rendering */}
        </CartProvider>
      </AuthProvider>
      <StatusBar style="auto" /> {/* Keep your Status Bar here */}
    </ThemeProvider>
  );
}

// Separate component to handle conditional navigation based on auth state
function RootLayoutNav() {
  const { isSignedIn, isLoadingAuth } = useAuth();

  // Show a loading screen while checking auth status (e.g., from AsyncStorage)
  if (isLoadingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <RNText style={styles.loadingText}>Loading app...</RNText>
      </View>
    );
  }

  return (
    <Stack>
      {isSignedIn ? (
        // User is signed in, show the main app tabs (Expo Router group)
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        // User is NOT signed in, show the authentication stack (Expo Router group)
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      )}
      {/*
        These screens are defined directly under 'app/' and are NOT part of the tabs.
        They can be navigated to as full-screen modals or details pages from anywhere
        within the authenticated flow.
      */}
      <Stack.Screen name="product-detail" options={{ headerShown: true, title: 'Product Details' }} />
      <Stack.Screen name="cart" options={{ headerShown: true, title: 'Your Cart' }} />
      <Stack.Screen name="order-tracking" options={{ headerShown: true, title: 'My Orders' }} />

      {/* Expo Router's built-in not-found page */}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5', // Light background color
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#666',
  },
});