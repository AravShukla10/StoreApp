import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function Profile() {
  const [username, setUsername] = useState('Loading...');
  const [email, setEmail] = useState('Loading...');

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const { username, email } = JSON.parse(userData);
        setUsername(username);
        setEmail(email);
      }
    };
    loadUser();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('session');
    router.replace('/login');
  };

  const goToOrders = () => {
    router.push('/orders');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      <View style={styles.profileBox}>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Username:</Text>
          <Text style={styles.value}>{username}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.rowItem} onPress={goToOrders}>
          <View style={styles.iconBox}>
            <MaterialIcons name="receipt-long" size={22} color="#555" />
          </View>
          <Text style={styles.labelRow}>Your Orders</Text>
          <Ionicons name="chevron-forward" size={20} color="#aaa" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2', padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  profileBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
    elevation: 2,
  },
  infoBox: { marginBottom: 15 },
  label: { fontSize: 16, fontWeight: '600', color: '#333' },
  value: { fontSize: 16, color: '#666' },

  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 20,
    elevation: 1,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 30,
    alignItems: 'center',
  },
  labelRow: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  logoutButton: {
    backgroundColor: '#ff4d4f',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
