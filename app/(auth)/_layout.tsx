// app/auth/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen 
        name="login" 
        options={{
          headerShown: false,
          gestureEnabled: false, // Prevent swipe back on iOS
        }} 
      />
    </Stack>
  );
}