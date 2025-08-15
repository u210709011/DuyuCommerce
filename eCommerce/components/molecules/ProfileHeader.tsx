import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/atoms/Text';
import ProfileAvatar from '@/components/atoms/ProfileAvatar';
import { Colors } from '@/constants/Colors';

interface ProfileHeaderProps {
  name?: string;
  email?: string;
  imageUrl?: string;
  isGuest?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  email,
  imageUrl,
  isGuest = false,
}) => {
  return (
    <View style={styles.container}>
      <ProfileAvatar 
        imageUrl={imageUrl} 
        name={name || email} 
        size="large" 
      />
      <View style={styles.info}>
        {isGuest ? (
          <>
            <Text style={styles.name}>Guest User</Text>
            <Text style={styles.email}>Sign in to access all features</Text>
          </>
        ) : (
          <>
            <Text style={styles.name}>
              {name || email?.split('@')[0] || 'User'}
            </Text>
            <Text style={styles.email}>{email}</Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  info: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default ProfileHeader;
