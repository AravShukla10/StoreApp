import React, { useEffect, useState } from 'react';
import { View, Text, Button, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function TestNotifications() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    (async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for notifications!');
        return;
      }

      const t = (await Notifications.getExpoPushTokenAsync()).data;
      setToken(t);
      console.log("Expo Push Token:", t);

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          sound: 'default',
          enableVibration: true,
        });
      }
    })();

    const sub1 = Notifications.addNotificationReceivedListener(n => {
      console.log('Notification Received:', n);
    });

    const sub2 = Notifications.addNotificationResponseReceivedListener(r => {
      console.log('Notification Response:', r);
    });

    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Push Token:</Text>
      <Text selectable>{token || 'Fetching...'}</Text>
      <Button
        title="Copy Token to Clipboard"
        onPress={() => {
          if (token) {
            console.log('Token copied:', token);
          }
        }}
      />
    </View>
  );
}
