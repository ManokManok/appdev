import React, { useCallback } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import StatusBadge from '../components/ui/StatusBadge';
import ScreenHeader from '../components/ui/ScreenHeader';
import { useAuth } from './auth/AuthContext';
import { getPayments } from '../core/api/customer';
import { useRealtimeRefresh } from '../core/realtime/RealtimeContext';
import { useRefreshableData } from '../hooks/useRefreshableData';
import { COLORS, SPACING, TYPOGRAPHY, formatPrice } from '../utils';

const PaymentsScreen = () => {
  const { user } = useAuth();

  const loadPayments = useCallback(async () => {
    try {
      const response = await getPayments(user.token);
      return response.data || [];
    } catch (error) {
      Alert.alert('Payments', error.message);
      return [];
    }
  }, [user?.token]);

  const { data: payments, refreshing, refresh, reload } = useRefreshableData(loadPayments, {
    enabled: !!user?.token,
  });

  const paymentList = payments ?? [];

  const refreshPayments = useCallback(async () => {
    try {
      await reload();
    } catch (error) {
      Alert.alert('Payments', error.message);
    }
  }, [reload]);

  useRealtimeRefresh(['payment.created', 'order.updated'], refreshPayments);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[COLORS.primary]} />
      }
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        title="Payment History"
        subtitle="Receipts for completed transactions"
      />

      {paymentList.length ? (
        paymentList.map(payment => (
          <Card key={payment.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.iconWrap}>
                <Ionicons name="wallet-outline" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.cardMain}>
                <Text style={styles.title}>Order #{payment.order?.id ?? '—'}</Text>
                <Text style={styles.amount}>{formatPrice(payment.amount)}</Text>
              </View>
              <StatusBadge status={payment.status} />
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.meta}>{payment.method}</Text>
              {payment.paidAt ? (
                <>
                  <Text style={styles.dot}>·</Text>
                  <Text style={styles.date}>
                    {new Date(payment.paidAt).toLocaleString()}
                  </Text>
                </>
              ) : null}
            </View>
          </Card>
        ))
      ) : (
        <EmptyState
          icon="💳"
          title="No payments yet"
          message="Pay a pending order from the Orders tab to see receipts here."
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundWarm },
  content: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  card: { marginBottom: SPACING.md },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMain: { flex: 1 },
  title: { ...TYPOGRAPHY.h3, color: COLORS.text, marginBottom: 4 },
  amount: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  meta: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, textTransform: 'capitalize' },
  dot: { marginHorizontal: SPACING.sm, color: COLORS.textMuted },
  date: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted },
});

export default PaymentsScreen;
