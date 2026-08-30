import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/colors';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { registerUser } from '../api/api';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<any, 'Register'>;
};

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password || !organization) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    
    try {
      setLoading(true);
      await registerUser({ username, email, password, organizationName: organization });
      Alert.alert('Success', 'Registration successful. Please login.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Registration failed.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the Employee System</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Username"
              placeholder="Choose a username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <Input
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Input
              label="Organization"
              placeholder="Your company name"
              value={organization}
              onChangeText={setOrganization}
            />

            <Button 
              title={loading ? 'Registering...' : 'Register'} 
              onPress={handleRegister} 
              style={styles.registerButton}
              disabled={loading}
            />
            
            <Button 
              title="Back to Login" 
              variant="outline" 
              onPress={() => navigation.goBack()} 
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.bgBase },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 16, color: theme.colors.textMuted },
  form: {
    backgroundColor: theme.colors.bgSurface, padding: 24, borderRadius: 16,
    borderWidth: 1, borderColor: theme.colors.borderSubtle,
    shadowColor: theme.colors.accent, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1, shadowRadius: 20, elevation: 4,
  },
  registerButton: { marginTop: 8 },
});
