import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth.store';

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const { user, setAuth } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [pan, setPan] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [employmentType, setEmploymentType] = useState('SALARIED');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!phone || !pan || !dob || !address) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/complete-profile', {
        userId: user?.id,
        phone,
        pan,
        dob,
        address,
        employmentType,
      });
      // Update local store with new token and user object
      setAuth(res.data.access_token, res.data.user);
      // Navigate to dashboard is handled automatically by App.tsx conditionally rendering Stack.Screen
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Feather name="user-check" size={24} color="#fff" />
          </View>
          <Text style={styles.title}>Complete Profile</Text>
          <Text style={styles.subtitle}>Welcome {user?.name?.split(' ')[0] || 'User'}, we need a few more details to set up your financial copilot.</Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Feather name="phone" size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="9876543210"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PAN Number</Text>
            <View style={styles.inputContainer}>
              <Feather name="credit-card" size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ABCDE1234F"
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="characters"
                value={pan}
                onChangeText={setPan}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <View style={styles.inputContainer}>
              <Feather name="calendar" size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.textMuted}
                value={dob}
                onChangeText={setDob}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <View style={styles.inputContainer}>
              <Feather name="map-pin" size={18} color={theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="City, State"
                placeholderTextColor={theme.colors.textMuted}
                value={address}
                onChangeText={setAddress}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Employment Type</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.employmentBtn, employmentType === 'SALARIED' && styles.employmentBtnActive]}
                onPress={() => setEmploymentType('SALARIED')}
              >
                <Text style={[styles.employmentText, employmentType === 'SALARIED' && styles.employmentTextActive]}>Salaried</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.employmentBtn, employmentType === 'BUSINESS' && styles.employmentBtnActive]}
                onPress={() => setEmploymentType('BUSINESS')}
              >
                <Text style={[styles.employmentText, employmentType === 'BUSINESS' && styles.employmentTextActive]}>Business</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Complete Setup'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bgBase },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  iconContainer: { width: 64, height: 64, borderRadius: 20, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: theme.colors.primary, shadowOpacity: 0.4, shadowOffset: { width: 0, height: 8 }, shadowRadius: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', paddingHorizontal: 20 },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: '500', color: theme.colors.textSecondary },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.bgSurface, borderWidth: 1, borderColor: theme.colors.borderDefault, borderRadius: 16, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 56, color: theme.colors.textPrimary, fontSize: 16 },
  row: { flexDirection: 'row', gap: 12 },
  employmentBtn: { flex: 1, height: 50, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.borderDefault, justifyContent: 'center', alignItems: 'center' },
  employmentBtnActive: { borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}10` },
  employmentText: { fontSize: 14, color: theme.colors.textSecondary, fontWeight: '500' },
  employmentTextActive: { color: theme.colors.primary, fontWeight: 'bold' },
  button: { backgroundColor: theme.colors.primary, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 12, shadowColor: theme.colors.primary, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 8 }, shadowRadius: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  errorBox: { backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  errorText: { color: '#ef4444', fontSize: 13, textAlign: 'center' },
});
