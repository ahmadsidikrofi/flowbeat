import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppProvider, useAppContext } from "@/utils/AuthProvider"
import { PaperProvider } from 'react-native-paper';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { currentUser, currentProfile, isLoading } = useAppContext();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    // Wait until navigation is fully ready and loading is done
    if (!rootNavigationState?.key || isLoading) return;

    // Give navigation a tick to resolve its internal state
    const timeout = setTimeout(() => {
      const segment = segments[0] as string;
      const inAuthGroup = segment === '(auth)';
      const inProfilesGroup = segment === '(profiles)';

      if (!currentUser && !inAuthGroup) {
        // Redirect to login
        router.replace('/(auth)/login' as any);
      } else if (currentUser && !currentProfile && !inProfilesGroup) {
        // Logged in but no profile selected
        router.replace('/(profiles)' as any);
      } else if (currentUser && currentProfile && (inAuthGroup || inProfilesGroup)) {
        // Logged in and profile selected, redirect to tabs
        router.replace('/(tabs)' as any);
      }
    }, 1);

    return () => clearTimeout(timeout);
  }, [currentUser, currentProfile, segments, rootNavigationState?.key, router, isLoading]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(profiles)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="measure" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AppProvider>
      <PaperProvider>
        <RootLayoutNav />
      </PaperProvider>
    </AppProvider>
  );
}
