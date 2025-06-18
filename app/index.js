// app/index.js
import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const session = await AsyncStorage.getItem('session');
      setIsLoggedIn(session === 'active');
      setLoading(false);
    };
    checkSession();
  }, []);

  if (loading) return null;

  return <Redirect href={isLoggedIn ? '/(tabs)' : '/signup'} />;
}
