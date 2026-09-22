import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, RefreshControl,
  ActivityIndicator, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { api } from '../lib/api';
import { theme, CATEGORY_COLORS } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface Budget {
  id: string;
  category: string;
  limit: number;
  month: number;
  year: number;
}

interface Transaction {
  amount: number;
  type: string;
  category: string;
}

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Education', 'Entertainment', 'Healthcare', 'Investments', 'Others'];

export default function BudgetsScreen() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // Modal form states
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [limit, setLimit] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [budgetsRes, txRes, goalsRes] = await Promise.all([
        api.get('/budgets'),
        api.get('/transactions'),
        api.get('/goals')
      ]);
      setBudgets(budgetsRes.data || []);
      setTransactions(txRes.data || []);
      setGoals(goalsRes.data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const handleSaveBudget = async () => {
    if (!limit || parseFloat(limit) <= 0) {
      Alert.alert('Error', 'Please enter a valid limit greater than 0');
      return;
    }
    setSaving(true);
    try {
      const now = new Date();
      const res = await api.post('/budgets', {
        category,
        limit: parseFloat(limit),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
      // Append new budget to the local list
      setBudgets(prev => [res.data, ...prev]);
      setModalVisible(false);
      Alert.alert('Success', 'Budget set successfully');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBudget = (id: string) => {
    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/budgets/${id}`);
              setBudgets(prev => prev.filter(b => b.id !== id));
            } catch (err) {
              Alert.alert('Error', 'Failed to delete budget');
            }
          },
        },
      ]
    );
  };

  const getCategorySpent = (categoryName: string) => {
    return transactions
      .filter(t => t.type === 'EXPENSE' && t.category === categoryName)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderItem = ({ item }: { item: Budget }) => {
    const spent = getCategorySpent(item.category);
    const progress = Math.min((spent / item.limit) * 100, 100);
    const color = CATEGORY_COLORS[item.category] || theme.colors.primary;
    const isOverBudget = spent > item.limit;

    return (
      <TouchableOpacity 
        style={styles.card} 
        onLongPress={() => handleDeleteBudget(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.categoryInfo}>
            <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
              <Feather name="pie-chart" size={18} color={color} />
            </View>
            <Text style={styles.categoryName}>{item.category}</Text>
          </View>
          <Text style={styles.limitText}>Limit: {formatCurrency(item.limit)}</Text>
        </View>

        <View style={styles.progressHeader}>
          <Text style={styles.spentText}>Spent: {formatCurrency(spent)}</Text>
          <Text style={[styles.remainingText, isOverBudget && styles.overBudgetText]}>
            {isOverBudget ? 'Over Budget' : `Left: ${formatCurrency(item.limit - spent)}`}
          </Text>
        </View>

        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${progress}%`, backgroundColor: isOverBudget ? theme.colors.danger : color }
            ]} 
          />
        </View>
        <Text style={styles.longPressHint}>Hold to delete</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Budgets</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Budgets</Text>
        {budgets.length > 0 ? (
          budgets.map((item) => <React.Fragment key={item.id}>{renderItem({ item })}</React.Fragment>)
        ) : (
          !loading && (
            <View style={styles.emptyState}>
              <Feather name="pie-chart" size={48} color={theme.colors.borderStrong} />
              <Text style={styles.emptyText}>No budgets set up yet.</Text>
            </View>
          )
        )}

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Savings Goals</Text>
        {goals.length > 0 ? (
          goals.map(goal => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            return (
              <View key={goal.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.categoryInfo}>
                    <View style={[styles.iconBox, { backgroundColor: `${theme.colors.success}20` }]}>
                      <Feather name="target" size={18} color={theme.colors.success} />
                    </View>
                    <Text style={styles.categoryName}>{goal.name}</Text>
                  </View>
                  {goal.deadline && <Text style={styles.limitText}>{new Date(goal.deadline).toLocaleDateString()}</Text>}
                </View>

                <View style={styles.progressHeader}>
                  <Text style={styles.spentText}>{formatCurrency(goal.currentAmount)} saved</Text>
                  <Text style={styles.remainingText}>Target: {formatCurrency(goal.targetAmount)}</Text>
                </View>

                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${progress}%`, backgroundColor: theme.colors.success }
                    ]} 
                  />
                </View>
              </View>
            );
          })
        ) : (
          !loading && (
            <View style={[styles.emptyState, { paddingTop: 40 }]}>
              <Feather name="target" size={48} color={theme.colors.borderStrong} />
              <Text style={styles.emptyText}>No goals set up yet.</Text>
            </View>
          )
        )}
        
        {loading && <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => {
          setCategory(CATEGORIES[0]);
          setLimit('');
          setModalVisible(true);
        }}
      >
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Add Budget Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Set New Budget</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Feather name="x" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, category === cat && styles.catChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Monthly Limit (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5000"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              value={limit}
              onChangeText={setLimit}
            />

            <TouchableOpacity
              style={[styles.submitButton, saving && styles.submitButtonDisabled]}
              onPress={handleSaveBudget}
              disabled={saving}
            >
              <Text style={styles.submitButtonText}>
                {saving ? 'Saving...' : 'Save Budget'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDefault,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  listContainer: {
    padding: 20,
    gap: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  limitText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  spentText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  remainingText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  overBudgetText: {
    color: theme.colors.danger,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: theme.colors.bgBase,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  longPressHint: {
    fontSize: 10,
    color: theme.colors.textMuted,
    textAlign: 'right',
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: theme.colors.textMuted,
    marginTop: 16,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.bgBase,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 24 : 48,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDefault,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  modalBody: {
    padding: 20,
    gap: 16,
  },
  label: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: -4,
    fontWeight: '500',
  },
  input: {
    backgroundColor: theme.colors.bgSurface,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.bgSurface,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
  },
  catChipActive: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
  },
  catChipText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  catChipTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
