import React, { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';
import CustomTextInput from '../components/CustomTextInput';
import Card from '../components/ui/Card';
import { useAuth } from './auth/AuthContext';
import { getProfile, getOrders, getBookings, updateProfile } from '../core/api/customer';
import { COLORS, IMG, ROUTES, SPACING, TYPOGRAPHY } from '../utils';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { logout, user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ orders: 0, bookings: 0 });
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedRef = useRef(false);
  const lastFetchedAtRef = useRef(0);

  const loadProfile = useCallback(
    async ({ pull = false, force = false } = {}) => {
      if (!user?.token) {
        return;
      }

      const now = Date.now();
      if (!force && !pull && hasLoadedRef.current && now - lastFetchedAtRef.current < 30_000) {
        return;
      }

      if (pull) {
        setRefreshing(true);
      }

      try {
        const [profileResponse, orderResponse, bookingResponse] = await Promise.all([
          getProfile(user.token),
          getOrders(user.token),
          getBookings(user.token),
        ]);
        const data = profileResponse.data;
        setProfile(data);
        setFullName(data?.fullName ?? '');
        setStats({
          orders: orderResponse.data?.length ?? 0,
          bookings: bookingResponse.data?.length ?? 0,
        });
        hasLoadedRef.current = true;
        lastFetchedAtRef.current = Date.now();
      } catch (error) {
        Alert.alert('Failed to load profile', error.message);
      } finally {
        setRefreshing(false);
      }
    },
    [user]
  );

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleSave = async () => {
    if (!user?.token) {
      return;
    }

    if (!fullName.trim()) {
      Alert.alert('Validation', 'Name is required.');
      return;
    }

    if (newPassword && !currentPassword) {
      Alert.alert('Validation', 'Enter your current password to set a new one.');
      return;
    }

    setIsSaving(true);
    try {
      const body = { fullName: fullName.trim() };
      if (newPassword) {
        body.password = newPassword;
        body.currentPassword = currentPassword;
      }

      const response = await updateProfile(user.token, body);
      const updated = response.data;
      setProfile(updated);
      updateUser({ fullName: updated.fullName });
      setCurrentPassword('');
      setNewPassword('');
      setIsEditing(false);
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (error) {
      Alert.alert('Update failed', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFullName(profile?.fullName ?? '');
    setCurrentPassword('');
    setNewPassword('');
    setIsEditing(false);
  };

  const displayName = profile?.fullName ?? user?.fullName ?? user?.email;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadProfile({ pull: true, force: true })}
          tintColor={COLORS.textOnPrimary}
          colors={[COLORS.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { paddingTop: insets.top + SPACING.lg }]}>
        <View style={styles.heroOrb} />
        <View style={styles.avatarRing}>
          <View style={styles.logoContainer}>
            {IMG.LOGO ? (
              <Image source={IMG.LOGO} style={styles.logo} resizeMode="cover" />
            ) : (
              <Text style={styles.avatarFallback}>{displayName?.charAt(0)?.toUpperCase()}</Text>
            )}
          </View>
        </View>
        <Text style={styles.heroName}>{displayName}</Text>
        <Text style={styles.heroEmail}>{profile?.email ?? user?.email}</Text>
      </View>

      <View style={styles.body}>
        <Card style={styles.card}>
          {isEditing ? (
            <>
              <Text style={styles.cardTitle}>Edit profile</Text>
              <CustomTextInput
                label="Full name"
                placeholder="Your name"
                value={fullName}
                onChangeText={setFullName}
              />
              <CustomTextInput
                label="New password (optional)"
                placeholder="Min. 8 characters"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              {newPassword ? (
                <CustomTextInput
                  label="Current password"
                  placeholder="Required to change password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                />
              ) : null}
              <CustomButton
                label={isSaving ? 'Saving…' : 'Save changes'}
                onPress={handleSave}
                disabled={isSaving}
                containerStyle={styles.actionButton}
              />
              <CustomButton
                label="Cancel"
                variant="secondary"
                onPress={handleCancelEdit}
                containerStyle={styles.actionButton}
              />
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={20} color={COLORS.primary} />
                <View style={styles.infoCopy}>
                  <Text style={styles.fieldLabel}>Name</Text>
                  <Text style={styles.fieldValue}>{displayName}</Text>
                </View>
              </View>
              <View style={[styles.infoRow, styles.infoRowBorder]}>
                <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
                <View style={styles.infoCopy}>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <Text style={styles.fieldValue}>{profile?.email ?? user?.email}</Text>
                </View>
              </View>
              <CustomButton
                label="Edit profile"
                variant="secondary"
                onPress={() => setIsEditing(true)}
                containerStyle={styles.actionButton}
              />
            </>
          )}
        </Card>

        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate(ROUTES.ORDERS)}
            activeOpacity={0.85}
          >
            <Text style={styles.statNumber}>{stats.orders}</Text>
            <Text style={styles.statLabel}>Orders</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={styles.statChevron} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate(ROUTES.BOOKINGS)}
            activeOpacity={0.85}
          >
            <Text style={styles.statNumber}>{stats.bookings}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={styles.statChevron} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => navigation.navigate(ROUTES.PAYMENTS)}
          activeOpacity={0.85}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="card-outline" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.menuText}>Payment history</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        <CustomButton
          label="Log Out"
          variant="secondary"
          onPress={logout}
          containerStyle={styles.logoutButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundWarm,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xxl,
  },
  hero: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    paddingBottom: SPACING.xxl + SPACING.md,
    overflow: 'hidden',
  },
  heroOrb: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.heroGlow,
    top: -40,
    right: -50,
  },
  avatarRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarFallback: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.primary,
  },
  heroName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textOnPrimary,
    marginBottom: SPACING.xs,
  },
  heroEmail: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(255,255,255,0.85)',
  },
  body: {
    marginTop: -SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  card: {
    marginBottom: SPACING.md,
  },
  cardTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  infoRowBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  infoCopy: { flex: 1 },
  fieldLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  fieldValue: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionButton: {
    marginBottom: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    position: 'relative',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  statLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  statChevron: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: SPACING.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  logoutButton: {
    marginTop: SPACING.sm,
  },
});

export default ProfileScreen;
