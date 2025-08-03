import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Make sure @expo/vector-icons is installed

export default function TrackOrder() {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="rocket-launch-outline" size={100} color="#007bff" />
      <Text style={styles.title}>Coming Soon!</Text>
      <Text style={styles.subtitle}>
        We are working hard to bring delivery service asap.
      </Text>
      <Text style={styles.description}>
        You'll be able to see the status of your delivery right here. Stay tuned!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 25,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
  },
  description: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    lineHeight: 22,
  },
});
