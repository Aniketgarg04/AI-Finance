import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useAuthStore } from '../store/auth.store';
import { api } from '../lib/api';
import { theme, CATEGORY_COLORS } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
  description: string;
}

interface Budget {
  id: string;
  category: string;
  limit: number;
}

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigation = useNavigation<any>();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [txRes, budgetsRes, summaryRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/budgets'),
        api.get('/dashboard/summary')
      ]);
      setTransactions(txRes.data || []);
      setBudgets(budgetsRes.data || []);
      setSummary(summaryRes.data || null);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);



  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Category breakdown for donut chart
  const categoryMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'EXPENSE')
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
    
  const DONUT_COLORS = ['#fb923c', '#2dd4bf', '#f472b6', '#fbbf24', '#60a5fa', '#818cf8', '#c084fc', '#4ade80', '#94a3b8'];
  const pieData = Object.entries(categoryMap).map(([name, amount], i) => ({
    name,
    amount,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
    legendFontColor: theme.colors.textSecondary,
    legendFontSize: 12
  }));

  // Line Chart Data
  const dateMap: Record<string, number> = {};
  const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let currentBal = 0;
  sortedTx.forEach(t => {
    currentBal += t.type === 'INCOME' ? t.amount : -t.amount;
    const d = new Date(t.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    dateMap[d] = currentBal;
  });
  
  const labels = Object.keys(dateMap).slice(-6); // last 6 active days
  const data = Object.values(dateMap).slice(-6);
  
  if (labels.length === 0) {
    labels.push('Today');
    data.push(0);
  }
  
  const screenWidth = Dimensions.get("window").width;

  const hour = new Date().getHours();
  const greetingText = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || '';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greetingText}{firstName ? `, ${firstName}` : ''}</Text>
          <Text style={styles.subGreeting}>Here's your financial overview</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Feather name="log-out" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {/* KPI Grid */}
        {summary && (
          <View style={styles.kpiGrid}>
            {[
              { title: 'Net Worth', value: summary.netWorth, icon: 'briefcase', color: '#3b82f6' },
              { title: 'Investments', value: summary.totalInvestments, icon: 'pie-chart', color: '#8b5cf6' },
              { title: 'Cash Balance', value: summary.cashBalance, icon: 'dollar-sign', color: '#10b981' },
              { title: 'Emergency', value: summary.emergencyFund, icon: 'shield', color: '#f59e0b' },
              { title: 'Savings', value: summary.monthlySavings, icon: 'trending-up', color: '#06b6d4' },
              { title: 'EMI', value: summary.emiExpenses, icon: 'credit-card', color: '#ef4444' },
              { title: 'Tax Liab.', value: summary.taxLiability, icon: 'file-text', color: '#f43f5e' },
              { title: 'Active Budgets', value: summary.activeBudgetsCount, icon: 'target', color: '#84cc16', noCurrency: true }
            ].map((kpi, idx) => (
              <View key={idx} style={styles.kpiCard}>
                <View style={styles.kpiHeaderRow}>
                  <Text style={styles.kpiGridTitle}>{kpi.title}</Text>
                  <Feather name={kpi.icon as any} size={14} color={theme.colors.textMuted} />
                </View>
                <Text style={styles.kpiGridValue}>
                  {kpi.noCurrency ? kpi.value : formatCurrency(kpi.value)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Smart Insights */}
        {summary?.insights?.length > 0 && (
          <View style={styles.insightsCard}>
            <View style={styles.insightsHeader}>
              <Feather name="alert-circle" size={18} color="#f59e0b" />
              <Text style={styles.insightsTitle}>Smart Insights</Text>
            </View>
            {summary.insights.map((insight: string, idx: number) => (
              <View key={idx} style={styles.insightRow}>
                <Text style={styles.insightDot}>•</Text>
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Line Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Balance Trend</Text>
          <LineChart
            data={{
              labels: labels,
              datasets: [{ data: data }]
            }}
            width={screenWidth - 40}
            height={220}
            yAxisLabel="₹"
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: theme.colors.bgSurface,
              backgroundGradientFrom: theme.colors.bgSurface,
              backgroundGradientTo: theme.colors.bgSurface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
              labelColor: (opacity = 1) => theme.colors.textSecondary,
              style: { borderRadius: 16 },
              propsForDots: { r: "4", strokeWidth: "2", stroke: theme.colors.primary }
            }}
            bezier
            style={styles.chartStyle}
          />
        </View>

        {/* Donut Chart */}
        {pieData.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Expenses by Category</Text>
            <View style={styles.pieCard}>
              <PieChart
                data={pieData}
                width={screenWidth - 40}
                height={200}
                chartConfig={{
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor={"amount"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                absolute
              />
            </View>
          </View>
        )}

        {/* Budget Progress Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Budget Progress</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Budgets')}>
            <Text style={styles.seeAll}>Manage</Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 12 }} />
        ) : budgets.length === 0 ? (
          <View style={styles.emptyStateSection}>
            <Text style={styles.emptyStateText}>No budgets set up yet.</Text>
          </View>
        ) : (
          <View style={styles.budgetList}>
            {budgets.slice(0, 3).map((b) => {
              const spent = transactions
                .filter(t => t.type === 'EXPENSE' && t.category === b.category)
                .reduce((sum, t) => sum + t.amount, 0);
              const progress = Math.min((spent / b.limit) * 100, 100);
              const color = CATEGORY_COLORS[b.category] || theme.colors.primary;
              const isOver = spent > b.limit;
              return (
                <View key={b.id} style={styles.budgetItem}>
                  <View style={styles.budgetRow}>
                    <Text style={styles.budgetName}>{b.category}</Text>
                    <Text style={styles.budgetValue}>{formatCurrency(spent)} / {formatCurrency(b.limit)}</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { width: `${progress}%`, backgroundColor: isOver ? theme.colors.danger : color }
                      ]} 
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Expenses')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <Text style={styles.loadingText}>Loading transactions...</Text>
        ) : recentTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={40} color={theme.colors.borderStrong} />
            <Text style={styles.emptyText}>No transactions yet.</Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {recentTransactions.map((tx) => {
              const color = CATEGORY_COLORS[tx.category] || CATEGORY_COLORS.Others;
              return (
                <View key={tx.id} style={styles.txItem}>
                  <View style={styles.txLeft}>
                    <View style={[styles.txIcon, { backgroundColor: `${color}20` }]}>
                      <Feather name={tx.type === 'INCOME' ? 'arrow-down' : 'shopping-bag'} size={18} color={color} />
                    </View>
                    <View>
                      <Text style={styles.txTitle}>{tx.description || tx.category}</Text>
                      <Text style={styles.txCategory}>{tx.category} • {new Date(tx.date).toLocaleDateString()}</Text>
                    </View>
                  </View>
                  <Text style={[styles.txAmount, { color: tx.type === 'INCOME' ? theme.colors.success : theme.colors.textPrimary }]}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bgBase,
    paddingTop: 50, // basic safe area
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  subGreeting: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: theme.colors.bgSurface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  kpiCard: {
    width: '48%',
    backgroundColor: theme.colors.bgSurface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  kpiGridTitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  kpiGridValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  insightsCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: theme.colors.bgSurface,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  insightDot: {
    color: '#f59e0b',
    fontSize: 16,
    lineHeight: 18,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  chartContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  chartStyle: {
    marginVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
  },
  pieCard: {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    paddingVertical: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  loadingText: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: theme.colors.textMuted,
    marginTop: 12,
  },
  transactionsList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
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
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  txIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  txCategory: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Budget Progress styling
  budgetList: {
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 16,
  },
  budgetItem: {
    backgroundColor: theme.colors.bgSurface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetName: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  budgetValue: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: theme.colors.bgBase,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyStateSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  emptyStateText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
});
