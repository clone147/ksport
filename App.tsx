import React, {useState, useEffect, useRef} from 'react';
import {StatusBar, Platform} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Authentication from './components/Authentication';
import TabNavigator from './components/TabNavigator';

const BASE_URL = 'https://www.k-sport.com.pl';

let cachedTrackingStatus: string | null = null;

export const getTrackingStatus = async (): Promise<string> => {
  if (cachedTrackingStatus) {
    return cachedTrackingStatus;
  }

  try {
    const stored = await AsyncStorage.getItem('attStatus');
    if (stored) {
      cachedTrackingStatus = stored;
      return stored;
    }
  } catch (error) {
    console.log('[ATT] Error reading status from AsyncStorage:', error);
  }

  return 'notDetermined';
};

function App(): React.JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthentication, setShowAuthentication] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [loginCredentials, setLoginCredentials] = useState<{
    email: string;
    password: string;
    isRegistration?: boolean;
    firstName?: string;
    lastName?: string;
    phone?: string;
    street?: string;
    houseNumber?: string;
    city?: string;
    postalCode?: string;
  } | null>(null);
  const [notificationUrl, setNotificationUrl] = useState<string | null>(null);
  const [logoutUrl, setLogoutUrl] = useState<string | null>(null);
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    // OneSignal and ATT disabled for now
  }, []);

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const stored = await AsyncStorage.getItem('loginCredentials');
        if (stored) {
          const credentials = JSON.parse(stored);
          setLoginCredentials(credentials);

          if (credentials.firstName && credentials.lastName) {
            const fullName = `${credentials.firstName} ${credentials.lastName}`;
            setUserName(fullName);
          }
        }
      } catch (error) {
        console.error('Error loading loginCredentials:', error);
      }
    };
    loadCredentials();
  }, []);

  useEffect(() => {
    const saveCredentials = async () => {
      if (loginCredentials) {
        try {
          await AsyncStorage.setItem('loginCredentials', JSON.stringify(loginCredentials));
        } catch (error) {
          console.error('Error saving loginCredentials:', error);
        }
      }
    };
    saveCredentials();
  }, [loginCredentials]);

  useEffect(() => {
    if (loginCredentials?.firstName && loginCredentials?.lastName && userName) {
      const fullName = `${loginCredentials.firstName} ${loginCredentials.lastName}`;
      if (userName.includes('@') && userName !== fullName) {
        setUserName(fullName);
      }
    }
  }, [loginCredentials, userName]);

  const handleLoginSuccess = (token: string, userData?: any) => {
    setSessionToken(token);
    setIsAuthenticated(true);
    setShowAuthentication(false);
    if (userData?.loginCredentials) {
      setLoginCredentials(userData.loginCredentials);
      if (userData.loginCredentials.firstName && userData.loginCredentials.lastName) {
        const fullName = `${userData.loginCredentials.firstName} ${userData.loginCredentials.lastName}`;
        setUserName(fullName);
      } else if (userData?.email) {
        setUserName(userData.email);
      }
    } else if (userData?.email) {
      setUserName(userData.email);
    }
  };

  const handleSkipLogin = () => {
    setShowAuthentication(false);
  };

  const handleDeleteAccount = async () => {
    setSessionToken(null);
    setIsAuthenticated(false);
    setUserName(undefined);
    setLoginCredentials(null);
    setShowAuthentication(true);

    try {
      await AsyncStorage.removeItem('loginCredentials');
    } catch (error) {
      console.error('Error clearing loginCredentials:', error);
    }
  };

  const handleLogout = async () => {
    setLogoutUrl(`${BASE_URL}/moduly/uzytkownicy/user/jquery/logowanie.php?wyloguj=wyloguj`);
    setSessionToken(null);
    setIsAuthenticated(false);
    setUserName(undefined);
    setLoginCredentials(null);
    setShowAuthentication(false);

    try {
      await AsyncStorage.removeItem('loginCredentials');
    } catch (error) {
      console.error('Error clearing loginCredentials:', error);
    }
  };

  const handleRequestLogin = () => {
    if (!isAuthenticated) {
      setShowAuthentication(true);
    }
  };

  const handleUserLoggedInMessage = () => {
    setIsAuthenticated(true);
  };

  const handleUserDataExtracted = (firstName: string, lastName: string) => {
    const fullName = `${firstName} ${lastName}`;
    setUserName(fullName);

    if (loginCredentials) {
      setLoginCredentials({
        ...loginCredentials,
        firstName,
        lastName,
      });
    }
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
        {showAuthentication ? (
          <Authentication
            onLoginSuccess={handleLoginSuccess}
            onSkip={handleSkipLogin}
          />
        ) : (
          <TabNavigator
            sessionToken={sessionToken}
            userName={userName}
            loginCredentials={loginCredentials}
            onDeleteAccount={handleDeleteAccount}
            onLogout={handleLogout}
            onRequestLogin={handleRequestLogin}
            onUserLoggedInMessage={handleUserLoggedInMessage}
            onUserDataExtracted={handleUserDataExtracted}
            isUserLoggedIn={isAuthenticated}
            notificationUrl={notificationUrl}
            onNotificationUrlHandled={() => setNotificationUrl(null)}
            logoutUrl={logoutUrl}
            onLogoutUrlHandled={() => setLogoutUrl(null)}
          />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
