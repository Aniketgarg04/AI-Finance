import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
  Modal, TextInput, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback
} from 'react-native';
import { api } from '../lib/api';
import { theme, CATEGORY_COLORS } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
  description: string;
}

interface FormData {
  amount: string;
  category: string;
  description: string;
  type: 'EXPENSE' | 'INCOME';
}

const EMPTY_FORM: FormData = { amount: '', category: '', description: '', type: 'EXPENSE' };

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Education', 'Entertainment', 'Healthcare', 'Investments', 'Salary', 'Others'];

export default function ExpensesScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [swipedId, setSwipedId] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      const sorted = (res.data || []).sort((a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setTransactions(sorted);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleImportCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.ms-excel', 'text/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        Alert.alert('CSV Selected', `File: ${result.assets[0].name}\n\nCSV parsing logic would execute here and sync with the backend, mirroring the web dashboard functionality.`);
      }
    } catch (error) {
      console.error('Error selecting document:', error);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions();
  }, []);

  const openAddModal = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setSwipedId(null);
    setModalVisible(true);
  };

  const openEditModal = (tx: Transaction) => {
    setForm({
      amount: String(tx.amount),
      category: tx.category,
      description: tx.description || '',
      type: tx.type,
    });
    setEditingId(tx.id);
    setSwipedId(null);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.amount || !form.category) {
      Alert.alert('Error', 'Amount and Category are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        amount: parseFloat(form.amount),
        type: form.type,
        category: form.category,
        description: form.description,
        date: new Date().toISOString(),
      };

      if (editingId) {
        await api.put(`/transactions/${editingId}`, payload);
        setTransactions(prev =>
          prev.map(t => t.id === editingId ? { ...t, ...payload } : t)
        );
      } else {
        const res = await api.post('/transactions', payload);
        setTransactions(prev => [res.data, ...prev]);
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setSwipedId(null) },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/transactions/${id}`);
              setTransactions(prev => prev.filter(t => t.id !== id));
              setSwipedId(null);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

  const renderItem = ({ item }: { item: Transaction }) => {
    const color = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Others;
    const isSwipedOpen = swipedId === item.id;

    return (
      <TouchableWithoutFeedback onPress={() => swipedId ? setSwipedId(null) : undefined}>
        <View style={styles.txWrapper}>
          {/* Action buttons revealed on swipe */}
          {isSwipedOpen && (
            <View style={styles.swipeActions}>
              <TouchableOpacity style={styles.editAction} onPress={() => openEditModal(item)}>
                <Feather name="edit-2" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteAction} onPress={() => handleDelete(item.id)}>
                <Feather name="trash-2" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {/* Main transaction card */}
          <TouchableOpacity
            style={styles.txItem}
            onLongPress={() => setSwipedId(isSwipedOpen ? null : item.id)}
            onPress={() => {
              if (isSwipedOpen) { setSwipedId(null); } else { openEditModal(item); }
            }}
            activeOpacity={0.85}
          >
            <View style={styles.txLeft}>
              <View style={[styles.txIcon, { backgroundColor: `${color}20` }]}>
                <Feather
                  name={item.type === 'INCOME' ? 'arrow-down-left' : 'shopping-bag'}
                  size={20}
                  color={color}
                />
              </View>
              <View>
                <Text style={styles.txTitle} numberOfLines={1}>
                  {item.description || item.category}
                </Text>
                <Text style={styles.txCategory}>
                  {item.category} • {new Date(item.date).toLocaleDateString('en-IN')}
                </Text>
              </View>
            </View>
            <View style={styles.txRight}>
              <Text style={[styles.txAmount, { color: item.type === 'INCOME' ? theme.colors.success : theme.colors.textPrimary }]}>
                {item.type === 'INCOME' ? '+' : '-'}{formatCurrency(item.amount)}
              </Text>
              <Text style={styles.tapHint}>tap to edit</Text>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>All Transactions</Text>
          <Text style={styles.headerSubtitle}>{transactions.length} total entries</Text>
        </View>
        <TouchableOpacity style={styles.importButton} onPress={handleImportCSV}>
          <Feather name="upload" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.importText}>Import CSV</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Feather name="arrow-down-left" size={14} color={theme.colors.success} />
          <Text style={styles.summaryLabel}>Credits</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.success }]}>{formatCurrency(totalIncome)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Feather name="arrow-up-right" size={14} color={theme.colors.danger} />
          <Text style={styles.summaryLabel}>Debits</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.danger }]}>{formatCurrency(totalExpense)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Feather name="list" size={14} color={theme.colors.primary} />
          <Text style={styles.summaryLabel}>Count</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>{transactions.length}</Text>
        </View>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={48} color={theme.colors.borderStrong} />
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptyText}>Tap "+" to record your first income or expense.</Text>
            </View>
          ) : null
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Add / Edit Transaction Modal */}
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
            <Text style={styles.modalTitle}>{editingId ? 'Edit Transaction' : 'Add Transaction'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Feather name="x" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {/* Type Selector */}
            <View style={styles.typeSelector}>
              {(['EXPENSE', 'INCOME'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeButton, form.type === t && (t === 'EXPENSE' ? styles.typeExpenseActive : styles.typeIncomeActive)]}
                  onPress={() => setForm(f => ({ ...f, type: t }))}
                >
                  <Text style={[styles.typeText, form.type === t && styles.typeTextActive]}>
                    {t === 'EXPENSE' ? 'Expense' : 'Income'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Amount (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 1500"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="numeric"
              value={form.amount}
              onChangeText={v => setForm(f => ({ ...f, amount: v }))}
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, form.category === cat && styles.catChipActive]}
                  onPress={() => setForm(f => ({ ...f, category: cat }))}
                >
                  <Text style={[styles.catChipText, form.category === cat && styles.catChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Dinner with friends"
              placeholderTextColor={theme.colors.textMuted}
              value={form.description}
              onChangeText={v => setForm(f => ({ ...f, description: v }))}
            />

            <TouchableOpacity
              style={[styles.submitButton, saving && styles.submitButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.submitButtonText}>
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Transaction'}
              </Text>
            </TouchableOpacity>

            {editingId && (
              <TouchableOpacity
                style={styles.deleteModalButton}
                onPress={() => { setModalVisible(false); handleDelete(editingId); }}
              >
                <Feather name="trash-2" size={16} color={theme.colors.danger} />
                <Text style={styles.deleteModalButtonText}>Delete Transaction</Text>
              </TouchableOpacity>
            )}
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
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDefault,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    backgroundColor: theme.colors.bgSurface,
  },
  importText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bgSurface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDefault,
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: theme.colors.borderDefault,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
    gap: 10,
  },
  txWrapper: {
    position: 'relative',
  },
  swipeActions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    zIndex: 0,
  },
  editAction: {
    width: 60,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteAction: {
    width: 60,
    backgroundColor: theme.colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.bgSurface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    zIndex: 1,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  txIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 3,
    maxWidth: 160,
  },
  txCategory: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tapHint: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
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
  // Modal
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
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bgSurface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 4,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeExpenseActive: { backgroundColor: theme.colors.danger },
  typeIncomeActive: { backgroundColor: theme.colors.success },
  typeText: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  typeTextActive: {
    color: '#fff',
  },
  label: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: -8,
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
  deleteModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${theme.colors.danger}40`,
    backgroundColor: `${theme.colors.danger}10`,
  },
  deleteModalButtonText: {
    color: theme.colors.danger,
    fontWeight: '600',
    fontSize: 15,
  },
});
