import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/colors';
import { Button } from '../components/Button';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type DashboardScreenProps = {
  navigation: NativeStackNavigationProp<any, 'Dashboard'>;
};

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Overview of your activity</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Tasks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>98%</Text>
            <Text style={styles.statLabel}>Retention</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>Logged in successfully</Text>
            <Text style={styles.timeText}>Just now</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardText}>Updated Profile</Text>
            <Text style={styles.timeText}>2 hours ago</Text>
          </View>
        </View>

        <Button 
          title="Sign Out" 
          variant="secondary" 
          onPress={() => navigation.replace('Login')}
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bgBase,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.bgSurface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.textFaint,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  card: {
    backgroundColor: theme.colors.bgCard,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
  },
  cardText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    marginBottom: 4,
  },
  timeText: {
    color: theme.colors.textFaint,
    fontSize: 12,
  },
  logoutButton: {
    marginTop: 16,
    marginBottom: 40,
  },
});
