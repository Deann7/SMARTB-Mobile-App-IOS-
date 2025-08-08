import { Stack } from 'expo-router';

export default function ProtectedLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="home" 
        options={{ 
          headerShown: false,
          title: 'Home'
        }} 
      />
      <Stack.Screen 
        name="dashboard" 
        options={{ 
          headerShown: false,
          title: 'Dashboard'
        }} 
      />
      <Stack.Screen 
        name="input-data" 
        options={{ 
          headerShown: false,
          title: 'Input Data'
        }} 
      />
      <Stack.Screen 
        name="menu" 
        options={{ 
          headerShown: false,
          title: 'Menu Lainnya'
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          headerShown: false,
          title: 'Pengaturan'
        }} 
      />
      <Stack.Screen 
        name="about-tb" 
        options={{ 
          headerShown: false,
          title: 'Tentang TB'
        }} 
      />
      <Stack.Screen 
        name="consultation" 
        options={{ 
          headerShown: false,
          title: 'Pusat Konsultasi'
        }} 
      />
      {/* TODO: Add more protected routes here */}
    </Stack>
  );
}
