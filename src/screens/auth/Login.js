import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import { COLORS, IMG, ROUTES, SPACING } from '../../utils';

const { width, height } = Dimensions.get('window');

const Login = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: Add actual login logic (e.g. API call, validation)
    login();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.backgroundContainer}>
        <View style={styles.backgroundTop} />
        <View style={styles.backgroundBottom} />
        <View style={styles.backgroundOverlay}>
          <View style={[styles.decorationCircle, styles.circle1]} />
          <View style={[styles.decorationCircle, styles.circle2]} />
          <View style={[styles.decorationCircle, styles.circle3]} />
          <View style={[styles.decorationCircle, styles.circle4]} />
        </View>
      </View>
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {IMG.LOGO && <Image source={IMG.LOGO} style={styles.logo} resizeMode="contain" />}
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue to your account</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.form}>
            <CustomTextInput
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <CustomTextInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />

            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <CustomButton label="Log In" onPress={handleLogin} />
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER)}>
                <Text style={styles.link}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.7,
    backgroundColor: COLORS.primary,
  },
  backgroundBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.3,
    backgroundColor: COLORS.secondary,
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorationCircle: {
    position: 'absolute',
    borderRadius: 150,
  },
  circle1: {
    width: 220,
    height: 220,
    backgroundColor: `${COLORS.accentLight}18`,
    top: -60,
    right: -60,
  },
  circle2: {
    width: 160,
    height: 160,
    backgroundColor: `${COLORS.white}15`,
    bottom: height * 0.25,
    left: -50,
  },
  circle3: {
    width: 120,
    height: 120,
    backgroundColor: `${COLORS.primaryLight}12`,
    top: height * 0.35,
    right: 60,
  },
  circle4: {
    width: 90,
    height: 90,
    backgroundColor: `${COLORS.accent}10`,
    top: height * 0.55,
    left: 100,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl * 2,
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl * 1.5,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: `${COLORS.white}85`,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 10,
    borderWidth: 1,
    borderColor: `${COLORS.primaryLight}30`,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -SPACING.sm,
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: SPACING.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    paddingHorizontal: SPACING.md,
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  socialContainer: {
    marginBottom: SPACING.lg,
  },
  socialButton: {
    backgroundColor: `${COLORS.secondary}60`,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
  },
});

export default Login;
