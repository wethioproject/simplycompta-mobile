import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ArrowLeft,
  Bell,
  Search,
  Calendar,
  FileText,
  Megaphone,
  Headphones,
  ArrowRight,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { appLogoIcon } from '../../assets/icons';
import { useNotification } from '../../hooks/useNotification';
import { Notification } from '../../services/notificationService';

type StackNavigation = StackNavigationProp<any>;

// ─── Icon Type Inference ──────────────────────────────────────────────────────
type IconType = 'calendar' | 'pdf' | 'megaphone' | 'bell';

const getIconType = (title: string): IconType => {
  const lower = title.toLowerCase();
  if (lower.includes('taxe') || lower.includes('fin du') || lower.includes('téléverser'))
    return 'calendar';
  if (
    lower.includes('attestation') ||
    lower.includes('registre') ||
    lower.includes('document') ||
    lower.includes('tva') ||
    lower.includes('bilan') ||
    lower.includes('déclaration')
  )
    return 'pdf';
  if (
    lower.includes('avis') ||
    lower.includes('subvention') ||
    lower.includes('information') ||
    lower.includes('annonce')
  )
    return 'megaphone';
  return 'bell';
};

// ─── Notification Icon ────────────────────────────────────────────────────────
const NotificationIcon: React.FC<{ type: IconType }> = ({ type }) => {
  if (type === 'calendar') {
    return (
      <LinearGradient
        colors={['#FB923C', '#EF4444']}
        style={styles.notifIconBox}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.notifIconCenter}>
          <Calendar size={20} color="#FFFFFF" strokeWidth={2.5} />
        </View>
      </LinearGradient>
    );
  }
  if (type === 'pdf') {
    return (
      <View style={[styles.notifIconBox, styles.notifIconBlue]}>
        <View style={styles.notifIconCenter}>
          <FileText size={20} color="#FFFFFF" strokeWidth={2.5} />
        </View>
        <View style={styles.pdfBadge}>
          <Text style={styles.pdfBadgeText}>PDF</Text>
        </View>
      </View>
    );
  }
  if (type === 'megaphone') {
    return (
      <View style={[styles.notifIconBox, styles.notifIconBlue]}>
        <View style={styles.notifIconCenter}>
          <Megaphone size={20} color="#FFFFFF" strokeWidth={2.5} />
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.notifIconBox, styles.notifIconBlue]}>
      <View style={styles.notifIconCenter}>
        <Bell size={20} color="#FFFFFF" strokeWidth={2.5} />
      </View>
    </View>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Notifications: React.FC = ({ navigation: navProp }: any) => {
  const navigation = useNavigation<StackNavigation>();
  const nav = navProp ?? navigation;

  const { notification } = useNotification();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotifications = async () => {
    try {
      const result = await notification();
      if (result.success && result.notifications) {
        setNotifications(result.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const formatTime = (timestamp: string): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const iconType = getIconType(item.title ?? '');
    return (
      <TouchableOpacity
        style={styles.notifCard}
        activeOpacity={0.7}
        onPress={() => nav.navigate('Notification Detail', { notificationId: item.id })}
      >
        <View style={styles.notifRow}>
          <NotificationIcon type={iconType} />

          <View style={styles.notifBody}>
            <Text style={styles.notifTitle}>{item.title}</Text>
            <Text style={styles.notifMessage} numberOfLines={3}>
              {item.message}
            </Text>
            {!!item.created_at && (
              <Text style={styles.notifTime}>{formatTime(item.created_at)}</Text>
            )}
          </View>

          {!item.is_read && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = (
    <LinearGradient
      colors={['#EFF6FF', '#DBEAFE']}
      style={styles.titleBanner}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.titleBannerInner}>
        <View style={styles.titleIconBox}>
          <Bell size={20} color="#FFFFFF" strokeWidth={2.5} />
        </View>
        <Text style={styles.titleText}>Mes Notifications</Text>
      </View>
    </LinearGradient>
  );

  const ListEmpty = (
    <View style={styles.emptyContainer}>
      <Bell size={40} color="#D1D5DB" />
      <Text style={styles.emptyText}>Aucune notification</Text>
    </View>
  );

  const ListFooter = (
    <View style={styles.helpCard}>
      <View style={styles.helpRow}>
        <View style={styles.helpIconCircle}>
          <Headphones size={20} color="#0F766E" />
        </View>
        <Text style={styles.helpText}>
          Une question ou un document à transmettre à votre cabinet ?
        </Text>
      </View>
      <TouchableOpacity
        style={styles.contactButton}
        onPress={() => nav.navigate('Contact')}
        activeOpacity={0.8}
      >
        <Text style={styles.contactButtonText}>Contacter mon comptable</Text>
        <ArrowRight size={16} color="#1E5BAC" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E5BAC" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => nav.goBack()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color="#4B5563" />
          </TouchableOpacity>
          <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {/* <TouchableOpacity style={styles.bellButton}>
            <Bell size={24} color="#4B5563" />
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>3</Text>
            </View>
          </TouchableOpacity> */}
        </View>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E5BAC" />
        }
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
      />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  // Header
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: 48,
    width: 160,
  },
  headerSpacer: {
    width: 40,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    padding: 0,
  },
  bellButton: {
    position: 'relative',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  bellBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // List
  listContent: {
    padding: 12,
    paddingBottom: 32,
    gap: 10,
  },
  // Title Banner
  titleBanner: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  titleBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  titleIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1E5BAC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
  },
  // Notification Card
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  // Notification Icon
  notifIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    overflow: 'hidden',
    flexShrink: 0,
  },
  notifIconBlue: {
    backgroundColor: '#3B82F6',
  },
  notifIconCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    paddingHorizontal: 2,
  },
  pdfBadgeText: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  // Notification Body
  notifBody: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 3,
    paddingRight: 14,
  },
  notifMessage: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
  },
  notifTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'right',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E5BAC',
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  // Help Card
  helpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginTop: 2,
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  helpIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  helpText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    lineHeight: 17,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1E5BAC',
    borderRadius: 8,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E5BAC',
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Notifications;