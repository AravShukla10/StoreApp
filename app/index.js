import React, { useState, useEffect } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

// Show notifications as banners/etc. when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,   
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});


export default function Index() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState("User");
  useEffect(() => {
    // Listen for notifications received in the foreground
    const notificationReceivedSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('--- Notification Received in Foreground ---');
      console.log(JSON.stringify(notification.request.content, null, 2));
    });

    // Listen for user interactions with notifications
    const notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('--- User Interacted With Notification ---');
      console.log(JSON.stringify(response.notification.request.content, null, 2));
    });

    // Check auth status
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');
        setIsLoggedIn(!!(token && userId));
        const userRole = await AsyncStorage.getItem('userRole');
        console.log('User Role:', userRole);
        setRole(userRole || 'User'); // Default to 'user' if role is not
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();

    // Cleanup listeners
    return () => {
      notificationReceivedSubscription.remove();
      notificationResponseSubscription.remove();
    };
  }, []);

  if (loading) {
    return null;
  }

  return <Redirect href={isLoggedIn ? role==='User'?'/(tabs)': '/(owner)' : '/signup'} />;
}
