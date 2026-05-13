import React, { useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview';
import { useDispatch } from 'react-redux';
import { X } from 'lucide-react-native';
import { loadSubscription } from '../store/slices/subscriptionSlice';
import { navigationRef } from '../navigation/navigationRef';

const UpgradeWebViewModal: React.FC = () => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const topPadding = Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight ?? 24);
  const dispatch = useDispatch();


  const handleClose = useCallback(() => {
    setUrl(null);
  }, []);

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      if (navState.url?.startsWith('myapp://')) {
        setUrl(null);
        if (navState.url.includes('subscription-success')) {
          if (navigationRef.isReady()) {
            navigationRef.navigate('Home' as never);
          }
          dispatch(loadSubscription() as any);
        }
      }
    },
    [dispatch],
  );

  if (!url) return null;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          onPress={handleClose}
          style={styles.closeBtn}
          activeOpacity={0.7}
        >
          <X size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* WebView */}
      <WebView
        source={{ uri: url }}
        style={styles.webView}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={(request) => {
          if (request.url?.startsWith('myapp://')) {
            handleNavigationStateChange(request as any);
            return false;
          }
          return true;
        }}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1E5BAC" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
});

export default UpgradeWebViewModal;
