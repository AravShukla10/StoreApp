import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check for the presence of 'token' and 'userId' in AsyncStorage
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');

        // If both token and userId exist, the user is considered logged in
        if (token && userId) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        // In case of an error, assume not logged in to prevent infinite loops
        setIsLoggedIn(false);
      } finally {
        setLoading(false); // Set loading to false once check is complete
      }
    };

    checkAuthStatus();
  }, []);

  // While loading, return null to prevent rendering anything prematurely
  if (loading) {
    return null;
  }

  // Redirect based on authentication status
  // If logged in, redirect to the main tabs, otherwise redirect to the signup page
  return <Redirect href={isLoggedIn ? '/(tabs)' : '/signup'} />;
}
