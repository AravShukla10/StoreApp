// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native'; // Import View and TouchableOpacity for logout button

// Assuming these are from your existing project's components.
// Ensure these paths are correct, e.g., '@/components/HapticTab' points to actual files.
import { HapticTab } from '@/components/HapticTab'; // If you don't have this, remove `tabBarButton: HapticTab`
import { IconSymbol } from '@/components/ui/IconSymbol'; // If you don't have this, replace usage
import TabBarBackground from '@/components/ui/TabBarBackground'; // If you don't have this, remove `tabBarBackground`
import { Colors } from '@/constants/Colors'; // If you don't have this, remove `Colors` usage
import { useColorScheme } from '@/hooks/useColorScheme'; // If you don't have this, remove `useColorScheme` usage

// Import CartProvider to wrap the Tabs Navigator
import { CartProvider } from '../../context/CartContext'; // Path relative to app/(tabs)/

// Import Auth for the logout button
import { useAuth } from '../../context/AuthContext';


export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { signOut } = useAuth(); // Get signOut function from AuthContext

  return (
    <CartProvider> {/* CartProvider wraps the Tabs navigator */}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false, // Hide default header for tab screens; define in specific screens if needed
          tabBarButton: HapticTab, // Use your custom HapticTab or remove for default
          tabBarBackground: TabBarBackground, // Use your custom TabBarBackground or remove
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        }}>
        <Tabs.Screen
          name="index" // Maps to app/(tabs)/index.tsx (Home)
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            // Example: Add a logout button to the header of the Home tab
            headerShown: true, // Make header visible for this specific tab
            headerRight: () => (
              <TouchableOpacity onPress={signOut} style={{ marginRight: 15 }}>
                <Text style={{ color: 'red', fontSize: 16, fontWeight: 'bold' }}>Logout</Text>
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="explore" // Maps to app/(tabs)/explore.tsx
          options={{
            title: 'Explore',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="product-list" // Maps to app/(tabs)/product-list.tsx
          options={{
            title: 'Shop',
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 24 }}>🛒</Text> // Using emoji as an icon
            ),
          }}
        />

        {/*
          Hidden Screens: These are accessible from within the tabs flow but are not themselves tabs.
          They are defined here because they are part of the 'signed-in' experience and can be
          pushed onto the navigation stack from any tab.
          Their actual header display options are usually handled in the root app/_layout.tsx or
          can be overridden here.
        */}
        <Tabs.Screen
          name="product-detail" // Maps to app/product-detail.tsx (hidden)
          options={{
            href: null, // Hides this screen from the tab bar
            headerShown: true, // Ensures a header is shown when navigated to
            title: 'Product Details'
          }}
        />
        <Tabs.Screen
          name="cart" // Maps to app/cart.tsx (hidden)
          options={{
            href: null,
            headerShown: true,
            title: 'Your Cart'
          }}
        />
        <Tabs.Screen
          name="order-tracking" // Maps to app/order-tracking.tsx (hidden)
          options={{
            href: null,
            headerShown: true,
            title: 'My Orders'
          }}
        />
      </Tabs>
    </CartProvider>
  );
}