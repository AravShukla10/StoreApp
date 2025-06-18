// app/order-tracking.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; // Use useRouter

export default function OrderTrackingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Placed!</Text>
      <Text style={styles.subtitle}>Your order #XYZ123 is on its way!</Text>
      <Text style={styles.status}>Current Status: Processing</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.replace('/(tabs)/product-list')}>
        <Text style={styles.buttonText}>Continue Shopping</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonSecondary} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.buttonSecondaryText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#28a745', // Green for success
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    color: '#555',
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#007bff',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  buttonSecondaryText: {
    color: '#333',
    fontSize: 16,
  },
});