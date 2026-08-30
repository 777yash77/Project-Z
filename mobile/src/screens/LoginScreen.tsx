import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/colors';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { loginUser } from '../api/api';
import { useAuth } from '../context/AuthContext';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<any, 'Login'>;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    try {
      setLoading(true);
      const res = await loginUser({ usernameOrEmail: email, password });
      if (res.data && res.data.accessToken) {
        await login(res.data.accessToken);
        // Navigation will be handled by App.tsx conditionally rendering screens based on Auth state
      } else {
        Alert.alert('Error', 'Invalid response from server');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      Alert.alert('Login Failed', msg);
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to Employee System</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email or Username"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button 
              title={loading ? 'Signing In...' : 'Sign In'} 
              onPress={handleLogin} 
              style={styles.loginButton}
              disabled={loading}
            />
            
            <Button 
              title="Register" 
              variant="outline" 
              onPress={() => navigation.navigate('Register')} 
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
  header: { marginBottom: 48 },
  title: { fontSize: 32, fontWeight: '800', color: theme.colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 16, color: theme.colors.textMuted },
  form: {
    backgroundColor: theme.colors.bgSurface, padding: 24, borderRadius: 16,
    borderWidth: 1, borderColor: theme.colors.borderSubtle,
    shadowColor: theme.colors.accent, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1, shadowRadius: 20, elevation: 4,
  },
  loginButton: { marginTop: 16 },
});
