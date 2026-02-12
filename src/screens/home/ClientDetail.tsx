import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fileIcon } from '../../assets/icons';

const ClientDetail: React.FC = ({ navigation, route }: any) => {
  const { client } = route.params;

  const handleRelevePress = () => {
    navigation.navigate('Account Statement');
  };

  const handleDevisPress = () => {
    navigation.navigate('Documents', { type: 'devis', client });
  };

  const handleBonLivraisonPress = () => {
    navigation.navigate('Documents', { type: 'bon_livraison', client });
  };

  const handleFacturesPress = () => {
    navigation.navigate('Documents', { type: 'factures', client });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CLT-0001</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Client Name */}
        <Text style={styles.clientName}>{client.name}</Text>

        {/* Client Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailText}>Devise : MAD - Dirham marocain</Text>
          <Text style={styles.detailText}>R.C : hcvjk</Text>
          <Text style={styles.detailText}>I.C.E : 88588968888</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Adresses Section */}
        <Text style={styles.sectionTitle}>Adresses</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          <View style={styles.cardBlue}>
            <Image source={fileIcon} style={styles.cardIcon} resizeMode="contain" />
            <View>
              <Text style={styles.cardLabel}>Facturé en TTC</Text>
              <Text style={styles.cardAmount}>24,00 MAD</Text>
            </View>
          </View>
          <View style={styles.cardBlue}>
            <Image source={fileIcon} style={styles.cardIcon} resizeMode="contain" />
            <View>
              <Text style={styles.cardLabel}>Facturé en TTC</Text>
              <Text style={styles.cardAmount}>24,00 MAD</Text>
            </View>
          </View>
          <View style={styles.cardBlue}>
            <Image source={fileIcon} style={styles.cardIcon} resizeMode="contain" />
            <View>
              <Text style={styles.cardLabel}>Facturé en TTC</Text>
              <Text style={styles.cardAmount}>24,00 MAD</Text>
            </View>
          </View>
        </ScrollView>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Ventes Section */}
        <Text style={styles.sectionTitle}>Ventes</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          <TouchableOpacity style={styles.ventesCard} onPress={handleDevisPress}>
            <Image source={fileIcon} style={[styles.ventesIcon, { tintColor: '#4A90E2' }]} resizeMode="contain" />
            <Text style={styles.ventesText}>Devis (0)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ventesCard} onPress={handleBonLivraisonPress}>
            <Image source={fileIcon} style={[styles.ventesIcon, { tintColor: '#4A90E2' }]} resizeMode="contain" />
            <Text style={styles.ventesText}>Bon de livraison (0)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ventesCard} onPress={handleFacturesPress}>
            <Image source={fileIcon} style={[styles.ventesIcon, { tintColor: '#4A90E2' }]} resizeMode="contain" />
            <Text style={styles.ventesText}>Factures (0)</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Relevé de comptes */}
        <TouchableOpacity style={styles.releveButton} onPress={handleRelevePress}>
          <Image source={fileIcon} style={[styles.releveIcon, { tintColor: '#0B5FA5' }]} resizeMode="contain" />
          <Text style={styles.releveText}>Relevé de comptes</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Contacts Section */}
        <Text style={styles.sectionTitle}>Contacts (0)</Text>
        
        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: '#0B5FA5',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  clientName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333333',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  detailText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 12,
    lineHeight: 24,
  },
  divider: {
    // height: 8,
    // backgroundColor: '#F5F5F5',
    marginVertical: 16,
        borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  horizontalScroll: {
    paddingLeft: 20,
  },
  horizontalScrollContent: {
    paddingRight: 20,
    gap: 12,
  },
  cardYellow: {
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: 16,
    minWidth: 180,
  },
  cardBlue: {
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
    padding: 16,
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: {
    width: 32,
    height: 32,
    tintColor: '#4A90E2',
  },
  cardIconPurple: {
    width: 32,
    height: 32,
    tintColor: '#9B59B6',
    marginLeft: 'auto',
  },
  cardLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  ventesCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 20,
    minWidth: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ventesIcon: {
    width: 40,
    height: 40,
    marginBottom: 12,
  },
  ventesText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  releveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  releveIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  releveText: {
    fontSize: 18,
    color: '#0B5FA5',
    fontWeight: '500',
    flex: 1,
  },
  chevron: {
    fontSize: 28,
    color: '#999999',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default ClientDetail;
