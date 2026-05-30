import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { useAuth } from './AuthContext';
import { useGoogleSignIn } from './useGoogleSignIn';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { COLORS, IMG, ROUTES, RADIUS, SPACING, TYPOGRAPHY } from '../../utils';

const Login = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { login, googleLogin, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const { height } = useWindowDimensions();
  const isShortScreen = height < 760;

  const handleEmailChange = useCallback(text => {
    setEmail(text);
  }, []);

  const handlePasswordChange = useCallback(text => {
    setPassword(text);
  }, []);

  const handleGoogleJwt = useCallback(async jwt => {
    setGeneralError('');
    try {
      await googleLogin(jwt);
    } catch (error) {
      setGeneralError(error?.message || 'Google sign-in failed.');
    }
  }, [googleLogin]);

  const { signInWithGoogle, isGoogleReady } = useGoogleSignIn(handleGoogleJwt);

  const handleGooglePress = async () => {
    setGeneralError('');
    try {
      await signInWithGoogle();
    } catch (error) {
      const message = error?.message || 'Google sign-in failed.';
      setGeneralError(message);
    }
  };

  const handleLogin = async () => {
    const errors = {};
    setGeneralError('');

    if (!email.trim()) {
      errors.email = 'Please enter your email.';
    }
    if (!password) {
      errors.password = 'Please enter your password.';
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      await login(email.trim(), password);
    } catch (error) {
      const message = error?.message || 'Please try again.';
      setGeneralError(message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + SPACING.lg, paddingBottom: insets.bottom + SPACING.lg },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroOrb} />
          <View style={[styles.logoShell, isShortScreen && styles.logoShellCompact]}>
            <View style={[styles.logoContainer, isShortScreen && styles.logoContainerCompact]}>
              {IMG.LOGO && (
                <Image
                  source={IMG.LOGO}
                  style={[styles.logo, isShortScreen && styles.logoCompact]}
                  resizeMode="cover"
                />
              )}
            </View>
          </View>
          <Text style={[styles.title, isShortScreen && styles.titleCompact]}>Welcome back</Text>
          <Text style={[styles.subtitle, isShortScreen && styles.subtitleCompact]}>
            Sign in to manage repairs, orders, and bookings
          </Text>
        </View>

        <View style={styles.formCard}>
          {generalError ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={COLORS.error} />
              <Text style={styles.generalError}>{generalError}</Text>
            </View>
          ) : null}

          <CustomTextInput
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            error={formErrors.email}
          />
          <CustomTextInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            textContentType="password"
            error={formErrors.password}
          />

          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() =>
              Alert.alert(
                'Reset password',
                'Use the ONINS website profile or contact support to reset your password.'
              )
            }
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <CustomButton
            label={isLoading ? 'Signing in…' : 'Sign in'}
            onPress={handleLogin}
            disabled={isLoading}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.socialButton, (isLoading || !isGoogleReady) && styles.socialButtonDisabled]}
            onPress={handleGooglePress}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-google" size={20} color={COLORS.text} />
            <Text style={styles.socialButtonText}>
              {isLoading ? 'Please wait…' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER)}>
              <Text style={styles.link}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  heroOrb: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.heroGlow,
    top: -20,
    right: -30,
  },
  logoShell: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoShellCompact: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoContainerCompact: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  logoCompact: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textOnPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: 24,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  subtitleCompact: {
    fontSize: 14,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xxl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.errorBg,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  generalError: {
    flex: 1,
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '500',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    paddingHorizontal: SPACING.md,
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
    textTransform: 'lowercase',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md - 2,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  socialButtonDisabled: {
    opacity: 0.6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default Login;
