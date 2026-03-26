import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ArrowLeft, Upload } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { appLogoIcon } from '../../assets/icons';
import { styles } from '../../styles/expenses.styles';

interface ExpenseHeaderProps {
  onBack: () => void;
  onExport: () => void;
  exporting: boolean;
}

const ExpenseHeader: React.FC<ExpenseHeaderProps> = ({ onBack, onExport, exporting }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
      </View>
      <View style={styles.titleRow}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.titleText}>{t('title_expenses')}</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={styles.exportBtn}
          onPress={onExport}
          disabled={exporting}
          activeOpacity={0.8}
        >
          {exporting
            ? <ActivityIndicator size="small" color="#4B5563" />
            : <Upload size={15} color="#4B5563" />
          }
          <Text style={styles.exportBtnText}>{t('button_export')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ExpenseHeader;
