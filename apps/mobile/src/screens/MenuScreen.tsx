import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../constants/theme';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../store/auth.store';
import { useNavigation } from '@react-navigation/native';

export default function MenuScreen() {
  const logout = useAuthStore((state) => state.logout);
  const navigation = useNavigation<any>();

  const menuItems = [
    { title: 'Budgets', icon: 'pie-chart', color: theme.colors.warning, route: 'Budgets' },
    { title: 'Portfolio', icon: 'trending-up', color: theme.colors.success, route: 'Portfolio' },
    { title: 'Tax Assistant', icon: 'file-text', color: theme.colors.info, route: 'Tax' },
    { title: 'Fraud Alerts', icon: 'shield', color: theme.colors.danger, route: 'Fraud' },
    { title: 'Reports & Export', icon: 'download', color: theme.colors.primary, route: 'Reports' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More Tools</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.card}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                <Feather name={item.icon as any} size={24} color={item.color} />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Feather name="log-out" size={20} color={theme.colors.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDefault,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  scrollContent: {
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  card: {
    width: '47%',
    backgroundColor: theme.colors.bgSurface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderDefault,
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 40,
    padding: 16,
    backgroundColor: `${theme.colors.danger}15`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${theme.colors.danger}30`,
  },
  logoutText: {
    color: theme.colors.danger,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
