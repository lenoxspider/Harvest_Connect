// src/screens/common/MyTransactionsScreen.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { paymentApi } from '../../api/paymentApi';
import { useAuth } from '../../context/AuthContext';
import { Transaction } from '../../types';

export default function MyTransactionsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // API States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Theme configuration based on user role
  const theme = useMemo(() => {
    if (!user) return { primary: '#2C3E50', bg: '#F8F9FA' };
    switch (user.role) {
      case 'FARMER':
        return { primary: '#1E5631', bg: '#EDF4ED' };
      case 'STORAGE_OWNER':
        return { primary: '#1565C0', bg: '#E3F2FD' };
      case 'TRANSPORTER':
        return { primary: '#E65100', bg: '#FFE0B2' };
      case 'BUYER':
        return { primary: '#7B1FA2', bg: '#F3E5F5' };
      default:
        return { primary: '#2C3E50', bg: '#F8F9FA' };
    }
  }, [user]);

  const loadTransactions = async (isRefreshed = false) => {
    if (isRefreshed) setRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await paymentApi.getMyTransactions();
      setTransactions(data);
    } catch (e) {
      console.error('Error fetching transactions:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  // Compute stats
  const stats = useMemo(() => {
    let total = 0;
    let pending = 0;
    
    transactions.forEach((tx) => {
      if (tx.status === 'COMPLETED') {
        total += tx.amount;
      } else if (tx.status === 'PENDING') {
        pending += tx.amount;
      }
    });

    const commission = total * 0.10; // 10% Platform Commission
    const netEarnings = total - commission;

    return {
      total: total.toLocaleString(),
      pending: pending.toLocaleString(),
      commission: commission.toLocaleString(),
      netEarnings: netEarnings.toLocaleString(),
    };
  }, [transactions]);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return { bg: '#C8E6C9', text: '#1B5E20' };
      case 'PENDING':
        return { bg: '#FFE0B2', text: '#E65100' };
      case 'FAILED':
        return { bg: '#FFCDD2', text: '#B71C1C' };
      default:
        return { bg: '#EEEEEE', text: '#757575' };
    }
  };

  const renderTransactionCard = ({ item }: { item: Transaction }) => {
    const statusConfig = getStatusColor(item.status);
    const dateFormatted = item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Jul 5, 2026';
    const isEarned = user?.role !== 'BUYER'; // Sellers earn, buyers pay

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.txType} numberOfLines={1}>
              {item.type} TRANSACTION
            </Text>
            <Text style={styles.txId}>Ref ID: {item.id.substring(0, 8).toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusText, { color: statusConfig.text }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>📅 {dateFormatted}</Text>
          <Text style={[styles.amountText, { color: isEarned ? '#2E7D32' : '#C62828' }]}>
            {isEarned ? '+' : '-'} GHS {item.amount.toLocaleString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

      {/* CURVED HEADER */}
      <View style={[styles.header, { backgroundColor: theme.primary, paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Transactions 🧾</Text>
        <View style={styles.backBtn} />
      </View>

      {/* NET EARNINGS / STATS SUMMARY */}
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>GHS {stats.netEarnings}</Text>
            <Text style={styles.statLbl}>{user?.role === 'BUYER' ? 'Total Spent' : 'Net Earnings'}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>GHS {stats.pending}</Text>
            <Text style={styles.statLbl}>Pending Payments</Text>
          </View>
          {user?.role !== 'BUYER' && (
            <View style={styles.statItem}>
              <Text style={styles.statVal}>GHS {stats.commission}</Text>
              <Text style={styles.statLbl}>Commission (10%)</Text>
            </View>
          )}
        </View>
      </View>

      {/* TRANSACTION LIST */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listScroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadTransactions(true)} colors={[theme.primary]} />
          }
          renderItem={renderTransactionCard}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No transaction records available.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212121',
  },
  statLbl: {
    fontSize: 9,
    color: '#757575',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  listScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  txType: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#212121',
  },
  txId: {
    fontSize: 10,
    color: '#9E9E9E',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    color: '#757575',
  },
  amountText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '600',
  },
});
