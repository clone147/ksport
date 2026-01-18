import React, {useMemo, useState, useRef, forwardRef, useImperativeHandle} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  TextInput,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

interface CollapsibleHeaderProps {
  scrollY: Animated.Value;
  userName?: string;
  onSearchPress?: () => void;
  onQRScanPress?: () => void;
  onNotificationPress?: () => void;
  onBackPress?: () => void;
  canGoBack?: boolean;
  onSearchSubmit?: (query: string) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

export interface CollapsibleHeaderRef {
  getSearchQuery: () => string;
}

const CollapsibleHeader = forwardRef<CollapsibleHeaderRef, CollapsibleHeaderProps>(({
  scrollY,
  userName,
  onSearchPress,
  onQRScanPress,
  onNotificationPress,
  onBackPress,
  canGoBack = false,
  onSearchSubmit,
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
}, ref) => {
  const insets = useSafeAreaInsets();
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : localSearchQuery;
  const setSearchQuery = onSearchQueryChange || setLocalSearchQuery;
  const searchInputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => ({
    getSearchQuery: () => searchQuery,
  }));

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Dzień dobry';
    if (hour < 18) return 'Dzień dobry';
    return 'Dobry wieczór';
  };

  const maxHeaderHeight = 130 + insets.top;
  const minHeaderHeight = insets.top + 5;
  const scrollRange = 50;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [maxHeaderHeight, minHeaderHeight],
    extrapolate: 'clamp',
    easing: (t) => t,
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 30],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  const searchBarScale = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [1, 0.85],
    extrapolate: 'clamp',
  });

  const searchBarOpacity = scrollY.interpolate({
    inputRange: [0, scrollRange],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const greetingOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const greetingTranslateY = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      onSearchSubmit?.(searchQuery.trim());
      searchInputRef.current?.blur();
    }
  };

  return (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          height: headerHeight,
          opacity: headerOpacity,
        },
      ]}>
      <LinearGradient
        colors={['#e30613', '#c00510', '#e30613']}
        style={styles.gradientBackground}>
        <View style={[styles.headerContent, {paddingTop: insets.top + 4}]}>
          {/* Top Row - Greeting & Notification */}
          <Animated.View
            style={[
              styles.topRow,
              {
                opacity: greetingOpacity,
                transform: [{translateY: greetingTranslateY}],
              },
            ]}>
            <View style={styles.greetingContainer}>
              <View style={styles.avatarCircle}>
                <Icon name="person" size={20} color="#e30613" />
              </View>
              <View>
                <Text style={styles.greetingText}>{getCurrentGreeting()}</Text>
                {userName && (
                  <Text style={styles.userNameText}>{userName}</Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.notificationIconContainer}
              onPress={onBackPress}>
              <Icon
                name="chevron-back"
                size={26}
                color="#fff"
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Search Bar */}
          <Animated.View
            style={[
              styles.searchBarContainer,
              {
                transform: [{scale: searchBarScale}],
                opacity: searchBarOpacity,
              },
            ]}>
            <View style={styles.searchBar}>
              <TouchableOpacity
                style={styles.searchInputArea}
                activeOpacity={1}
                onPress={() => searchInputRef.current?.focus()}>
                <Icon name="search-outline" size={20} color="#e30613" />
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Czego szukasz?"
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearchSubmit}
                  returnKeyType="search"
                  enablesReturnKeyAutomatically={true}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.qrButtonWrapper}
                onPress={onQRScanPress}
                activeOpacity={0.8}>
                <View style={styles.qrButton}>
                  <LinearGradient
                    colors={['#e30613', '#c00510']}
                    style={styles.qrGradient}>
                    <Icon name="qr-code-outline" size={20} color="#fff" />
                  </LinearGradient>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        {/* Shadow Overlay */}
        <View style={styles.shadowOverlay} />
      </LinearGradient>
    </Animated.View>
  );
});

CollapsibleHeader.displayName = 'CollapsibleHeader';

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    overflow: 'hidden',
  },
  gradientBackground: {
    flex: 1,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    opacity: 0.95,
  },
  userNameText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  notificationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#fff',
  },
  searchBarContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  searchInputArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingLeft: 14,
    paddingRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    padding: 0,
  },
  qrButtonWrapper: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  qrButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    overflow: 'hidden',
  },
  qrGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default CollapsibleHeader;
