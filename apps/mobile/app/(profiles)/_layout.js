import { Stack } from 'expo-router';

export default function ProfilesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0b0f19' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add" />
    </Stack>
  );
}
