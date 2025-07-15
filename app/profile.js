import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

// Base URL for your backend API
const API_BASE_URL = 'http://10.0.2.2:5000/api/users'; // Use 10.0.2.2 for Android emulator to access localhost

// Custom Message Box Component (copied for consistency across auth-related files)
const MessageBox = ({ message, type, onClose }) => {
  const backgroundColor = type === 'error' ? '#dc3545' : '#28a745'; // Red for error, Green for success
  const textColor = '#fff';

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={!!message}
      onRequestClose={onClose}
    >
      <View style={messageBoxStyles.centeredView}>
        <View style={[messageBoxStyles.modalView, { backgroundColor }]}>
          <Text style={[messageBoxStyles.modalText, { color: textColor }]}>{message}</Text>
          <Pressable
            style={[messageBoxStyles.button, { backgroundColor: type === 'error' ? '#c82333' : '#218838' }]}
            onPress={onClose}
          >
            <Text style={messageBoxStyles.textStyle}>OK</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const messageBoxStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    minWidth: 80,
    alignItems: 'center',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});


export default function Profile() {
  const [username, setUsername] = useState('Loading...');
  const [phone, setPhone] = useState('Loading...'); // Changed from email to phone
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
  };

  const closeMessage = () => {
    setMessage('');
    setMessageType('');
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('token');

        if (userId && token) {
          const response = await fetch(`${API_BASE_URL}/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`, // Assuming your API requires a token for user data
            },
          });

          const data = await response.json();

          if (response.ok) {
            setUsername(data.name);
            setPhone(data.phone);
          } else {
            showMessage(data.message || 'Failed to load user data.', 'error');
            setUsername('N/A');
            setPhone('N/A');
          }
        } else {
          showMessage('User not logged in. Please log in.', 'error');
          router.replace('/login'); // Redirect to login if no userId or token
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        showMessage('Network error or failed to load user data.', 'error');
        setUsername('Error');
        setPhone('Error');
      }
    };
    loadUser();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userId');
      showMessage('Logged out successfully!', 'success');
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      showMessage('Failed to log out. Please try again.', 'error');
    }
  };

  const goToOrders = () => {
    router.push('/orders');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      <View style={styles.profileBox}>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{username}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{phone}</Text>
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

      <MessageBox message={message} type={messageType} onClose={closeMessage} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  profileBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoBox: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
