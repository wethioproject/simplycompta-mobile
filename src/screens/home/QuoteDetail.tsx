import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fileIcon } from '../../assets/icons';
import { useBankStatement } from '../../hooks/useBankStatement';
import { STORAGE_BASE_URL } from '../../config';

const QuoteDetail: React.FC = ({ navigation, route }: any) => {
  const quote = route?.params?.quote;
  const { getBankStatement } = useBankStatement();
  const [bankStatement, setBankStatement] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (quote?.id) {
      console.log('Bank Statement ID received:', quote.id);
      fetchBankStatementDetail();
    } else {
      console.warn('No bank statement ID provided');
    }
  }, [quote?.id]);

  const fetchBankStatementDetail = async () => {
    try {
      setLoading(true);
      const result = await getBankStatement(quote.id);
      if (result.success && result.bankStatement) {
        setBankStatement(result.bankStatement);
        console.log('Bank Statement detail:', result.bankStatement);
      }
    } catch (err) {
      console.error('Error fetching bank statement detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatMonthYear = (monthYear: string) => {
    // Convert "02-2026" to "Février 2026"
    const [month, year] = monthYear.split('-');
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  const handleOpenPDF = () => {
    if (bankStatement?.file_path) {
      const url = `${STORAGE_BASE_URL}${bankStatement.file_path}`;
      Linking.openURL(url).catch(err => {
        console.error('Failed to open PDF:', err);
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relevé Bancaire</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuDots}>⋮</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0B5FA5" />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : bankStatement ? (
          <>
            {/* Status Badge */}
            <View style={styles.statusDropdown}>
              <Image
                source={fileIcon}
                style={[styles.statusIcon, { tintColor: '#FFFFFF' }]}
                resizeMode="contain"
              />
              <Text style={styles.statusText}>PDF Document</Text>
            </View>

            {/* Bank Statement Info Section */}
            <View style={styles.section}>
              <View style={styles.row}>
                <Text style={styles.label}>Période</Text>
                <Text style={styles.value}>{formatMonthYear(bankStatement.month_year)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Date d'ajout</Text>
                <Text style={styles.value}>{formatDate(bankStatement.created_at)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Dernière modification</Text>
                <Text style={styles.value}>{formatDate(bankStatement.updated_at)}</Text>
              </View>
            </View>

            {/* File Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Document PDF</Text>
              <TouchableOpacity style={styles.fileCard} onPress={handleOpenPDF}>
                <View style={styles.fileInfo}>
                  <Image
                    source={fileIcon}
                    style={[styles.fileIcon, { tintColor: '#0B5FA5' }]}
                    resizeMode="contain"
                  />
                  <View style={styles.fileDetails}>
                    <Text style={styles.fileName}>Relevé Bancaire</Text>
                    <Text style={styles.filePath}>{formatMonthYear(bankStatement.month_year)}.pdf</Text>
                  </View>
                </View>
                <Text style={styles.viewText}>Voir →</Text>
              </TouchableOpacity>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                Ce document contient votre relevé bancaire pour la période de {formatMonthYear(bankStatement.month_year)}.
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Impossible de charger le relevé bancaire</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {bankStatement && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Image
              source={fileIcon}
              style={[styles.actionIcon, { tintColor: '#0B5FA5' }]}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.blueButton]} onPress={handleOpenPDF}>
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
      )}
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
    backgroundColor: '#0B5FA5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  statusIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 16,
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
  sectionTitle: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
    marginBottom: 12,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
    marginBottom: 4,
  },
  filePath: {
    fontSize: 12,
    color: '#999999',
  },
  viewText: {
    fontSize: 14,
    color: '#0B5FA5',
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#E8F0F7',
    padding: 16,
    borderRadius: 2,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
});

export default QuoteDetail;
