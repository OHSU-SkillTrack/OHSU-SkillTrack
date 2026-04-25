import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  useWindowDimensions,
} from 'react-native';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react-native';
import { Feather } from '@expo/vector-icons';

const COLORS = {
  primary: '#3D6FE8',
  primaryLight: '#D6E0FA',
  primaryMid: '#8AAAF0',
  white: '#FFFFFF',
  inputBorder: '#D1D5DB',
  inputBorderFocus: '#3D6FE8',
  inputPlaceholder: '#9CA3AF',
  inputText: '#111827',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  linkBlue: '#3D6FE8',
  logInBtnBg: '#F3F4F6',
  logInBtnText: '#111827',
  background: '#FFFFFF',
  cardBg: '#FFFFFF',
  pageBg: '#F0F2F8',
  error: '#EF4444',
};

const FONT = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

function StyledInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
}: {
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words';
}) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      style={[shared.input, focused && shared.inputFocused]}
      placeholder={placeholder}
      placeholderTextColor={COLORS.inputPlaceholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[shared.primaryBtn, (disabled || loading) && { opacity: 0.6 }]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <Text style={shared.primaryBtnText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
// Landing Page
function LandingPage({ onSignUp, onLogIn }: { onSignUp: () => void; onLogIn: () => void }) {
  const { height } = useWindowDimensions();

  return (
    <SafeAreaView style={landing.safe}>
      <View style={[landing.card, { minHeight: height }]}>
        {/* Decorative blobs */}
        <View style={landing.blobsContainer} pointerEvents="none">
          <View style={[landing.blob, landing.blobTL]} />
          <View style={[landing.blob, landing.blobTR]} />
          <View style={[landing.blob, landing.blobBL]} />
          <View style={[landing.blob, landing.blobBR]} />
          <View style={[landing.blob, landing.blobCenter]} />
        </View>

        {/* Logo */}
        <View style={landing.logoWrapper}>
          <View style={landing.logoCircle}>
            <Feather name="check" size={48} color={COLORS.white} />
          </View>
        </View>

        {/* Text */}
        <Text style={landing.welcomeText}>Welcome to</Text>
        <Text style={landing.appName}>SkillTrack</Text>

        {/* Buttons */}
        <View style={landing.buttonsWrapper}>
          <PrimaryButton label="Sign Up" onPress={onSignUp} />
          <TouchableOpacity style={landing.logInBtn} onPress={onLogIn} activeOpacity={0.8}>
            <Text style={landing.logInBtnText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Sign Up Page
export function CustomSignUp(props: any) {
  const { height } = useWindowDimensions();
  const { toSignIn, isPending, error } = useAuthenticator();
  const [fields, setFields] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validationError, setValidationError] = useState('');

  const set = (key: keyof typeof fields) => (val: string) =>
    setFields((f) => ({ ...f, [key]: val }));

  const handleSignUp = () => {
    setValidationError('');

    if (fields.password !== fields.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (!fields.email || !fields.password || !fields.firstName || !fields.lastName) {
      setValidationError('All fields are required');
      return;
    }

    if (props.handleSubmit) {
      props.handleSubmit({
        username: fields.email,
        password: fields.password,
        options: {
          userAttributes: {
            email: fields.email,
            given_name: fields.firstName,
            family_name: fields.lastName,
          },
        },
      });
    }
  };

  const displayError = validationError || (typeof error === 'string' ? error : (error && typeof error === 'object' && 'message' in error ? (error as any).message : ''));
  return (
    <SafeAreaView style={su.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={su.scroll} contentContainerStyle={su.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[su.card, { minHeight: height }]}>
            <Text style={su.title}>Sign Up</Text>

            <View style={su.fields}>
              <StyledInput
                placeholder="First Name"
                value={fields.firstName}
                onChangeText={set('firstName')}
                autoCapitalize="words"
              />
              <StyledInput
                placeholder="Last Name"
                value={fields.lastName}
                onChangeText={set('lastName')}
                autoCapitalize="words"
              />
              <StyledInput
                placeholder="Email"
                value={fields.email}
                onChangeText={set('email')}
                keyboardType="email-address"
              />
              <StyledInput
                placeholder="Password"
                value={fields.password}
                onChangeText={set('password')}
                secureTextEntry
              />
              <StyledInput
                placeholder="Confirm Password"
                value={fields.confirmPassword}
                onChangeText={set('confirmPassword')}
                secureTextEntry
              />
            </View>

            {displayError && <Text style={su.error}>{displayError}</Text>}

            <View style={su.footer}>
              <PrimaryButton label="Sign Up" onPress={handleSignUp} loading={isPending} />
              <TouchableOpacity onPress={toSignIn} activeOpacity={0.7} style={su.linkRow}>
                <Text style={su.linkText}>
                  Already have an account?{' '}
                  <Text style={su.link}>Log in.</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Log In Page
export function CustomSignIn(props: any) {
  const { height } = useWindowDimensions();
  const { toSignUp, isPending, error } = useAuthenticator();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogIn = () => {
    if (props.handleSubmit) {
      props.handleSubmit({ username: email, password });
    }
  };

  const displayError = typeof error === 'string' ? error : (error && typeof error === 'object' && 'message' in error ? (error as any).message : '');

  return (
    <SafeAreaView style={li.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={li.scroll} contentContainerStyle={li.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[li.card, { minHeight: height }]}>
            <Text style={li.title}>Log In</Text>

            <View style={li.fields}>
              <StyledInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <StyledInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {displayError && <Text style={li.error}>{displayError}</Text>}

            <View style={li.footer}>
              <PrimaryButton label="Log In" onPress={handleLogIn} loading={isPending} />
              <TouchableOpacity onPress={toSignUp} activeOpacity={0.7} style={li.linkRow}>
                <Text style={li.linkText}>
                  Don't have an account?{' '}
                  <Text style={li.link}>Sign up.</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Main App wrapper
type Screen = 'landing' | 'signIn' | 'signUp';

export function SkillTrackAuth({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<Screen>('landing');

  if (screen === 'landing') {
    return (
      <LandingPage
        onSignUp={() => setScreen('signUp')}
        onLogIn={() => setScreen('signIn')}
      />
    );
  }

  return (
    <Authenticator
      initialState={screen === 'signUp' ? 'signUp' : 'signIn'}
      components={{
        SignIn: CustomSignIn,
        SignUp: CustomSignUp,
      }}
    >
      {children}
    </Authenticator>
  );
}

// Styles
const W = Dimensions.get('window').width;
const shared = StyleSheet.create({
  input: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: FONT,
    color: COLORS.inputText,
    marginBottom: 8,
  },
  inputFocused: {
    borderBottomColor: COLORS.inputBorderFocus,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONT,
  },
});

// Landing Page
const landing = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.pageBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 48,
    overflow: 'hidden',
  },
  blobsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.85,
  },
  blobTL: { width: 100, height: 100, top: -20, left: -20 },
  blobTR: { width: 130, height: 130, top: -30, right: -30, backgroundColor: COLORS.primaryLight },
  blobBL: { width: 80, height: 80, top: 160, left: -10 },
  blobBR: { width: 120, height: 120, top: 100, right: -20, backgroundColor: COLORS.primaryMid, opacity: 0.5 },
  blobCenter: { width: 60, height: 60, top: 220, left: 60, backgroundColor: COLORS.primaryMid, opacity: 0.4 },
  logoWrapper: {
    marginBottom: 24,
    transform: [{ translateY: -10 }],
    zIndex: 2,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  checkOuter: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '400',
    color: COLORS.textPrimary,
    fontFamily: FONT,
    zIndex: 2,
  },
  appName: {
    fontSize: 34,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONT,
    marginBottom: 28,
    zIndex: 2,
  },
  buttonsWrapper: {
    width: '85%',
    gap: 10,
    zIndex: 2,
  },
  logInBtn: {
    backgroundColor: COLORS.logInBtnBg,
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logInBtnText: {
    color: COLORS.logInBtnText,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONT,
  },
});

// Sign Up
const su = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.pageBg,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: COLORS.cardBg,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 0,
    padding: 28,
    marginVertical: 0,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONT,
    marginBottom: 24,
  },
  fields: {
    gap: 4,
  },
  error: {
    color: COLORS.error,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: FONT,
  },
  footer: {
    marginTop: 20,
    gap: 12,
  },
  linkRow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONT,
  },
  link: {
    color: COLORS.linkBlue,
    fontWeight: '500',
  },
});

// Log In
const li = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.pageBg,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: COLORS.cardBg,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 0,
    padding: 28,
    marginVertical: 0,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONT,
    marginBottom: 32,
  },
  fields: {
    gap: 4,
  },
  error: {
    color: COLORS.error,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: FONT,
  },
  footer: {
    marginTop: 28,
    gap: 12,
  },
  linkRow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: FONT,
  },
  link: {
    color: COLORS.linkBlue,
    fontWeight: '500',
  },
});