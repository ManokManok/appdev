import React, { useCallback } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import StatusBadge from '../components/ui/StatusBadge';
import ScreenHeader from '../components/ui/ScreenHeader';
import { useAuth } from './auth/AuthContext';
import { createPayment, getOrders } from '../core/api/customer';
import { useRealtimeRefresh } from '../core/realtime/RealtimeContext';
import { useRefreshableData } from '../hooks/useRefreshableData';
import { useBusyAction } from '../hooks/useBusyAction';
import { COLORS, SPACING, TYPOGRAPHY, formatPrice } from '../utils';

const OrdersScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();

  const loadOrders = useCallback(async () => {
    try {
      const response = await getOrders(user.token);
      const raw = response.data || [];
      return raw.filter(order => !order.booking);
    } catch (error) {
      Alert.alert('Orders', error.message);
      return [];
    }
  }, [user?.token]);

  const { data: orders, setData, refreshing, refresh, reload } = useRefreshableData(loadOrders, {
    enabled: !!user?.token,
  });

  const orderList = orders ?? [];
  const { run, isBusy } = useBusyAction();

  const refreshOrders = useCallback(async () => {
    try {
      await reload();
    } catch (error) {
      Alert.alert('Orders', error.message);
    }
  }, [reload]);

  useRealtimeRefresh(['order.created', 'order.updated'], refreshOrders);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.refreshAt) {
        reload();
        navigation.setParams({ refreshAt: undefined });
      }
    }, [route.params?.refreshAt, reload, navigation])
  );

  const handlePay = order => {
    run(`pay-order-${order.id}`, async () => {
      const previous = orderList;
      setData(list =>
        list.map(item =>
          item.id === order.id ? { ...item, status: 'PAID' } : item
        )
      );

      try {
        await createPayment(user.token, {
          orderId: order.id,
          amount: order.totalAmount,
          method: 'card',
        });
        Alert.alert('Payment successful', `Order #${order.id} is now paid.`);
      } catch (error) {
        setData(previous);
        Alert.alert('Payment failed', error.message);
      }
    });
  };

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
        title="Your Orders"
        subtitle="Track repairs and pay when you're ready"
      />

      {orderList.length ? (
        orderList.map(order => (
          <Card key={order.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.iconWrap}>
                <Ionicons name="construct-outline" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.cardMain}>
                <Text style={styles.title}>{order.product?.name ?? 'Service'}</Text>
                <Text style={styles.orderId}>Order #{order.id}</Text>
              </View>
              <StatusBadge status={order.status} />
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.meta}>Qty {order.quantity}</Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.price}>{formatPrice(order.totalAmount)}</Text>
            </View>

            {order.status === 'PENDING' && (
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => handlePay(order)}
                disabled={isBusy(`pay-order-${order.id}`)}
                activeOpacity={0.85}
              >
                {isBusy(`pay-order-${order.id}`) ? (
                  <ActivityIndicator size="small" color={COLORS.textOnPrimary} />
                ) : (
                  <Ionicons name="card-outline" size={18} color={COLORS.textOnPrimary} />
                )}
                <Text style={styles.payButtonText}>
                  {isBusy(`pay-order-${order.id}`) ? 'Processing…' : 'Pay Now'}
                </Text>
              </TouchableOpacity>
            )}
          </Card>
        ))
      ) : (
        <EmptyState
          icon="📦"
          title="No orders yet"
          message="Place an order from the Home tab to see it here."
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
    marginBottom: SPACING.md,
    gap: SPACING.sm,
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
  title: { ...TYPOGRAPHY.h3, color: COLORS.text, marginBottom: 2 },
  orderId: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  meta: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  dot: { marginHorizontal: SPACING.sm, color: COLORS.textMuted },
  price: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm + 4,
    borderRadius: 14,
  },
  payButtonText: { color: COLORS.textOnPrimary, fontWeight: '700', fontSize: 15 },
});

export default OrdersScreen;
