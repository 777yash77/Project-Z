import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/colors';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { fetchMyProfile } from '../api/api';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await fetchMyProfile();
      setProfileData(res.data);
    } catch (error) {
      console.log('Error fetching profile', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.accent} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.card}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.username ? user.username.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            
            <Text style={styles.name}>{user?.username || 'User'}</Text>
            <Text style={styles.email}>{user?.email || 'No email'}</Text>
            <Text style={styles.role}>{user?.roles?.[0]?.name || 'EMPLOYEE'}</Text>

            {profileData?.bio && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bio</Text>
                <Text style={styles.bioText}>{profileData.bio}</Text>
              </View>
            )}

            <Button 
              title="Sign Out" 
              variant="outline" 
              onPress={logout}
              style={styles.logoutButton}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.bgBase },
  container: { flex: 1, padding: 24 },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '700', color: theme.colors.textPrimary },
  card: {
    backgroundColor: theme.colors.bgSurface, padding: 24, borderRadius: 16,
    borderWidth: 1, borderColor: theme.colors.borderSubtle,
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: theme.colors.accentGlow,
    borderWidth: 2, borderColor: theme.colors.accent,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: theme.colors.accent },
  name: { fontSize: 24, fontWeight: '700', color: theme.colors.textPrimary, marginBottom: 4 },
  email: { fontSize: 16, color: theme.colors.textMuted, marginBottom: 4 },
  role: { fontSize: 14, color: theme.colors.accent, fontWeight: '600', marginBottom: 24 },
  section: { width: '100%', alignItems: 'flex-start', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 8 },
  bioText: { color: theme.colors.textMuted, fontSize: 15, lineHeight: 22 },
  logoutButton: { width: '100%', marginTop: 8 },
});
