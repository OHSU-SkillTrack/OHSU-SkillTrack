import React, { useState } from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Dimensions,
	Platform,
	ActivityIndicator,
	ScrollView,
	KeyboardAvoidingView,
	useWindowDimensions,
	Image,
	Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react-native';
import { Feather } from '@expo/vector-icons';
import { AppText } from '../AppText';

const COLORS = {
	primary: '#4972FF',
	secondaryBlue: '#9FB5FF',
	tertiaryBlue: '#E3EAFF',
	primaryMid: '#8AAAF0',
	secondary: '#F5F5F5',
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
	primaryLight: '#D6E0FA'
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
	const { width, height } = useWindowDimensions();

	return (
		<View style={styles.screen}>
			<View style={styles.designContainer}>
				<Image source={require('@/assets/images/landingPageDesign.png')} style={{ width: width, height: height * 0.65 }} />
			</View>

			{/* Text */}
			<View style={[styles.textContainer, { marginTop: height * 0.575 }]}>
				<AppText style={styles.welcomeText}>Welcome to</AppText>
				<AppText style={styles.appNameText}>SkillTrack</AppText>
			</View>

			{/* Buttons */}
			<View style={styles.buttonContainer}>
				<Pressable style={styles.signUpButton} onPress={onSignUp}>
					<AppText style={styles.signUpButtonText}>Sign Up</AppText>
				</Pressable>
				<Pressable style={styles.logInButton} onPress={onLogIn}>
					<AppText style={styles.logInButtonText}>Log In</AppText>
				</Pressable>
			</View>
		</View>
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
		<SafeAreaView>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{ flex: 1 }}
			>
				<ScrollView
					keyboardShouldPersistTaps="handled"
				>
					<View style={styles.header}>
						<AppText style={styles.headerText}>Sign Up</AppText>
					</View>

					<View style={styles.inputContainer}>
						<TextInput
							placeholder="First Name"
							value={fields.firstName}
							onChangeText={set('firstName')}
							autoCapitalize="words"
						/>
						<TextInput
							placeholder="Last Name"
							value={fields.lastName}
							onChangeText={set('lastName')}
							autoCapitalize="words"
						/>
						<TextInput
							placeholder="Email"
							value={fields.email}
							onChangeText={set('email')}
							keyboardType="email-address"
						/>
						<TextInput
							placeholder="Password"
							value={fields.password}
							onChangeText={set('password')}
							secureTextEntry
						/>
						<TextInput
							placeholder="Confirm Password"
							value={fields.confirmPassword}
							onChangeText={set('confirmPassword')}
							secureTextEntry
						/>
					</View>

					{displayError && <Text style={su.error}>{displayError}</Text>}

					<View style={styles.buttonContainer}>
						<Pressable onPress={handleSignUp} style={styles.signUpButton}>
							<AppText style={styles.signUpButtonText}>Sign Up</AppText>
						</Pressable>/
						<View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', paddingHorizontal: '10%', gap: 5}}>
							<AppText>Already have an account?</AppText>
							<Pressable onPress={toSignIn}>
								<AppText style={{color: COLORS.primary}}>Log in.</AppText>
							</Pressable>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
// behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}
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

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'flex-start',
		width: '100%',
		height: '100%',
		backgroundColor: '#FFFFFF',
		overflow: 'hidden'
	},
	designContainer: {
		position: 'absolute',
		top: -75
	},
	textContainer: {
		flex: 1,
		alignItems: 'center'
	},
	welcomeText: {
		fontSize: 40,
		padding: 0,
		margin: 0
	},
	appNameText: {
		fontSize: 70,
		padding: 0,
		margin: 0
	},
	buttonContainer: {
		width: 275,
		gap: 15,
		marginBottom: '20%'
	},
	signUpButton: {
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: COLORS.primary,
		height: 50,
		borderRadius: 25
	},
	signUpButtonText: {
		color: '#FFFFFF',
		fontSize: 25
	},
	logInButton: {
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: COLORS.secondary,
		height: 50,
		borderRadius: 25
	},
	logInButtonText: {
		color: '#000000',
		fontSize: 25
	},
	header: {
		width: '100%'
	},
	headerText: {
		fontSize: 45
	},
	inputContainer: {
		width: '100%',
		margin: 20,
		gap: 5,
	},
	inputField: {

	},
	scrollContent: {
		flexGrow: 1,
		justifyContent: 'flex-start'
	},
})

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
