// app/(auth)/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router'; // Use useRouter for Expo Router navigation
import { useAuth } from '../../context/AuthContext'; // Path relative to app/(auth)/

export default function LoginScreen() {
  const [username, setUsername] = useState('test'); // Pre-fill for easy testing
  const [password, setPassword] = useState('password'); // Pre-fill for easy testing
  const { signIn, isLoadingAuth } = useAuth();
  const router = useRouter(); // Initialize router

  const handleLogin = async () => {
    await signIn(username, password);
    // The signIn function (in AuthContext) updates `isSignedIn`.
    // The `app/_layout.tsx` will then automatically switch the stack
    // from (auth) to (tabs) due to the conditional rendering.
    // So, no explicit router.replace here.
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={isLoadingAuth}
      >
        {isLoadingAuth ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
      {/* Navigate to the signup screen within the (auth) group */}
      <TouchableOpacity onPress={() => router.replace('/(auth)/signup')}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007bff',
    fontSize: 16,
    marginTop: 10,
  },
});