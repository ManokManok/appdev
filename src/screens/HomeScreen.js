import React, { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import CustomButton from '../components/CustomButton';
import { useAuth } from './auth/AuthContext';
import { getProducts, createOrder, createBooking } from '../core/api/customer';
import { useRealtimeRefresh } from '../core/realtime/RealtimeContext';
import { useRefreshableData } from '../hooks/useRefreshableData';
import { useBusyAction } from '../hooks/useBusyAction';
import { COLORS, ROUTES, SPACING, TYPOGRAPHY, formatPrice } from '../utils';

const HomeScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const loadProducts = useCallback(async () => {
    try {
      const response = await getProducts(user.token);
      return response.data || [];
    } catch (error) {
      Alert.alert('Services unavailable', error.message);
      return [];
    }
  }, [user?.token]);

  const {
    data: products,
    isLoading,
    refreshing,
    refresh,
    reload,
  } = useRefreshableData(loadProducts, { enabled: !!user?.token });

  const productList = products ?? [];

  const fetchProducts = useCallback(async () => {
    try {
      await reload();
    } catch (error) {
      Alert.alert('Services unavailable', error.message);
    }
  }, [reload]);

  useRealtimeRefresh(['products.'], fetchProducts);

  const { run, isBusy } = useBusyAction();

  const handleOrder = product => {
    if (!user?.token) {
      Alert.alert('Not signed in', 'Please sign in to place an order.');
      return;
    }

    const key = `order-${product.id}`;
    run(key, async () => {
      try {
        await createOrder(user.token, { productId: product.id, quantity: 1 });
        Alert.alert('Order created', `${product.name} has been added to your orders.`);
        navigation.navigate(ROUTES.ORDERS, { refreshAt: Date.now() });
      } catch (error) {
        Alert.alert('Order failed', error.message);
      }
    });
  };

  const handleSchedule = product => {
    if (!user?.token) {
      Alert.alert('Not signed in', 'Please sign in to schedule a booking.');
      return;
    }

    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + 7);
    const key = `booking-${product.id}`;

    run(key, async () => {
      try {
        await createBooking(user.token, {
          productId: product.id,
          scheduledAt: scheduledAt.toISOString(),
          notes: 'Scheduled from ONINS mobile app',
        });
        Alert.alert(
          'Booking scheduled',
          `${product.name} is booked for ${scheduledAt.toLocaleDateString()}.`
        );
        navigation.navigate(ROUTES.BOOKINGS, { refreshAt: Date.now() });
      } catch (error) {
        Alert.alert('Booking failed', error.message);
      }
    });
  };

  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.pagePadding}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={COLORS.textOnPrimary}
          colors={[COLORS.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { paddingTop: insets.top + SPACING.lg }]}>
        <View style={styles.heroOrb1} />
        <View style={styles.heroOrb2} />

        <View style={styles.heroBadge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>{"Cebu's trusted repair shop"}</Text>
        </View>

        <Text style={styles.heroTitle}>
          Your device.{'\n'}
          Fixed <Text style={styles.heroEm}>right.</Text> Fixed fast.
        </Text>
        <Text style={styles.heroDesc}>
          Certified technicians, genuine parts, and transparent pricing — synced with ONINS web.
        </Text>
      </View>

      <View style={styles.body}>
        <Card style={styles.welcomeCard}>
          <View style={styles.welcomeRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.welcomeCopy}>
              <Text style={styles.welcomeGreeting}>Good to see you</Text>
              <Text style={styles.welcomeName}>Hi, {firstName}</Text>
            </View>
          </View>
          <Text style={styles.welcomeSubtitle}>
            Browse services below. Order parts or schedule a visit — everything syncs with your web account.
          </Text>
          <CustomButton
            label="My Profile"
            variant="secondary"
            size="sm"
            onPress={() => navigation.navigate(ROUTES.PROFILE)}
            containerStyle={styles.profileBtn}
          />
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Repair Services</Text>
          <Text style={styles.sectionSubtitle}>Order now or schedule a visit</Text>
        </View>

        {isLoading && !productList.length ? (
          <Card style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading services from ONINS…</Text>
          </Card>
        ) : productList.length ? (
          productList.map(product => (
            <Card key={product.id} style={styles.productCard}>
              {product.category ? (
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryText}>{product.category}</Text>
                </View>
              ) : null}
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productIssue}>{product.issue}</Text>
              <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.orderBtn, isBusy(`order-${product.id}`) && styles.actionBtnBusy]}
                  onPress={() => handleOrder(product)}
                  disabled={isBusy(`order-${product.id}`)}
                  activeOpacity={0.85}
                >
                  {isBusy(`order-${product.id}`) ? (
                    <ActivityIndicator size="small" color={COLORS.textOnPrimary} />
                  ) : (
                    <Ionicons name="cart-outline" size={18} color={COLORS.textOnPrimary} />
                  )}
                  <Text style={styles.actionBtnText}>
                    {isBusy(`order-${product.id}`) ? 'Ordering…' : 'Order'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.scheduleBtn, isBusy(`booking-${product.id}`) && styles.actionBtnBusy]}
                  onPress={() => handleSchedule(product)}
                  disabled={isBusy(`booking-${product.id}`)}
                  activeOpacity={0.85}
                >
                  {isBusy(`booking-${product.id}`) ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                  )}
                  <Text style={[styles.actionBtnText, styles.scheduleBtnText]}>
                    {isBusy(`booking-${product.id}`) ? 'Scheduling…' : 'Schedule'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        ) : (
          <EmptyState
            icon="🔧"
            title="No services yet"
            message="Start the ONINS backend (Symfony on port 8000) and reload fixtures if this is a fresh database."
          />
        )}
      </View>

      <View style={styles.footerSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundWarm,
  },
  pagePadding: {
    paddingBottom: SPACING.xl,
  },
  hero: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl + SPACING.lg,
    overflow: 'hidden',
  },
  heroOrb1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.heroGlow,
    top: -60,
    right: -40,
  },
  heroOrb2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.heroGlow,
    bottom: 20,
    left: -30,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: 999,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FDE047',
    marginRight: SPACING.sm,
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textOnPrimary,
    textTransform: 'uppercase',
  },
  heroTitle: {
    ...TYPOGRAPHY.hero,
    color: COLORS.textOnPrimary,
    marginBottom: SPACING.sm,
  },
  heroEm: {
    color: '#FDE047',
  },
  heroDesc: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255,255,255,0.88)',
  },
  body: {
    marginTop: -SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  welcomeCard: {
    marginBottom: SPACING.lg,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  welcomeCopy: {
    flex: 1,
  },
  welcomeGreeting: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
  },
  welcomeName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
  },
  welcomeSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  profileBtn: {
    marginBottom: 0,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
  },
  loadingCard: {
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textMuted,
  },
  productCard: {
    marginBottom: SPACING.md,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentMuted,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: 999,
    marginBottom: SPACING.sm,
  },
  categoryText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
  },
  productName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  productIssue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.md,
    letterSpacing: -0.3,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm + 4,
    borderRadius: 14,
  },
  orderBtn: {
    backgroundColor: COLORS.primary,
  },
  scheduleBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textOnPrimary,
  },
  scheduleBtnText: {
    color: COLORS.primary,
  },
  actionBtnBusy: {
    opacity: 0.85,
  },
  footerSpace: {
    height: SPACING.lg,
  },
});

export default HomeScreen;
