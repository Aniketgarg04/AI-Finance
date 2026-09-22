import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { api } from '../lib/api';
import { theme } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface FraudAlert {
  id: string;
  transactionId: string | null;
  reason: string;
  resolved: boolean;
  createdAt: string;
}

export default function FraudScreen() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      // Sort unresolved first, then by date
      const sorted = (res.data || []).sort((a: any, b: any) => {
        if (a.resolved === b.resolved) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.resolved ? 1 : -1;
      });
      setAlerts(sorted);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAlerts();
  }, []);

  const resolveAlert = async (id: string) => {
    try {
      await api.put(`/alerts/${id}`, { resolved: true });
      fetchAlerts();
      Alert.alert('Success', 'Alert marked as resolved.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resolve alert.');
    }
  };

  const renderItem = ({ item }: { item: FraudAlert }) => {
    return (
      <View style={[styles.card, item.resolved && styles.cardResolved]}>
        <View style={styles.cardHeader}>
          <View style={styles.alertInfo}>
            <View style={[styles.iconBox, { backgroundColor: item.resolved ? `${theme.colors.success}20` : `${theme.colors.danger}20` }]}>
              <Feather name={item.resolved ? 'check-circle' : 'alert-triangle'} size={20} color={item.resolved ? theme.colors.success : theme.colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.reasonText}>{item.reason}</Text>
              <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {!item.resolved && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.resolveButton} onPress={() => resolveAlert(item.id)}>
              <Text style={styles.resolveButtonText}>Mark as Resolved</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fraud Alerts</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        ListHeaderComponent={
          <View style={styles.infoBanner}>
            <Feather name="shield" size={20} color={theme.colors.primary} />
            <Text style={styles.infoBannerText}>
              Our AI constantly monitors your transactions for unusual activity.
            </Text>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Feather name="check-circle" size={48} color={theme.colors.success} />
              <Text style={styles.emptyText}>No suspicious activity detected!</Text>
            </View>
          ) : (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
          )
        }
      />
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
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primarySoft,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
    marginBottom: 20,
    alignItems: 'center',
    gap: 12,
  },
  infoBannerText: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  listContainer: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: theme.colors.bgSurface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  cardResolved: {
    borderColor: theme.colors.borderDefault,
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alertInfo: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reasonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  actions: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderDefault,
    alignItems: 'flex-end',
  },
  resolveButton: {
    backgroundColor: theme.colors.bgBase,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  resolveButtonText: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: theme.colors.textMuted,
    marginTop: 16,
    fontSize: 16,
  },
});
