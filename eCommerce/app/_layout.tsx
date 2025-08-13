import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, AppState, Platform, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';

import { AuthProvider } from '@/auth/providers/AuthProvider';

import { apiGet } from '@/services/api';

import Button from '@/components/atoms/Button';

import { Colors } from '@/constants/Colors';




SplashScreen.preventAutoHideAsync();


export default function RootLayout() {

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    InterRegular: require('../assets/fonts/Inter-Regular.otf'),
    InterBold: require('../assets/fonts/Inter-Bold.otf'),
    InterSemiBold: require('../assets/fonts/Inter-SemiBold.otf'),
    MaterialIcons: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf'),
    Ionicons: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
    Feather: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Feather.ttf'),
  });

  const [backendReady, setBackendReady] = useState(false);

  const [checkingBackend, setCheckingBackend] = useState(true);

  const [backendError, setBackendError] = useState<string | null>(null);

  const [serviceOnline, setServiceOnline] = useState<boolean>(true);

  const [pinging, setPinging] = useState<boolean>(false);

  const [showConnectedBanner, setShowConnectedBanner] = useState<boolean>(false);
  
  const pathname = usePathname();

  // Initial blocking health check for backend
  const checkBackend = async () => {
    setCheckingBackend(true);
    setBackendError(null);
    try {
      const res = await apiGet<string>('/health', undefined, { timeoutMs: 5000 });
      if (res && typeof res === 'string') {
        setBackendReady(true);
        setServiceOnline(true);
      } else {
        setBackendError('Unexpected health check response');
        setServiceOnline(false);
      }
    } catch (e: any) {
      setBackendError(e?.message || 'Failed to reach backend');
      setServiceOnline(false);
    } finally {
      setCheckingBackend(false);
    }
  };

  // Periodic non-blocking connectivity ping
  const pingBackend = async () => {
    setPinging(true);
    try {
      const res = await apiGet<string>('/health', undefined, { timeoutMs: 4000 });
      setServiceOnline(prev => {
        const nowOnline = !!res;
        if (!prev && nowOnline) {
          setShowConnectedBanner(true);
          setTimeout(() => setShowConnectedBanner(false), 1800);
        }
        return nowOnline;
      });
    } catch {
      setServiceOnline(false);
    } finally {
      setPinging(false);
    }
  };


  // Gate UI on fonts + health check
  useEffect(() => {
    if (loaded) {
      checkBackend();
    }
  }, [loaded]);

  // Hide splash after first health check completes
  useEffect(() => {
    if (loaded && !checkingBackend) {
      SplashScreen.hideAsync();
    }
  }, [loaded, checkingBackend]);

  // Background/interval pings once app is ready
  useEffect(() => {
    if (!backendReady) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        pingBackend();
      }
    });
    const intervalId = setInterval(() => {
      pingBackend();
    }, 30000);
    return () => {
      sub.remove();
      clearInterval(intervalId);
    };
  }, [backendReady]);

  // Ping on navigation for up-to-date status
  useEffect(() => {
    if (!backendReady) return;
    pingBackend();
  }, [pathname, backendReady]);

  if (!loaded) {
    return null;
  }

  if (!backendReady) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            {checkingBackend ? (
              <>
                <ActivityIndicator size="large" color={Colors.tabIconSelected} />
                <Text style={{ marginTop: 12 }}>Connecting to server…</Text>
              </>
            ) : (
              <>
                <Text style={{ textAlign: 'center', marginBottom: 12 }}>Cannot reach the server.</Text>
                <Button title="Retry" onPress={checkBackend} />
              </>
            )}
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          {(!serviceOnline || showConnectedBanner) && (
            <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 9999 }}>
              <SafeAreaView edges={['top']}>
                <View style={{ backgroundColor: serviceOnline ? '#1b5e20' : '#b00020' }}>
                  <View style={{ paddingVertical: 8, paddingHorizontal: 12 }}>
                    <Text style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>
                      {serviceOnline ? 'Connected' : 'Connection lost'}
                    </Text>
                  </View>
                </View>
              </SafeAreaView>
            </View>
          )}
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
