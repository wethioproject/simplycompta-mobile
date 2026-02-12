import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { downArrowIcon, fileIcon } from '../../assets/icons';

const InvoiceDetail: React.FC = ({ navigation, route }: any) => {
  const invoice = route?.params?.invoice;
  const [status, setStatus] = useState(invoice?.status || 'Brouillon');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{invoice?.number || 'FA-202601-0002'}</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuDots}>⋮</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Dropdown */}
        <TouchableOpacity style={styles.statusDropdown}>
          <Text style={styles.statusText}>{status}</Text>
          <Image
            source={downArrowIcon}
            style={styles.dropdownIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Invoice Info Section */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>FACTURE</Text>
            <Text style={styles.value}>{invoice?.number || 'FA-202601-0002'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date d'émission</Text>
            <Text style={styles.value}>{invoice?.date || '21/01/2026'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date d'échéance</Text>
            <Text style={styles.value}>{invoice?.date || '21/01/2026'}</Text>
          </View>
        </View>
        {/* <View style={styles.divider} /> */}

        {/* Client Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adressé à :</Text>
          <View style={styles.clientCard}>
            <Text style={styles.clientName}>{invoice?.client?.toUpperCase() || 'A BARB'}</Text>
            <Text style={styles.clientInfo}>I.C.E : 88588968888</Text>
          </View>
        </View>

        {/* Totals Section */}
        <View style={styles.totalSection}>
          <View style={styles.row}>
            <Text style={styles.label}>Total HT</Text>
            <Text style={styles.valueBlue}>0,00 MAD</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total TVA</Text>
            <Text style={styles.valueBlue}>0,00 MAD</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Total Réductions</Text>
            <Text style={styles.valueBlue}>0,00 MAD</Text>
          </View>
          {/* <View style={styles.divider} /> */}
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total TTC</Text>
            <Text style={styles.totalValue}>{invoice?.amount || '0,00'} MAD</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Image
            source={fileIcon}
            style={[styles.actionIcon, { tintColor: '#0B5FA5' }]}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.blueButton]}>
          <Image
            source={fileIcon}
            style={[styles.actionIcon, { tintColor: '#FFFFFF' }]}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.greenButton]}>
          <Image
            source={fileIcon}
            style={[styles.actionIcon, { tintColor: '#FFFFFF' }]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#F5F5F5',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
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
  menuButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuDots: {
    fontSize: 24,
    color: '#0B5FA5',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  statusDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333333',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginRight: 12,
  },
  dropdownIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
  },
  totalSection: {
        backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 16,
    // borderRadius: 8,  
    marginBottom: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 16,
    // borderRadius: 8,  
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
  },
  value: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  valueBlue: {
    fontSize: 14,
    color: '#0B5FA5',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
    marginBottom: 12,
  },
  clientCard: {
    backgroundColor: '#E8F0F7',
    padding: 16,
    borderRadius: 2,
  },
  clientName: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
    marginBottom: 8,
  },
  clientInfo: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    color: '#0B5FA5',
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  blueButton: {
    backgroundColor: '#0B5FA5',
    borderColor: '#0B5FA5',
  },
  greenButton: {
    backgroundColor: '#3CEBBA',
    borderColor: '#3CEBBA',
  },
  actionIcon: {
    width: 24,
    height: 24,
  },
});

export default InvoiceDetail;
