import { useNavigation } from '@react-navigation/native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, IMG, ROUTES, SPACING } from '../utils';

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.hero} />

      <View style={styles.content}>
        <View style={styles.brandBadge}>
          <View style={styles.logoContainer}>
            {IMG.LOGO && <Image source={IMG.LOGO} style={styles.logo} resizeMode="cover" />}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Welcome Back</Text>
          <Text style={styles.subtitle}>Track repairs and manage your service requests.</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate(ROUTES.PROFILE)}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footerSpace} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundWarm,
  },
  hero: {
    height: 220,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    marginTop: -70,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  brandBadge: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: `${COLORS.white}50`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoContainer: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    elevation: 3,
  },
  logo: {
    width: 104,
    height: 104,
    borderRadius: 52,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    alignItems: 'center',
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 21,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 14,
    minWidth: 210,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  footerSpace: {
    height: SPACING.xl,
  },
});

export default HomeScreen;
