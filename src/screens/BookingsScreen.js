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
import { createPayment, getBookings } from '../core/api/customer';
import { useRealtimeRefresh } from '../core/realtime/RealtimeContext';
import { useRefreshableData } from '../hooks/useRefreshableData';
import { useBusyAction } from '../hooks/useBusyAction';
import { COLORS, SPACING, TYPOGRAPHY, formatPrice } from '../utils';

const markBookingPaid = booking => ({
  ...booking,
  status: 'CONFIRMED',
  order: booking.order ? { ...booking.order, status: 'PAID' } : booking.order,
});

const BookingsScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();

  const loadBookings = useCallback(async () => {
    try {
      const response = await getBookings(user.token);
      return response.data || [];
    } catch (error) {
      Alert.alert('Bookings', error.message);
      return [];
    }
  }, [user?.token]);

  const { data: bookings, setData, refreshing, refresh, reload } = useRefreshableData(loadBookings, {
    enabled: !!user?.token,
  });

  const bookingList = bookings ?? [];
  const { run, isBusy } = useBusyAction();

  const refreshBookings = useCallback(async () => {
    try {
      await reload();
    } catch (error) {
      Alert.alert('Bookings', error.message);
    }
  }, [reload]);

  useRealtimeRefresh(['booking.created', 'booking.updated', 'order.updated'], refreshBookings);

  useFocusEffect(
    useCallback(() => {
      if (route.params?.refreshAt) {
        reload();
        navigation.setParams({ refreshAt: undefined });
      }
    }, [route.params?.refreshAt, reload, navigation])
  );

  const handlePay = booking => {
    const order = booking?.order;
    if (!order?.id) {
      Alert.alert('Payment', 'This booking does not have an order to pay yet.');
      return;
    }

    run(`pay-booking-${booking.id}`, async () => {
      const previous = bookingList;
      setData(list =>
        list.map(item => (item.id === booking.id ? markBookingPaid(item) : item))
      );

      try {
        await createPayment(user.token, {
          orderId: order.id,
          amount: order.totalAmount,
          method: 'card',
        });
        Alert.alert('Payment successful', `Booking #${booking.id} is now confirmed.`);
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
        title="Your Bookings"
        subtitle="Upcoming visits and scheduled repairs"
      />

      {bookingList.length ? (
        bookingList.map(booking => (
          <Card key={booking.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.iconWrap}>
                <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.cardMain}>
                <Text style={styles.title}>{booking.product?.name ?? 'Service'}</Text>
                <Text style={styles.date}>
                  {booking.scheduledAt
                    ? new Date(booking.scheduledAt).toLocaleString()
                    : 'Date pending'}
                </Text>
              </View>
              <StatusBadge status={booking.status} />
            </View>

            {booking.order ? (
              <View style={styles.orderRow}>
                <Ionicons name="link-outline" size={16} color={COLORS.primary} />
                <Text style={styles.orderLink}>
                  Order #{booking.order.id} · {booking.order.status}
                  {booking.order.totalAmount != null
                    ? ` · ${formatPrice(booking.order.totalAmount)}`
                    : ''}
                </Text>
              </View>
            ) : null}

            {booking.order?.status === 'PENDING' ? (
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => handlePay(booking)}
                disabled={isBusy(`pay-booking-${booking.id}`)}
                activeOpacity={0.85}
              >
                {isBusy(`pay-booking-${booking.id}`) ? (
                  <ActivityIndicator size="small" color={COLORS.textOnPrimary} />
                ) : (
                  <Ionicons name="card-outline" size={18} color={COLORS.textOnPrimary} />
                )}
                <Text style={styles.payButtonText}>
                  {isBusy(`pay-booking-${booking.id}`) ? 'Processing…' : 'Pay Now'}
                </Text>
              </TouchableOpacity>
            ) : null}

            {booking.notes ? (
              <Text style={styles.notes}>{booking.notes}</Text>
            ) : null}
          </Card>
        ))
      ) : (
        <EmptyState
          icon="📅"
          title="No bookings yet"
          message="Tap Schedule on a service from Home to book a visit."
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
  date: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  orderLink: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary,
    fontWeight: '600',
    flex: 1,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm + 4,
    borderRadius: 14,
    marginTop: SPACING.md,
  },
  payButtonText: { color: COLORS.textOnPrimary, fontWeight: '700', fontSize: 15 },
  notes: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
});

export default BookingsScreen;
