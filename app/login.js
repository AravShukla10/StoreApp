import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from "expo-notifications";
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';

// Base URLs for your backend API
const API_BASE_URL_USERS = 'https://storeapp-uqap.onrender.com/api/users';
const API_BASE_URL_OWNERS = 'https://storeapp-uqap.onrender.com/api/owners';

// Custom Message Box Component
const MessageBox = ({ message, type, onClose }) => {
  const backgroundColor = type === 'error' ? '#dc3545' : '#28a745';
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
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 22 },
  modalView: { margin: 20, borderRadius: 20, padding: 35, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalText: { marginBottom: 15, textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
  button: { borderRadius: 10, padding: 10, elevation: 2, minWidth: 80, alignItems: 'center' },
  textStyle: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
});
async function getPushToken() {
    let token = null;
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return null;
        }
      
           token = (await Notifications.getExpoPushTokenAsync()).data;
           console.log("Expo Push Token:", token);

        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#FF231F7C",
            });
        }
    } catch (error) {
        console.error("Error getting a push token", error);
    }
    return token;
}


export default function Login() {
  const [loginAs, setLoginAs] = useState('User'); // 'User' or 'Owner'
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const router = useRouter();

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
  };

  const closeMessage = () => {
    setMessage('');
    setMessageType('');
  };

  const handleUserLoginRequest = async () => {
    if (!/^\d{10}$/.test(phone)) {
      showMessage('Phone must be 10 digits.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL_USERS}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (response.ok) {
        showMessage(data.message, 'success');
        setShowOtpInput(true);
      } else {
        showMessage(data.message || 'Login failed.', 'error');
      }
    } catch (error) {
      showMessage('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserVerifyOtp = async () => {
    if (!otp) {
        showMessage('OTP is required.', 'error');
        return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL_USERS}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('userId', data.userId);
        await AsyncStorage.setItem('userRole', 'User');
        
        // Save user's push token
        const userPushToken = await getPushToken();
        if(userPushToken){
            await fetch(`${API_BASE_URL_USERS}/${data.userId}/save-push-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: userPushToken }),
            });
        }

        showMessage('Login successful!', 'success');
        router.replace('/(tabs)');
      } else {
        showMessage(data.message || 'OTP verification failed.', 'error');
      }
    } catch (error) {
      showMessage('Network error during OTP verification.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOwnerLogin = async () => {
    if (!phone || !password) {
        showMessage('Phone and password are required.', 'error');
        return;
    }
    setIsLoading(true);
    try {
        // --- NEW: Get the owner's push token before logging in ---
        const expoPushToken = await getPushToken();
        console.log("Expo Push Token for Owner:", expoPushToken);
        const response = await fetch(`${API_BASE_URL_OWNERS}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // --- NEW: Send the push token to the backend ---
            body: JSON.stringify({ phone, password, expoPushToken }),
        });
        const data = await response.json();
        if (response.ok) {
            await AsyncStorage.setItem('token', data.token);
            await AsyncStorage.setItem('userId', data.owner.id);
            await AsyncStorage.setItem('userRole', 'Owner');
            showMessage('Owner login successful!', 'success');
            router.replace('/(owner)');
        } else {
            showMessage(data.message || 'Owner login failed.', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    } finally {
        setIsLoading(false);
    }
  };
  
  const renderUserForm = () => (
    <>
      {!showOtpInput ? (
        <>
          <TextInput style={styles.input} placeholder="Phone Number (10 digits)" value={phone} onChangeText={setPhone} keyboardType="numeric" maxLength={10} />
          <TouchableOpacity style={styles.button} onPress={handleUserLoginRequest} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Get OTP</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.otpMessage}>An OTP has been sent to your phone.</Text>
          <TextInput style={styles.input} placeholder="Enter OTP" value={otp} onChangeText={setOtp} keyboardType="numeric" maxLength={6} />
          <TouchableOpacity style={styles.button} onPress={handleUserVerifyOtp} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify OTP & Login</Text>}
          </TouchableOpacity>
        </>
      )}
    </>
  );

  const renderOwnerForm = () => (
    <>
      <TextInput style={styles.input} placeholder="Owner Phone Number" value={phone} onChangeText={setPhone} keyboardType="numeric" maxLength={10} />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleOwnerLogin} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login as Owner</Text>}
      </TouchableOpacity>
    </>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, loginAs === 'User' && styles.toggleButtonActive]}
          onPress={() => { setLoginAs('User'); setShowOtpInput(false); setPhone(''); setPassword(''); setOtp(''); }}
        >
          <Text style={[styles.toggleButtonText, loginAs === 'User' && styles.toggleButtonTextActive]}>User</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, loginAs === 'Owner' && styles.toggleButtonActive]}
          onPress={() => { setLoginAs('Owner'); setShowOtpInput(false); setPhone(''); setPassword(''); setOtp(''); }}
        >
          <Text style={[styles.toggleButtonText, loginAs === 'Owner' && styles.toggleButtonTextActive]}>Owner</Text>
        </TouchableOpacity>
      </View>

      {loginAs === 'User' ? renderUserForm() : renderOwnerForm()}

      <TouchableOpacity onPress={() => router.replace('/signup')}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>

      <MessageBox message={message} type={messageType} onClose={closeMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f8f8f8' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  toggleContainer: { flexDirection: 'row', borderWidth: 1, borderColor: '#007bff', borderRadius: 10, marginBottom: 20, overflow: 'hidden' },
  toggleButton: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: '#fff' },
  toggleButtonActive: { backgroundColor: '#007bff' },
  toggleButtonText: { color: '#007bff', fontWeight: 'bold', fontSize: 16 },
  toggleButtonTextActive: { color: '#fff' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 15, marginBottom: 15, backgroundColor: '#fff', fontSize: 16 },
  button: { backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 5, minHeight: 55 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  link: { color: '#28a745', textAlign: 'center', marginTop: 25, fontSize: 16 },
  otpMessage: { textAlign: 'center', marginBottom: 20, fontSize: 16, color: '#555' },
});
