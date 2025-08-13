import React from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { Text } from '@/components/atoms/Text';
import Button from '@/components/atoms/Button';

import { useAuthContext } from '@/auth/providers/AuthProvider';


export default function ProfileScreen() {
  const { user, signOut } = useAuthContext();
  
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <ThemedView style={styles.container}>
      {user ? (
        <>
          <Text type="title">Welcome!</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Button title="Sign Out" onPress={handleSignOut} style={styles.button} />
        </>
      ) : (
        <>
          <Text type="title">You are not signed in.</Text>
          <Button
            title="Sign In"
            onPress={() => router.push('/(auth)/sign-in')}
            style={styles.button}
          />
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  email: {
    marginVertical: 20,
    fontSize: 18,
  },
  button: {
    marginTop: 20,
    minWidth: 200,
  },
});
