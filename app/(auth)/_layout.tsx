import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false,
          title: 'Login' 
        }} 
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          headerShown: false,
          title: 'Register Choice'
        }} 
      />
      <Stack.Screen 
        name="register-step-1" 
        options={{ 
          headerShown: false,
          title: 'Register Step 1'
        }} 
      />
      <Stack.Screen 
        name="register-step-2" 
        options={{ 
          headerShown: false,
          title: 'Register Step 2'
        }} 
      />
    </Stack>
  );
}
