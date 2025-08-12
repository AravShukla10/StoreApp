import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

// Ensure this matches the base URL of your server
const BASE_URL = 'http://10.0.2.2:5000'; 

/**
 * Registers the device for push notifications and sends the token to the backend.
 * This should be called immediately after a user successfully logs in.
 */
export const registerForPushNotificationsAsync = async () => {
  let token;

  // Set up the notification channel for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Check for existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // If not granted, ask for permission
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // Handle case where permission is denied
  if (finalStatus !== 'granted') {
    console.log('User denied push notification permissions.');
    return;
  }

  // Get the Expo Push Token
  try {
    token = (await Notifications.getExpoPushTokenAsync({
        projectId: 'store-app-332b6',
    })).data;
    console.log('Expo Push Token:', token);
  } catch (error) {
    console.error("Failed to get push token", error);
    Alert.alert("Push Notification Error", "Failed to get push token. Please ensure you have a stable internet connection and Google Play Services are up to date.");
    return;
  }

  // --- Send the token to your backend ---
  if (token) {
    try {
      // Retrieve the logged-in user's ID from storage
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        console.error("Could not find userId to save push token.");
        return;
      }

      console.log(`Sending push token to backend for user: ${userId}`);
      
      // Make the API call to your endpoint
      const response = await fetch(`${BASE_URL}/api/users/${userId}/save-push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: token }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to save push token');
      }

      console.log('Successfully saved push token to backend:', responseData.message);

    } catch (error) {
      console.error('Error sending push token to backend:', error);
    }
  }
};
