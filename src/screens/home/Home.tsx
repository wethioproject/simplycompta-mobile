import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { 
  Bell, 
  Search, 
  Home as HomeIcon, 
  ChevronRight, 
  Headphones,
} from 'lucide-react-native';
import { appLogoIcon } from '../../assets/icons';
import LinearGradient from 'react-native-linear-gradient';
import notificationService from '../../services/notificationService';

type DrawerNavigation = DrawerNavigationProp<any>;

const Home: React.FC = () => {
  const navigation = useNavigation<DrawerNavigation>();
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnread, setHasUnread] = useState(false);
  console.log('hasUnread', hasUnread)

  useEffect(() => {
    notificationService.hasUnreadNotifications().then(setHasUnread);
  }, []);

  const handleNavigate = (page: string) => {
    const routes: { [key: string]: string } = {
      'profile': 'Profile',
      'legal': 'Legal Documents',
      'accounting': 'Accounting Documents',
      'activity': 'Activity',
      'bank': 'Bank Statements',
      'notifications': 'Notifications',
      'contact-comptable': 'Contact'
    };
    
    const route = routes[page];
    if (route) {
      navigation.navigate(route);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Search
              size={20}
              color="#9CA3AF"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity style={styles.notificationButton} onPress={() => handleNavigate('notifications')}>
            <Bell size={24} color="#4B5563" />
            {hasUnread && (
              <View style={styles.notificationBadge}>
                <View style={styles.notificationBadgeDot} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.mainContent} 
        contentContainerStyle={styles.mainContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridContainer}>
          {/* Mon Profil */}
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => handleNavigate('profile')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#2563EB', '#1E5BAC']}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardInner}>
                <View style={styles.cardIconContainer}>
                  <View style={styles.cardIconWhiteBg}>
                    <HomeIcon size={36} color="#1E5BAC" />
                  </View>
                </View>
                <Text style={styles.cardText}>Mon Profil</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Documents Juridiques */}
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => handleNavigate('legal')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#22D3EE', '#0891B2']}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardInner}>
                <View style={styles.cardIconContainer}>
                  <View style={styles.cardIconBg}>
                    <HomeIcon size={36} color="#FFFFFF" />
                  </View>
                </View>
                <Text style={styles.cardText}>Documents Juridiques</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Documents Comptables */}
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => handleNavigate('accounting')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#9333EA', '#6B21A8']}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardInner}>
                <View style={styles.cardIconContainer}>
                  <View style={styles.cardIconBg}>
                    <HomeIcon size={36} color="#FFFFFF" />
                  </View>
                </View>
                <Text style={styles.cardText}>Documents Comptables</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Mon Activité */}
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => handleNavigate('activity')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FB923C', '#EA580C']}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardInner}>
                <View style={styles.cardIconContainer}>
                  <View style={styles.cardIconBg}>
                    <HomeIcon size={36} color="#FFFFFF" />
                  </View>
                </View>
                <Text style={styles.cardText}>Mon Activité</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Mes Relevés Bancaires */}
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => handleNavigate('bank')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10B981', '#047857']}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardInner}>
                <View style={styles.cardIconContainer}>
                  <View style={styles.cardIconBg}>
                    <HomeIcon size={36} color="#FFFFFF" />
                  </View>
                </View>
                <Text style={styles.cardText}>Mes Relevés Bancaires</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Mes Notifications */}
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => handleNavigate('notifications')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#1E5BAC', '#14407A']}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardInner}>
                {hasUnread && (
                  <View style={styles.cardBadge}>
                    <View style={styles.cardBadgeDot} />
                  </View>
                )}
                <View style={styles.cardIconContainer}>
                  <View style={styles.cardIconBg}>
                    <HomeIcon size={36} color="#FFFFFF" />
                  </View>
                </View>
                <Text style={styles.cardText}>Mes Notifications</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <View style={styles.contactHeader}>
            <View style={styles.contactHeaderLeft}>
              <View style={styles.contactIconCircle}>
                <Headphones size={24} color="#10B981" />
              </View>
              <View style={styles.contactTextContainer}>
                <Text style={styles.contactText}>
                  Une question ou un document à{'\n'}transmettre à votre cabinet ?
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </View>

          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => handleNavigate('contact-comptable')}
            activeOpacity={0.8}
          >
            <Text style={styles.contactButtonText}>Contacter mon comptable</Text>
            <Text style={styles.contactButtonArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    height: 64,
    width: 200,
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
  notificationButton: {
    position: 'relative',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  mainContent: {
    flex: 1,
  },
  mainContentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  cardButton: {
    width: '48%',
    marginBottom: 16,
    //     borderWidth: 1,
    // borderColor: "black",
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardInner: {
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  cardIconContainer: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconWhiteBg: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconBg: {
    // backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  cardBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  cardBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  cardBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  contactSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  contactHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  contactIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactTextContainer: {
    flex: 1,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1E5BAC',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  contactButtonText: {
    color: '#1E5BAC',
    fontSize: 16,
    fontWeight: '600',
  },
  contactButtonArrow: {
    color: '#1E5BAC',
    fontSize: 18,
    fontWeight: '400',
  },
});

export default Home;