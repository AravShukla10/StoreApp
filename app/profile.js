import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Base URL for your backend API
const API_BASE_URL = 'https://storeapp-rv3e.onrender.com/api/users';

// Custom Message Box Component
const MessageBox = ({ message, type, onClose }) => {
  const backgroundColor = type === 'error' ? '#FF6B6B' : '#4ECDC4';
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
            style={[messageBoxStyles.button, { backgroundColor: type === 'error' ? '#FF5252' : '#26A69A' }]}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 280,
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  textStyle: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default function Profile() {
  const [username, setUsername] = useState('Loading...');
  const [phone, setPhone] = useState('Loading...');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

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
              'Authorization': `Bearer ${token}`,
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
          router.replace('/login');
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#1E88E5', '#4FC3F7', '#4DD0E1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={40} color="#fff" />
            </View>
          </View>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Text style={styles.headerSubtitle}>Manage your account</Text>
        </View>
      </LinearGradient>

      {/* Profile Information Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileInfo}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <MaterialIcons name="person-outline" size={24} color="#4FC3F7" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{username}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <MaterialIcons name="phone" size={24} color="#4FC3F7" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{phone}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Menu Section */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={goToOrders}>
          <View style={styles.menuItemLeft}>
            <LinearGradient
              colors={['#4FC3F7', '#66BB6A']}
              style={styles.menuIcon}
            >
              <MaterialIcons name="receipt-long" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.menuItemText}>Your Orders</Text>
          </View>
          <View style={styles.menuItemRight}>
            <Text style={styles.menuItemSubtext}>View order history</Text>
            <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <LinearGradient
              colors={['#4FC3F7', '#66BB6A']}
              style={styles.menuIcon}
            >
              <MaterialIcons name="settings" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.menuItemText}>Settings</Text>
          </View>
          <View style={styles.menuItemRight}>
            <Text style={styles.menuItemSubtext}>Account preferences</Text>
            <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <LinearGradient
              colors={['#4FC3F7', '#66BB6A']}
              style={styles.menuIcon}
            >
              <MaterialIcons name="help-outline" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.menuItemText}>Help & Support</Text>
          </View>
          <View style={styles.menuItemRight}>
            <Text style={styles.menuItemSubtext}>Get assistance</Text>
            <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutContainer} onPress={logout}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E']}
          style={styles.logoutButton}
        >
          <MaterialIcons name="logout" size={20} color="#fff" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </LinearGradient>
      </TouchableOpacity>

      <MessageBox message={message} type={messageType} onClose={closeMessage} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  profileInfo: {
    gap: 0,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  infoIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 5,
  },
  menuSection: {
    marginHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 15,
  },
  menuItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuItemSubtext: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
  },
  logoutContainer: {
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 15,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});