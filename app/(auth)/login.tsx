import { View, Text, Button } from 'react-native';
import { router } from 'expo-router';

export default function Login() {
  return (
    <View style={{ padding: 20 }}>
      <Text>Login Page</Text>
      <Button title="Login" onPress={() => router.replace('/(tabs)')} />
    </View>
  );
}
