import { Image, StyleSheet, Text, View } from 'react-native';
import CustomButton from '../components/CustomButton';
import { useAuth } from './auth/AuthContext';
import { COLORS, IMG, SPACING } from '../utils';

const ProfileScreen = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.logoShell}>
          <View style={styles.logoContainer}>
            {IMG.LOGO && <Image source={IMG.LOGO} style={styles.logo} resizeMode="cover" />}
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>Manage your account and continue your service journey.</Text>

          <CustomButton
            label="Log Out"
            variant="secondary"
            onPress={handleLogout}
            containerStyle={styles.logoutButton}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundWarm,
  },
  hero: {
    height: 200,
    backgroundColor: COLORS.primary,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  logoShell: {
    width: 122,
    height: 122,
    borderRadius: 61,
    backgroundColor: `${COLORS.white}50`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -52,
  },
  logoContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    elevation: 2,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.lg,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 21,
  },
  logoutButton: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    width: '100%',
  },
});

export default ProfileScreen;
