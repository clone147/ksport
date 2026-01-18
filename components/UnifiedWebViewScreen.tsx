import React, {useState, useRef, forwardRef, useImperativeHandle} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {WebView} from 'react-native-webview';
import Icon from 'react-native-vector-icons/Ionicons';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
// Tracking status disabled

const BASE_URL = 'https://www.k-sport.com.pl';

interface UnifiedWebViewScreenProps {
  targetUrl: string;
  sessionToken?: string | null;
  onCartUpdate?: (message: any) => void;
  onRequestLogin?: () => void;
  onUserLoggedInMessage?: () => void;
  onUserDataExtracted?: (firstName: string, lastName: string) => void;
  onGoToPreviousTab?: () => void;
  navigation?: any;
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
  showHeader?: boolean;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

export interface UnifiedWebViewScreenRef {
  navigateToUrl: (url: string) => void;
  loadUrlFromNotification: (url: string) => void;
  scrollToTop: () => void;
}

const UnifiedWebViewScreen = forwardRef<UnifiedWebViewScreenRef, UnifiedWebViewScreenProps>(({
  targetUrl,
  sessionToken,
  onCartUpdate,
  onRequestLogin,
  onUserLoggedInMessage,
  onUserDataExtracted,
  onGoToPreviousTab,
  navigation,
  userName,
  isUserLoggedIn = false,
  loginCredentials,
  showHeader = false,
  searchQuery,
  onSearchQueryChange,
}, ref) => {
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [hasLoggedIn, setHasLoggedIn] = useState(false);
  const [postLoginCompleted, setPostLoginCompleted] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [attStatus] = useState<string>('notDetermined');
  const [loadedFromNotification, setLoadedFromNotification] = useState(false);
  const [hasNetworkError, setHasNetworkError] = useState(false);
  const webViewRef = useRef<WebView>(null);

  useImperativeHandle(ref, () => ({
    navigateToUrl: (url: string) => {
      const routeName = route.name;
      const targetUrlNormalized = buildUrlWithSession(url);
      const normalizeUrl = (url: string) => url.split('?')[0].replace(/\/$/, '');
      const currentBase = normalizeUrl(currentUrl);
      const targetBase = normalizeUrl(targetUrlNormalized);
      const isSameUrl = currentBase === targetBase;

      if (isSameUrl) {
        return;
      }

      webViewRef.current?.injectJavaScript(`
        window.location.href = '${targetUrlNormalized}';
        true;
      `);
    },
    loadUrlFromNotification: (url: string) => {
      if (webViewRef.current) {
        const urlWithSession = buildUrlWithSession(url);
        webViewRef.current.injectJavaScript(`
          window.location.href = '${urlWithSession}';
          true;
        `);
        setCurrentUrl(urlWithSession);
        setLoadedFromNotification(true);
      }
    },
    scrollToTop: () => {
      webViewRef.current?.injectJavaScript(`
        window.scrollTo({top: 0, behavior: 'smooth'});
        true;
      `);
    },
  }));

  // ATT status loading disabled

  const getWebViewSource = () => {
    if (loginCredentials && !hasLoggedIn) {
      const endpoint = loginCredentials.isRegistration
        ? `${BASE_URL}/moduly/uzytkownicy/user/jquery/rejestruj.php`
        : `${BASE_URL}/moduly/uzytkownicy/user/jquery/logowanie.php`;

      let postData = `mail=${encodeURIComponent(loginCredentials.email)}&haslo=${encodeURIComponent(loginCredentials.password)}`;

      if (loginCredentials.isRegistration) {
        postData += `&osoba_firma=osoba`;
        postData += `&haslo2=${encodeURIComponent(loginCredentials.password)}`;
        postData += `&imie=${encodeURIComponent(loginCredentials.firstName || '')}`;
        postData += `&nazwisko=${encodeURIComponent(loginCredentials.lastName || '')}`;
        postData += `&telefon=${encodeURIComponent(loginCredentials.phone || '')}`;
        postData += `&ulica=${encodeURIComponent(loginCredentials.street || '')}`;
        postData += `&nr_mieszkania=${encodeURIComponent(loginCredentials.houseNumber || '')}`;
        postData += `&miejscowosc=${encodeURIComponent(loginCredentials.city || '')}`;
        postData += `&kod_pocztowy=${encodeURIComponent(loginCredentials.postalCode || '')}`;
        postData += `&firma_nazwa=&firma_nip=&firma_tel=&firma_ulica=&firma_nr=&firma_miejscowosc=&firma_kod_pocztowy=`;
        postData += `&regulamin_zgoda=tak&polityka_zgoda=tak`;
      }

      setHasLoggedIn(true);

      return {
        uri: endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: postData,
      };
    }

    const finalUrl = buildUrlWithSession(targetUrl);
    return { uri: finalUrl };
  };

  useFocusEffect(
    React.useCallback(() => {
      return () => {};
    }, [targetUrl, currentUrl, loginCredentials, hasLoggedIn, postLoginCompleted])
  );

  const getTrackingBlockingScript = (): string => {
    const hideCookieBanner = `
      (function() {
        const style = document.createElement('style');
        style.id = 'att-cookie-banner-blocker';
        style.textContent = \`
          [class*="cookie"], [class*="Cookie"], [class*="consent"],
          [class*="Consent"], [id*="cookie"], [id*="Cookie"],
          [id*="consent"], [id*="Consent"],
          div[class*="cky"], div[id*="cky"],
          .cc-window, .cc-banner, .cc-revoke,
          [class*="gdpr"], [class*="GDPR"], [class*="privacy"],
          iframe[src*="cookie"], iframe[src*="consent"] {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            position: absolute !important;
            left: -9999px !important;
            pointer-events: none !important;
            z-index: -9999 !important;
          }
          body.modal-open, html.modal-open {
            overflow: auto !important;
          }
          body > div[style*="position: fixed"],
          body > div[style*="position: sticky"] {
            display: none !important;
          }
        \`;
        if (!document.head) {
          const head = document.createElement('head');
          document.documentElement.insertBefore(head, document.body);
        }
        document.head.appendChild(style);

        let removedCount = 0;
        const removeCookieBanners = () => {
          const selectors = [
            '[class*="cookie"]', '[class*="Cookie"]',
            '[class*="consent"]', '[class*="Consent"]',
            '[id*="cookie"]', '[id*="Cookie"]',
            '[id*="consent"]', '[id*="Consent"]',
            '[class*="cky"]', '[id*="cky"]',
            '.cc-window', '.cc-banner',
            'iframe[src*="cookie"]', 'iframe[src*="consent"]'
          ];

          selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              if (el.textContent && (
                el.textContent.toLowerCase().includes('cookie') ||
                el.textContent.toLowerCase().includes('consent') ||
                el.textContent.toLowerCase().includes('gdpr') ||
                el.textContent.toLowerCase().includes('privacy')
              )) {
                el.remove();
                removedCount++;
              }
            });
          });
        };

        removeCookieBanners();

        const observer = new MutationObserver((mutations) => {
          removeCookieBanners();
        });

        observer.observe(document.documentElement, {
          childList: true,
          subtree: true
        });

        setInterval(removeCookieBanners, 1000);
      })();
    `;

    if (attStatus === 'authorized') {
      return hideCookieBanner;
    }

    return hideCookieBanner + `
      (function() {
        window.google_tag_manager = {};
        window.google_tag_data = {};

        Object.defineProperty(window, 'dataLayer', {
          value: new Proxy([], {
            set: () => { return true; },
            get: (target, prop) => {
              if (prop === 'push') return () => {};
              return undefined;
            }
          }),
          writable: false,
          configurable: false
        });

        const stubFunction = (name) => {
          Object.defineProperty(window, name, {
            value: function() {},
            writable: false,
            configurable: false
          });
        };

        stubFunction('gtag');
        stubFunction('ga');
        stubFunction('fbq');
        stubFunction('_fbq');
        stubFunction('twq');

        const blockList = [
          'googletagmanager.com',
          'google-analytics.com',
          'analytics.google.com',
          'facebook.net',
          'connect.facebook.com',
          'doubleclick.net',
          'googlesyndication.com'
        ];

        const originalCreateElement = document.createElement;
        document.createElement = function(tagName, options) {
          const element = originalCreateElement.call(document, tagName, options);

          if (tagName && tagName.toLowerCase() === 'script') {
            const srcDescriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
            if (srcDescriptor) {
              Object.defineProperty(element, 'src', {
                set: function(value) {
                  if (value && blockList.some(blocked => value.includes(blocked))) {
                    return;
                  }
                  srcDescriptor.set.call(this, value);
                },
                get: function() {
                  return srcDescriptor.get.call(this);
                }
              });
            }
          }

          return element;
        };
      })();
    `;
  };

  const buildUrlWithSession = (url: string) => {
    let finalUrl = url;
    if (!finalUrl.includes('webview=1')) {
      const separator = finalUrl.includes('?') ? '&' : '?';
      finalUrl = `${finalUrl}${separator}webview=1`;
    }
    return finalUrl;
  };


  const getInjectedJavaScript = () => {
    return `
    (function() {
      var originalLog = console.log;
      var originalWarn = console.warn;
      var originalError = console.error;

      console.log = function() {
        var args = Array.prototype.slice.call(arguments);
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'CONSOLE_LOG',
          level: 'log',
          message: args.join(' ')
        }));
        originalLog.apply(console, arguments);
      };

      console.warn = function() {
        var args = Array.prototype.slice.call(arguments);
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'CONSOLE_LOG',
          level: 'warn',
          message: args.join(' ')
        }));
        originalWarn.apply(console, arguments);
      };

      console.error = function() {
        var args = Array.prototype.slice.call(arguments);
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'CONSOLE_LOG',
          level: 'error',
          message: args.join(' ')
        }));
        originalError.apply(console, arguments);
      };

      var viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        document.head.appendChild(viewport);
      }
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';

      document.body.classList.add('webview-mode');

      document.addEventListener('click', function(e) {
        var target = e.target;
        if (target && (
          target.classList.contains('add-to-cart') ||
          target.closest('.add-to-cart') ||
          target.classList.contains('btn-add-cart')
        )) {
          window.ReactNativeWebView?.postMessage(JSON.stringify({
            type: 'ADD_TO_CART_CLICKED',
            data: { productId: target.dataset?.productId || null }
          }));
        }
      });

      var lastScrollTop = 0;
      var ticking = false;

      window.addEventListener('scroll', function() {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (!ticking) {
          window.requestAnimationFrame(function() {
            if (Math.abs(scrollTop - lastScrollTop) > 1) {
              window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'SCROLL',
                y: scrollTop
              }));
              lastScrollTop = scrollTop;
            }
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });

      // Skanuj licznik koszyka ze strony K-Sport
      var lastCartCount = -1;
      function checkCartCount() {
        var count = null;

        // Próbuj różne selektory dla licznika koszyka
        var selectors = [
          '#menu_basket_mobile span',
          '.basket_mobile_lnk span',
          '#menu_basket_mobile a span',
          '.header-mobile-top .basket_mobile_lnk span',
          '[class*="basket"] span',
          '.icon-shopping-cart + span',
          '.icon-basket + span'
        ];

        for (var i = 0; i < selectors.length; i++) {
          var el = document.querySelector(selectors[i]);
          if (el && el.textContent) {
            var num = parseInt(el.textContent.trim());
            if (!isNaN(num)) {
              count = num;
              break;
            }
          }
        }

        // Jeśli nie znaleziono elementu, nie aktualizuj (zachowaj poprzednią wartość)
        if (count === null) {
          return;
        }

        // Wyślij tylko jeśli się zmieniło
        if (count !== lastCartCount) {
          lastCartCount = count;
          window.ReactNativeWebView?.postMessage(JSON.stringify({
            type: 'CART_UPDATE',
            count: count
          }));
        }
      }
      // Sprawdzaj co 1 sekundę
      setInterval(checkCartCount, 1000);
      // Sprawdź też od razu i po załadowaniu
      setTimeout(checkCartCount, 500);
      setTimeout(checkCartCount, 1500);
      setTimeout(checkCartCount, 3000);

      var userDataSent = false;

      function tryExtractUserData() {
        if (userDataSent) return;

        try {
          var storedData = localStorage.getItem('ksportUserData');
          if (storedData) {
            var userData = JSON.parse(storedData);
            if (userData.firstName && userData.lastName) {
              window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'USER_DATA_EXTRACTED',
                firstName: userData.firstName,
                lastName: userData.lastName
              }));
              userDataSent = true;
              return true;
            }
          }
        } catch (e) {}

        var firstNameInput = document.querySelector('input[name="imie"], input[placeholder*="Imię"], input[placeholder*="imie"]');
        var lastNameInput = document.querySelector('input[name="nazwisko"], input[placeholder*="Nazwisko"], input[placeholder*="nazwisko"]');

        if (firstNameInput && lastNameInput) {
          var firstName = firstNameInput.value?.trim();
          var lastName = lastNameInput.value?.trim();

          if (firstName && lastName && firstName.length > 0 && lastName.length > 0) {
            window.ReactNativeWebView?.postMessage(JSON.stringify({
              type: 'USER_DATA_EXTRACTED',
              firstName: firstName,
              lastName: lastName
            }));
            userDataSent = true;
            return true;
          }
        }

        var userNameElement = document.querySelector('.user-name, .username, [data-user-name], .account-name, .user-info');

        if (userNameElement) {
          var fullName = userNameElement.textContent?.trim();
          if (fullName && fullName.length > 0 && fullName !== 'Zaloguj' && fullName !== 'Moje konto') {
            var nameParts = fullName.split(/\\s+/);
            if (nameParts.length >= 2) {
              window.ReactNativeWebView?.postMessage(JSON.stringify({
                type: 'USER_DATA_EXTRACTED',
                firstName: nameParts[0],
                lastName: nameParts.slice(1).join(' ')
              }));
              userDataSent = true;
              return true;
            }
          }
        }
        return false;
      }

      setInterval(tryExtractUserData, 1000);

      var observer = new MutationObserver(function(mutations) {
        tryExtractUserData();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    })();
    true;
  `;
  };

  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      switch (message.type) {
        case 'CONSOLE_LOG':
          break;

        case 'SCROLL':
          break;

        case 'CART_UPDATE':
          onCartUpdate?.(message);
          break;

        case 'USER_IS_LOGGED_IN':
          onUserLoggedInMessage?.();
          break;

        case 'USER_DATA_EXTRACTED':
          if (onUserDataExtracted && message.firstName && message.lastName) {
            onUserDataExtracted(message.firstName, message.lastName);
          }
          break;

        case 'REQUEST_LOGIN':
          onRequestLogin?.();
          break;

        case 'ADD_TO_CART_CLICKED':
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const handleRetry = () => {
    setHasNetworkError(false);
    webViewRef.current?.reload();
  };

  const renderNoInternetView = () => (
    <View style={styles.noInternetContainer}>
      <View style={styles.noInternetContent}>
        <Icon name="cloud-offline-outline" size={80} color="#e30613" />
        <Text style={styles.noInternetTitle}>Brak połączenia z internetem</Text>
        <Text style={styles.noInternetSubtitle}>
          Sprawdź połączenie WiFi lub dane komórkowe i spróbuj ponownie
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Icon name="refresh-outline" size={20} color="#FFFFFF" style={{marginRight: 8}} />
          <Text style={styles.retryButtonText}>Spróbuj ponownie</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      {hasNetworkError ? renderNoInternetView() : (
      <WebView
        ref={webViewRef}
        source={getWebViewSource()}
        style={styles.webView}
        onLoadStart={(syntheticEvent) => {
          setIsLoading(true);
        }}
        onLoadEnd={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          setIsLoading(false);

          if (loginCredentials && !postLoginCompleted && nativeEvent.url.includes('logowanie.php')) {
            setPostLoginCompleted(true);
            setTimeout(() => {
              const mainUrl = buildUrlWithSession(targetUrl);
              webViewRef.current?.injectJavaScript(`
                window.location.href = '${mainUrl}';
                true;
              `);
            }, 500);
          }
        }}
        onNavigationStateChange={(navState) => {
          setCurrentUrl(navState.url);
          setCanGoBack(navState.canGoBack);

          if (loadedFromNotification && navState.url !== currentUrl) {
            const isHomeUrl = navState.url.includes('k-sport.com.pl?webview=1') || navState.url.includes('k-sport.com.pl/?webview=1');
            if (isHomeUrl) {
              setLoadedFromNotification(false);
            }
          }
        }}
        onMessage={handleMessage}
        injectedJavaScriptBeforeContentLoaded={getTrackingBlockingScript()}
        injectedJavaScript={getInjectedJavaScript()}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('WebView HTTP ERROR:', nativeEvent.statusCode, nativeEvent.url);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          if (nativeEvent.code === -1009 || nativeEvent.description?.includes('offline') || nativeEvent.description?.includes('internet')) {
            setHasNetworkError(true);
          }
        }}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={true}
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        bounces={false}
        showsVerticalScrollIndicator={false}
        incognito={false}
        limitsNavigationsToAppBoundDomains={false}
        onShouldStartLoadWithRequest={(request) => {
          if (request.url.startsWith('about:')) {
            return false;
          }

          if (request.url.includes('logowanie.php')) {
            return true;
          }

          return true;
        }}
      />
      )}

    </View>
  );
});

UnifiedWebViewScreen.displayName = 'UnifiedWebViewScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  noInternetContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noInternetContent: {
    alignItems: 'center',
  },
  noInternetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1c1e',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  noInternetSubtitle: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#e30613',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UnifiedWebViewScreen;
