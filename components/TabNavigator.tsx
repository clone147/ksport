import React, {useRef, useState, useCallback, useEffect} from 'react';
import {Platform} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import UnifiedWebViewScreen, {UnifiedWebViewScreenRef} from './UnifiedWebViewScreen';
import ProfileScreen from './ProfileScreen';

const BASE_URL = 'https://www.k-sport.com.pl';

interface TabNavigatorProps {
  onDeleteAccount?: () => void;
  onLogout?: () => void;
  onRequestLogin?: () => void;
  onUserLoggedInMessage?: () => void;
  onUserDataExtracted?: (firstName: string, lastName: string) => void;
  sessionToken?: string | null;
  userName?: string;
  isUserLoggedIn?: boolean;
  loginCredentials?: {
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
  } | null;
  notificationUrl?: string | null;
  onNotificationUrlHandled?: () => void;
  logoutUrl?: string | null;
  onLogoutUrlHandled?: () => void;
}

const Tab = createBottomTabNavigator();

const TAB_URLS = {
  Home: `${BASE_URL}?webview=1`,
  Search: `${BASE_URL}/search.php?webview=1`,
  Cart: `${BASE_URL}/basketedit.php?mode=1&webview=1`,
};

const TabNavigator: React.FC<TabNavigatorProps> = ({
  onDeleteAccount,
  onLogout,
  onRequestLogin,
  onUserLoggedInMessage,
  onUserDataExtracted,
  sessionToken,
  userName,
  isUserLoggedIn = false,
  loginCredentials,
  notificationUrl,
  onNotificationUrlHandled,
  logoutUrl,
  onLogoutUrlHandled,
}) => {
  const [cartCount, setCartCount] = useState(0);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [previousTab, setPreviousTab] = useState<string | null>(null);
  const currentTabRef = useRef<string>('Home');
  const cartUpdateCallbacks = useRef(new Set<(message: any) => void>());
  const loginCredentialsRef = useRef(loginCredentials);
  const tabNavigationRef = useRef<any>(null);

  const homeWebViewRef = useRef<UnifiedWebViewScreenRef>(null);
  const searchWebViewRef = useRef<UnifiedWebViewScreenRef>(null);
  const cartWebViewRef = useRef<UnifiedWebViewScreenRef>(null);

  useEffect(() => {
    loginCredentialsRef.current = loginCredentials;
  }, [loginCredentials]);

  useEffect(() => {
    if (notificationUrl && tabNavigationRef.current) {
      tabNavigationRef.current.navigate('Home');
      setTimeout(() => {
        homeWebViewRef.current?.loadUrlFromNotification(notificationUrl);
        onNotificationUrlHandled?.();
      }, 300);
    }
  }, [notificationUrl, onNotificationUrlHandled]);

  useEffect(() => {
    if (logoutUrl && tabNavigationRef.current) {
      tabNavigationRef.current.navigate('Home');
      setTimeout(() => {
        homeWebViewRef.current?.loadUrlFromNotification(logoutUrl);
        onLogoutUrlHandled?.();
      }, 300);
    }
  }, [logoutUrl, onLogoutUrlHandled]);

  const goToPreviousTab = useCallback(() => {
    if (previousTab && tabNavigationRef.current) {
      tabNavigationRef.current.navigate(previousTab);
    }
  }, [previousTab]);

  const handleCartUpdate = useCallback((message: any) => {
    if (message.count !== undefined) {
      setCartCount(message.count);
    }
    cartUpdateCallbacks.current.forEach(callback => callback(message));
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Search':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Cart':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#e30613',
        tabBarInactiveTintColor: '#8e8e93',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0.5,
          borderTopColor: '#e5e5ea',
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerShown: false,
      })}>
      <Tab.Screen
        name="Home"
        options={{tabBarLabel: 'Home'}}
        listeners={{
          tabPress: () => {
            setPreviousTab(currentTabRef.current);
            currentTabRef.current = 'Home';
            homeWebViewRef.current?.navigateToUrl(TAB_URLS.Home);
            setTimeout(() => {
              homeWebViewRef.current?.scrollToTop();
            }, 100);
          },
          focus: () => {
            setTimeout(() => {
              homeWebViewRef.current?.scrollToTop();
            }, 100);
          },
        }}>
        {(props) => {
          if (!tabNavigationRef.current && props.navigation) {
            tabNavigationRef.current = props.navigation;
          }
          const params = props.route.params as any;
          const homeUrl = params?.url || TAB_URLS.Home;

          if (params?.url && homeUrl !== TAB_URLS.Home) {
            setTimeout(() => {
              homeWebViewRef.current?.navigateToUrl(homeUrl);
            }, 100);
          }

          return (
            <UnifiedWebViewScreen
              {...props}
              ref={homeWebViewRef}
              targetUrl={homeUrl}
              sessionToken={sessionToken}
              userName={userName}
              isUserLoggedIn={isUserLoggedIn}
              loginCredentials={loginCredentials}
              onCartUpdate={handleCartUpdate}
              onRequestLogin={onRequestLogin}
              onUserLoggedInMessage={onUserLoggedInMessage}
              onUserDataExtracted={onUserDataExtracted}
              onGoToPreviousTab={goToPreviousTab}
              showHeader={true}
              searchQuery={globalSearchQuery}
              onSearchQueryChange={setGlobalSearchQuery}
            />
          );
        }}
      </Tab.Screen>

      <Tab.Screen
        name="Search"
        options={{tabBarLabel: 'Szukaj'}}
        listeners={{
          tabPress: () => {
            setPreviousTab(currentTabRef.current);
            currentTabRef.current = 'Search';
            searchWebViewRef.current?.navigateToUrl(TAB_URLS.Search);
            setTimeout(() => {
              searchWebViewRef.current?.scrollToTop();
            }, 100);
          },
        }}>
        {(props) => {
          const params = props.route.params as any;
          const searchUrl = params?.url || TAB_URLS.Search;

          return (
            <UnifiedWebViewScreen
              {...props}
              ref={searchWebViewRef}
              targetUrl={searchUrl}
              sessionToken={sessionToken}
              userName={userName}
              isUserLoggedIn={isUserLoggedIn}
              onCartUpdate={handleCartUpdate}
              onRequestLogin={onRequestLogin}
              onUserLoggedInMessage={onUserLoggedInMessage}
              onUserDataExtracted={onUserDataExtracted}
              onGoToPreviousTab={goToPreviousTab}
              showHeader={true}
              searchQuery={globalSearchQuery}
              onSearchQueryChange={setGlobalSearchQuery}
            />
          );
        }}
      </Tab.Screen>

      <Tab.Screen
        name="Cart"
        options={{
          tabBarLabel: 'Koszyk',
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#FF3B30',
            color: '#fff',
            fontSize: 10,
            fontWeight: '700',
          },
        }}
        listeners={{
          tabPress: () => {
            setPreviousTab(currentTabRef.current);
            currentTabRef.current = 'Cart';
            cartWebViewRef.current?.navigateToUrl(TAB_URLS.Cart);
            setTimeout(() => {
              cartWebViewRef.current?.scrollToTop();
            }, 100);
          },
        }}>
        {(props) => (
          <UnifiedWebViewScreen
            {...props}
            ref={cartWebViewRef}
            targetUrl={TAB_URLS.Cart}
            sessionToken={sessionToken}
            userName={userName}
            isUserLoggedIn={isUserLoggedIn}
            onCartUpdate={handleCartUpdate}
            onRequestLogin={onRequestLogin}
            onUserLoggedInMessage={onUserLoggedInMessage}
            onUserDataExtracted={onUserDataExtracted}
            onGoToPreviousTab={goToPreviousTab}
            showHeader={true}
            searchQuery={globalSearchQuery}
            onSearchQueryChange={setGlobalSearchQuery}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Profile"
        options={{tabBarLabel: 'Profil'}}
        listeners={{
          tabPress: (e) => {
            if (!isUserLoggedIn) {
              e.preventDefault();
              onRequestLogin?.();
            }
          },
        }}>
        {(props) => (
          <ProfileScreen
            {...props}
            userName={userName}
            isUserLoggedIn={isUserLoggedIn}
            onDeleteAccount={onDeleteAccount}
            onLogout={onLogout}
            onRequestLogin={onRequestLogin}
            searchQuery={globalSearchQuery}
            onSearchQueryChange={setGlobalSearchQuery}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default TabNavigator;
