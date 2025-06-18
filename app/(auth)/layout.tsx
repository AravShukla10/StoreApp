// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack>
      {/* Set Login as the initial screen and hide its header */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
      {/* Set Signup screen and hide its header */}
      <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
  );
}