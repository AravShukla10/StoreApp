import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Modal, Pressable,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
// 1. Import the notification service
import { registerForPushNotificationsAsync } from './services/notificationService';

// Base URL for your backend API
const API_BASE_URL = 'https://storeapp-rv3e.onrender.com/api/users'; // Use 10.0.2.2 for Android emulator to access localhost

// Custom Message Box Component
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


export default function SignUp() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const router = useRouter();

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
  };

  const closeMessage = () => {
    setMessage('');
    setMessageType('');
  };

  const handleSignUpRequest = async () => {
    if (!phone || !name) {
      showMessage('Phone and Name are required.', 'error');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      showMessage('Phone must be 10 digits.', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, name }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(data.message, 'success');
        setShowOtpInput(true); // Show OTP input after successful signup request
      } else {
        showMessage(data.message || 'Signup failed.', 'error');
      }
    } catch (error) {
      console.error('Signup request error:', error);
      showMessage('Network error. Please try again.', 'error');
    }
  };

  const handleVerifyOtpAndLogin = async () => {
    if (!phone || !otp) {
      showMessage('Phone and OTP are required for verification.', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('userId', data.userId);
        // 3. Register for push notifications
        await registerForPushNotificationsAsync();
        showMessage('Account created and logged in successfully!', 'success');
        router.replace('/(tabs)'); // Navigate to main app route
      } else {
        showMessage(data.message || 'OTP verification failed.', 'error');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      showMessage('Network error during OTP verification. Please try again.', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      {!showOtpInput ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number (10 digits)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="numeric"
            maxLength={10}
          />
          <TouchableOpacity style={styles.button} onPress={handleSignUpRequest}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.otpMessage}>An OTP has been sent to your phone. Please enter it below.</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            maxLength={6}
          />
          <TouchableOpacity style={styles.button} onPress={handleVerifyOtpAndLogin}>
            <Text style={styles.buttonText}>Verify OTP & Login</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={() => router.replace('/login')}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>

      <MessageBox message={message} type={messageType} onClose={closeMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  link: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 25,
    fontSize: 16,
  },
  otpMessage: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    color: '#555',
  },
});
