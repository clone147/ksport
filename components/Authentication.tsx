import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const BUILD_NUMBER = '1';
const BASE_URL = 'https://www.k-sport.com.pl';

interface AuthenticationProps {
  onLoginSuccess: (token: string, userData?: any) => void;
  onSkip?: () => void;
}

const Authentication: React.FC<AuthenticationProps> = ({ onLoginSuccess, onSkip }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const insets = useSafeAreaInsets();

  const scrollViewRef = useRef<ScrollView>(null);
  const loginPasswordRef = useRef<TextInput>(null);
  const registerPasswordRef = useRef<TextInput>(null);
  const registerConfirmPasswordRef = useRef<TextInput>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerStreet, setRegisterStreet] = useState('');
  const [registerHouseNumber, setRegisterHouseNumber] = useState('');
  const [registerCity, setRegisterCity] = useState('');
  const [registerPostalCode, setRegisterPostalCode] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);

  useEffect(() => {
    if (error && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [error]);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/moduly/uzytkownicy/user/jquery/logowanie.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include',
        body: new URLSearchParams({
          mail: loginEmail,
          haslo: loginPassword,
        }).toString(),
      });

      const text = await response.text();

      const isLoginSuccessful = response.ok && (
        !text.includes('błąd') &&
        !text.includes('nieprawidłow') &&
        !text.includes('error') &&
        (text.includes('success') ||
         text.includes('zalogowano') ||
         text.includes('konto') ||
         text.includes('dashboard') ||
         response.status === 200)
      );

      if (isLoginSuccessful) {
        const setCookieHeader = response.headers.get('set-cookie');

        const userData = {
          email: loginEmail,
          loginTime: new Date().toISOString(),
          cookie: setCookieHeader || null,
          loginCredentials: {
            email: loginEmail,
            password: loginPassword,
          }
        };

        const sessionToken = setCookieHeader || `session_${Date.now()}_${loginEmail.replace('@', '_')}`;

        await onLoginSuccess(sessionToken, userData);
      } else {
        setError('Nieprawidłowy email lub hasło');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Wystąpił błąd podczas logowania');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');

    if (!registerEmail || !registerPassword || !registerConfirmPassword || !registerFirstName || !registerLastName) {
      setError('Wypełnij wszystkie wymagane pola');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setError('Hasła nie są takie same');
      return;
    }

    if (registerPassword.length < 6) {
      setError('Hasło musi mieć minimum 6 znaków');
      return;
    }

    if (!acceptTerms) {
      setError('Musisz zaakceptować regulamin');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/moduly/uzytkownicy/user/jquery/rejestruj.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include',
        body: new URLSearchParams({
          osoba_firma: 'osoba',
          mail: registerEmail,
          haslo: registerPassword,
          haslo2: registerConfirmPassword,
          imie: registerFirstName,
          nazwisko: registerLastName,
          telefon: registerPhone,
          ulica: registerStreet,
          nr_mieszkania: registerHouseNumber,
          miejscowosc: registerCity,
          kod_pocztowy: registerPostalCode,
          firma_nazwa: '',
          firma_nip: '',
          firma_tel: '',
          firma_ulica: '',
          firma_nr: '',
          firma_miejscowosc: '',
          firma_kod_pocztowy: '',
          regulamin_zgoda: 'tak',
          polityka_zgoda: 'tak',
        }).toString(),
      });

      const text = await response.text();

      const isRegisterSuccessful = response.ok && (
        !text.includes('błąd') &&
        !text.includes('error') &&
        (text.includes('success') ||
         text.includes('zarejestrowano') ||
         response.status === 200)
      );

      if (isRegisterSuccessful) {
        const setCookieHeader = response.headers.get('set-cookie');
        const userData = {
          email: registerEmail,
          loginTime: new Date().toISOString(),
          cookie: setCookieHeader || null,
          loginCredentials: {
            email: registerEmail,
            password: registerPassword,
            isRegistration: true,
            firstName: registerFirstName,
            lastName: registerLastName,
            phone: registerPhone,
            street: registerStreet,
            houseNumber: registerHouseNumber,
            city: registerCity,
            postalCode: registerPostalCode,
          }
        };
        const sessionToken = setCookieHeader || `session_${Date.now()}_${registerEmail.replace('@', '_')}`;
        await onLoginSuccess(sessionToken, userData);
      } else {
        setError('Rejestracja nie powiodła się. Sprawdź dane i spróbuj ponownie.');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Wystąpił błąd podczas rejestracji');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Linking.openURL(`${BASE_URL}/przypomnij-haslo`);
  };

  const handleGuestContinue = () => {
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#f2f2f7' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 10 }]}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          {/* Header with Logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>K-SPORT</Text>
              <Text style={styles.logoTagline}>WE MAKE PEOPLE STRONGER</Text>
            </View>
          </View>

          <Text style={styles.welcomeTitle}>Witaj w sklepie K-Sport</Text>
          <Text style={styles.buildNumber}>build {BUILD_NUMBER}</Text>
          <Text style={styles.welcomeSubtitle}>
            {isRegisterMode ? 'Załóż nowe konto' : 'Zaloguj się, aby kontynuować'}
          </Text>

          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          {!isRegisterMode ? (
            <>
              <View style={styles.loginContainer}>
                <Text style={styles.sectionTitle}>LOGOWANIE</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Adres e-mail"
                  placeholderTextColor="#999"
                  value={loginEmail}
                  onChangeText={setLoginEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => loginPasswordRef.current?.focus()}
                />

                <View style={styles.passwordContainer}>
                  <TextInput
                    ref={loginPasswordRef}
                    style={styles.passwordInput}
                    placeholder="Hasło"
                    placeholderTextColor="#999"
                    value={loginPassword}
                    onChangeText={setLoginPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Icon
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={24}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.forgotLink}
                  onPress={handleForgotPassword}
                >
                  <Text style={styles.forgotLinkText}>przypomnij hasło</Text>
                  <Icon name="chevron-forward" size={16} color="#8e8e93" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>ZALOGUJ SIĘ</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.blackButton}
                onPress={() => setIsRegisterMode(true)}
              >
                <Text style={styles.buttonText}>ZAŁÓŻ NOWE KONTO</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.loginContainer}>
                <Text style={styles.sectionTitle}>REJESTRACJA</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Adres e-mail *"
                  placeholderTextColor="#999"
                  value={registerEmail}
                  onChangeText={setRegisterEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Imię *"
                  placeholderTextColor="#999"
                  value={registerFirstName}
                  onChangeText={setRegisterFirstName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Nazwisko *"
                  placeholderTextColor="#999"
                  value={registerLastName}
                  onChangeText={setRegisterLastName}
                  autoCapitalize="words"
                  returnKeyType="next"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Telefon"
                  placeholderTextColor="#999"
                  value={registerPhone}
                  onChangeText={setRegisterPhone}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Ulica"
                  placeholderTextColor="#999"
                  value={registerStreet}
                  onChangeText={setRegisterStreet}
                  returnKeyType="next"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Nr domu/mieszkania"
                  placeholderTextColor="#999"
                  value={registerHouseNumber}
                  onChangeText={setRegisterHouseNumber}
                  returnKeyType="next"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Miejscowość"
                  placeholderTextColor="#999"
                  value={registerCity}
                  onChangeText={setRegisterCity}
                  returnKeyType="next"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Kod pocztowy"
                  placeholderTextColor="#999"
                  value={registerPostalCode}
                  onChangeText={setRegisterPostalCode}
                  returnKeyType="next"
                />

                <View style={styles.passwordContainer}>
                  <TextInput
                    ref={registerPasswordRef}
                    style={styles.passwordInput}
                    placeholder="Hasło *"
                    placeholderTextColor="#999"
                    value={registerPassword}
                    onChangeText={setRegisterPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => registerConfirmPasswordRef.current?.focus()}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Icon
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={24}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.passwordContainer}>
                  <TextInput
                    ref={registerConfirmPasswordRef}
                    style={styles.passwordInput}
                    placeholder="Powtórz hasło *"
                    placeholderTextColor="#999"
                    value={registerConfirmPassword}
                    onChangeText={setRegisterConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                  />
                </View>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setAcceptTerms(!acceptTerms)}
                >
                  <View style={[styles.checkboxCircle, acceptTerms && styles.checkboxCircleChecked]}>
                    {acceptTerms && <Text style={styles.checkmarkSymbol}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxText}>
                    Akceptuję{' '}
                    <Text
                      style={styles.linkText}
                      onPress={() => Linking.openURL(`${BASE_URL}/regulamin`)}
                    >
                      regulamin
                    </Text>
                    {' '}i{' '}
                    <Text
                      style={styles.linkText}
                      onPress={() => Linking.openURL(`${BASE_URL}/polityka-prywatnosci`)}
                    >
                      politykę prywatności
                    </Text>
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setAcceptMarketing(!acceptMarketing)}
                >
                  <View style={[styles.checkboxCircle, acceptMarketing && styles.checkboxCircleChecked]}>
                    {acceptMarketing && <Text style={styles.checkmarkSymbol}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxText}>
                    Chcę otrzymywać informacje o promocjach i nowościach
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>ZAREJESTRUJ SIĘ</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.blackButton}
                onPress={() => setIsRegisterMode(false)}
              >
                <Text style={styles.buttonText}>MASZ JUŻ KONTO? ZALOGUJ SIĘ</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Zobacz, co zyskujesz dzięki rejestracji:</Text>

            <View style={styles.benefitRow}>
              <Icon name="diamond-outline" size={20} color="#e30613" style={styles.benefitIcon} />
              <Text style={styles.benefitText}>Dostęp do niższych cen</Text>
            </View>

            <View style={styles.benefitRow}>
              <Icon name="card-outline" size={20} color="#e30613" style={styles.benefitIcon} />
              <Text style={styles.benefitText}>Dostęp do specjalnych ofert promocyjnych</Text>
            </View>

            <View style={styles.benefitRow}>
              <Icon name="time-outline" size={20} color="#e30613" style={styles.benefitIcon} />
              <Text style={styles.benefitText}>Historię zakupów w jednym miejscu</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleGuestContinue}
          >
            <Text style={styles.guestButtonText}>WEJDŹ JAKO GOŚĆ</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    backgroundColor: '#f2f2f7',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#e30613',
    letterSpacing: 2,
  },
  logoTagline: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 1,
    marginTop: 4,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1c1c1e',
    textAlign: 'center',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  buildNumber: {
    fontSize: 9,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '400',
  },
  errorBox: {
    backgroundColor: '#ffebee',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  loginContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1c1c1e',
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1c1c1e',
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
  forgotLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 8,
  },
  forgotLinkText: {
    fontSize: 14,
    color: '#8e8e93',
    marginRight: 4,
  },
  primaryButton: {
    backgroundColor: '#e30613',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  blackButton: {
    backgroundColor: '#000000',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  benefitsContainer: {
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 14,
    color: '#1c1c1e',
    marginBottom: 16,
    fontWeight: '500',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#1c1c1e',
    lineHeight: 20,
  },
  guestButton: {
    backgroundColor: '#E5E5E5',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  guestButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    marginTop: 8,
  },
  checkboxCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e5e5ea',
    backgroundColor: '#ffffff',
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCircleChecked: {
    backgroundColor: '#e30613',
    borderColor: '#e30613',
  },
  checkmarkSymbol: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#1c1c1e',
    lineHeight: 20,
  },
  linkText: {
    color: '#e30613',
    textDecorationLine: 'underline',
  },
});

export default Authentication;
