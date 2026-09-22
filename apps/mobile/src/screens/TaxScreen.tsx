import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { theme } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth.store';
import { api } from '../lib/api';

const DEFAULT_INPUTS = {
  grossSalary: '',
  hra: '',
  specialAllowance: '',
  bonus: '',
  otherIncome: '',
  housePropertyIncome: '',
  capitalGains: '',
  businessIncome: '',
  investments80C: '',
  investments80D: '',
  investments80E: '',
  professionalTax: '',
  tdsPaid: '',
};

export default function TaxScreen() {
  const user = useAuthStore((state) => state.user);
  const navigation = useNavigation();
  const [inputs, setInputs] = useState<typeof DEFAULT_INPUTS>(DEFAULT_INPUTS);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const isBusiness = (user as any)?.employmentType === 'BUSINESS';

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/taxes');
      if (res.data && res.data.length > 0) {
        const recent = res.data[0];
        setInputs({
          grossSalary: recent.grossSalary?.toString() || '',
          hra: recent.hra?.toString() || '',
          specialAllowance: recent.specialAllowance?.toString() || '',
          bonus: recent.bonus?.toString() || '',
          otherIncome: recent.otherIncome?.toString() || '',
          housePropertyIncome: recent.housePropertyIncome?.toString() || '',
          capitalGains: recent.capitalGains?.toString() || '',
          businessIncome: recent.businessIncome?.toString() || '',
          investments80C: recent.investments80C?.toString() || '',
          investments80D: recent.investments80D?.toString() || '',
          investments80E: recent.investments80E?.toString() || '',
          professionalTax: recent.professionalTax?.toString() || '',
          tdsPaid: recent.tdsPaid?.toString() || '',
        });
        setResult(recent);
      }
    } catch (e) {
      console.log('No tax history found');
    } finally {
      setInitialLoad(false);
    }
  };

  const updateInput = (key: keyof typeof DEFAULT_INPUTS, val: string) => {
    setInputs((prev) => ({ ...prev, [key]: val }));
  };

  const calculateAndSave = async () => {
    setLoading(true);
    try {
      const numericInputs = Object.fromEntries(
        Object.entries(inputs).map(([k, v]) => [k, Number(v) || 0])
      );
      const res = await api.post('/taxes/calculate-and-save', { year: 2024, ...numericInputs });
      setResult(res.data);
    } catch (e) {
      console.error('Calculation failed', e);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const InputField = ({ label, fieldKey }: { label: string; fieldKey: keyof typeof DEFAULT_INPUTS }) => (
    <View style={styles.fieldItem}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Text style={styles.currencySymbol}>₹</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="numeric"
          value={inputs[fieldKey]}
          onChangeText={(val) => updateInput(fieldKey, val)}
        />
      </View>
    </View>
  );

  const bestRegime = result ? (result.taxOldRegime < result.taxNewRegime ? 'old' : 'new') : null;
  const savings = result ? Math.abs(result.taxOldRegime - result.taxNewRegime) : 0;

  if (initialLoad) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Tax Assistant</Text>
          <Text style={styles.headerSubtitle}>Comprehensive Calculator</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Form: Income Sources */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Feather name="briefcase" size={16} color={theme.colors.primary} />
            <Text style={styles.formTitle}>Income Sources</Text>
          </View>
          <View style={styles.fieldsContainer}>
            {!isBusiness && (
              <>
                <InputField label="Gross Salary (Annual)" fieldKey="grossSalary" />
                <InputField label="HRA Received" fieldKey="hra" />
                <InputField label="Special Allowance" fieldKey="specialAllowance" />
                <InputField label="Bonus" fieldKey="bonus" />
              </>
            )}
            {isBusiness && (
              <InputField label="Business / Prof. Income" fieldKey="businessIncome" />
            )}
            <InputField label="House Property Income" fieldKey="housePropertyIncome" />
            <InputField label="Capital Gains" fieldKey="capitalGains" />
            <InputField label="Other Income (Interest, etc.)" fieldKey="otherIncome" />
          </View>
        </View>

        {/* Form: Deductions */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Feather name="shield" size={16} color={theme.colors.primary} />
            <Text style={styles.formTitle}>Deductions & Taxes</Text>
          </View>
          <View style={styles.fieldsContainer}>
            <InputField label="Sec 80C (PPF, ELSS, EPF)" fieldKey="investments80C" />
            <InputField label="Sec 80D (Health Insurance)" fieldKey="investments80D" />
            <InputField label="Sec 80E (Education Loan)" fieldKey="investments80E" />
            <InputField label="Professional Tax" fieldKey="professionalTax" />
            <InputField label="TDS Already Paid" fieldKey="tdsPaid" />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.calcButton} 
          onPress={calculateAndSave} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="save" size={18} color="#fff" />
              <Text style={styles.calcButtonText}>Calculate & Save Record</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Results */}
        {result && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Tax Liability (FY 2024-25)</Text>
            <View style={styles.resultsGrid}>
              {/* Old Regime */}
              <View style={[styles.resultCard, bestRegime === 'old' && styles.resultCardActive]}>
                {bestRegime === 'old' && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>✓ Recommended</Text>
                  </View>
                )}
                <Text style={styles.regimeLabel}>Old Regime</Text>
                <Text style={styles.taxAmount}>{formatCurrency(result.taxOldRegime)}</Text>
                <Text style={styles.effRate}>Taxable: {formatCurrency(result.taxableIncomeOld)}</Text>
              </View>

              {/* New Regime */}
              <View style={[styles.resultCard, bestRegime === 'new' && styles.resultCardActive]}>
                {bestRegime === 'new' && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>✓ Recommended</Text>
                  </View>
                )}
                <Text style={styles.regimeLabel}>New Regime</Text>
                <Text style={styles.taxAmount}>{formatCurrency(result.taxNewRegime)}</Text>
                <Text style={styles.effRate}>Taxable: {formatCurrency(result.taxableIncomeNew)}</Text>
              </View>
            </View>

            {/* Savings banner */}
            {savings > 0 && (
              <View style={styles.savingsBanner}>
                <Feather name="check-circle" size={24} color={theme.colors.success} />
                <View style={styles.savingsTextContainer}>
                  <Text style={styles.savingsTitle}>
                    Save {formatCurrency(savings)} by choosing the {bestRegime?.toUpperCase()} regime
                  </Text>
                  <Text style={styles.savingsSubtitle}>
                    Net Tax Payable: {formatCurrency(Math.max(0, Math.min(result.taxOldRegime, result.taxNewRegime) - result.tdsPaid))}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgBase,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDefault,
  },
  backButton: { padding: 4 },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.textPrimary },
  headerSubtitle: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  formCard: {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
  },
  formHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  formTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.textPrimary },
  fieldsContainer: { gap: 16 },
  fieldItem: { gap: 6 },
  label: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '500' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.bgBase, borderWidth: 1, borderColor: theme.colors.borderDefault, borderRadius: 12, paddingHorizontal: 14 },
  currencySymbol: { fontSize: 16, color: theme.colors.textMuted, marginRight: 8 },
  input: { flex: 1, height: 50, fontSize: 16, color: theme.colors.textPrimary },
  calcButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
  },
  calcButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultsSection: { marginTop: 16, gap: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.textPrimary, marginLeft: 4 },
  resultsGrid: { flexDirection: 'row', gap: 12 },
  resultCard: {
    flex: 1,
    backgroundColor: theme.colors.bgSurface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    position: 'relative',
    alignItems: 'center',
  },
  resultCardActive: { borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}05` },
  badge: { position: 'absolute', top: -10, backgroundColor: theme.colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  regimeLabel: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 8, marginBottom: 4 },
  taxAmount: { fontSize: 22, fontWeight: '800', color: theme.colors.textPrimary },
  effRate: { fontSize: 11, color: theme.colors.textMuted, marginTop: 6 },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: `${theme.colors.success}10`,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${theme.colors.success}40`,
  },
  savingsTextContainer: { flex: 1 },
  savingsTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.textPrimary },
  savingsSubtitle: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
});
