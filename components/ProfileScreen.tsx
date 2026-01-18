import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import CollapsibleHeader from './CollapsibleHeader';

const BASE_URL = 'https://www.k-sport.com.pl';

interface ProfileScreenProps {
  onDeleteAccount?: () => void;
  onLogout?: () => void;
  onRequestLogin?: () => void;
  userName?: string;
  isUserLoggedIn?: boolean;
  navigation?: any;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onDeleteAccount,
  onLogout,
  onRequestLogin,
  userName,
  isUserLoggedIn = false,
  navigation: navigationProp,
  searchQuery,
  onSearchQueryChange,
}) => {
  const navigation = navigationProp || useNavigation();
  const [isDeleting, setIsDeleting] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const profileMenuItems = [
    {
      title: 'Moje dane',
      icon: 'person-outline',
      onPress: () => navigateToWebView(`${BASE_URL}/moje_konto`),
    },
    {
      title: 'Historia zamówień',
      icon: 'bag-outline',
      onPress: () => navigateToWebView(`${BASE_URL}/moje_konto?zamowienia`),
    },
    {
      title: 'Reklamacje i Zwroty',
      icon: 'return-down-back-outline',
      onPress: () => navigateToWebView(`${BASE_URL}/odstapienie_od_umowy.html`),
    },
    {
      title: 'Pomoc',
      icon: 'help-circle-outline',
      onPress: () => navigateToWebView(`${BASE_URL}/faq.html`),
    },
    {
      title: 'Skontaktuj się z nami',
      icon: 'mail-outline',
      onPress: () => navigateToWebView(`${BASE_URL}/kontakt.html`),
    },
    {
      title: 'O Nas',
      icon: 'information-circle-outline',
      onPress: () => navigateToWebView(`${BASE_URL}/o-firmie.html`),
    },
  ];

  const navigateToWebView = (url: string) => {
    // @ts-ignore
    navigation.navigate('Home', {
      url: url,
    });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Usuń konto',
      'Czy na pewno chcesz usunąć swoje konto? Ta operacja jest nieodwracalna.',
      [
        {text: 'Anuluj', style: 'cancel'},
        {
          text: 'Usuń konto',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Ostateczne potwierdzenie',
              'Czy jesteś absolutnie pewien? Wszystkie twoje dane zostaną usunięte.',
              [
                {text: 'Anuluj', style: 'cancel'},
                {
                  text: 'Tak, usuń',
                  style: 'destructive',
                  onPress: performAccountDeletion,
                },
              ],
            );
          },
        },
      ],
    );
  };

  const performAccountDeletion = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      Alert.alert('Konto usunięte', 'Twoje konto zostało pomyślnie usunięte.', [
        {text: 'OK', onPress: onDeleteAccount},
      ]);
    }, 2000);
  };

  const handleLogout = () => {
    Alert.alert('Wyloguj się', 'Czy na pewno chcesz się wylogować?', [
      {text: 'Anuluj', style: 'cancel'},
      {
        text: 'Wyloguj',
        onPress: () => {
          onLogout?.();
        },
      },
    ]);
  };

  const handleBackPress = () => {
    navigation.navigate('Home');
  };

  const handleSearchSubmit = (query: string) => {
    const searchUrl = `${BASE_URL}/szukaj.html?finder-form-box=1&szukane=${encodeURIComponent(query)}&szuk_kat=2&hidden_txt=${encodeURIComponent(query)}`;
    navigation.navigate('Search', {
      searchQuery: query,
      url: searchUrl,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <CollapsibleHeader
        scrollY={scrollY}
        userName={userName}
        onBackPress={handleBackPress}
        canGoBack={false}
        onSearchSubmit={handleSearchSubmit}
        searchQuery={searchQuery}
        onSearchQueryChange={onSearchQueryChange}
      />
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false}
        )}
        scrollEventThrottle={16}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Icon name="person" size={40} color="#e30613" />
          </View>
          <Text style={styles.welcomeText}>Twój profil</Text>
          {userName && <Text style={styles.emailText}>{userName}</Text>}
        </View>

        {/* Menu Container */}
        <View style={styles.menuContainer}>
          {profileMenuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === profileMenuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={item.onPress}>
              <Icon name={item.icon} size={24} color="#e30613" />
              <Text style={styles.menuItemText}>{item.title}</Text>
              <Icon name="chevron-forward" size={20} color="#8e8e93" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions */}
        {isUserLoggedIn ? (
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Icon name="log-out-outline" size={20} color="#666" />
              <Text style={styles.logoutButtonText}>Wyloguj się</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.deleteButton,
                isDeleting && styles.deleteButtonDisabled,
              ]}
              onPress={handleDeleteAccount}
              disabled={isDeleting}>
              <Icon
                name={isDeleting ? 'hourglass-outline' : 'trash-outline'}
                size={20}
                color="#fff"
              />
              <Text style={styles.deleteButtonText}>
                {isDeleting ? 'Usuwanie...' : 'Usuń konto'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.loginPromptButton}
            onPress={onRequestLogin}>
            <Text style={styles.loginPromptText}>Zaloguj się</Text>
          </TouchableOpacity>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerVersion}>K-Sport App v1.0</Text>
          <Text style={styles.footerGDPR}>
            Zgodnie z GDPR masz prawo do dostępu, poprawiania i usuwania swoich
            danych osobowych.
          </Text>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingTop: 150,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    marginBottom: 0,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e30613',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 6,
  },
  emailText: {
    fontSize: 16,
    color: '#8e8e93',
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f5',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1c1c1e',
    marginLeft: 12,
  },
  actionContainer: {
    marginHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#ff3b30',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteButtonDisabled: {
    backgroundColor: '#ffb3b3',
    opacity: 0.6,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  loginPromptButton: {
    backgroundColor: '#e30613',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  loginPromptText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    marginTop: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  footerVersion: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 8,
  },
  footerGDPR: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ProfileScreen;
