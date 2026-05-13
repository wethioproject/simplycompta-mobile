import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronLeft, Share2 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
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
      <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
        <ChevronLeft size={22} color="#374151" strokeWidth={2.5} />
      </TouchableOpacity>

      <Text style={styles.titleText}>{t('title_expenses')}</Text>

      <TouchableOpacity
        style={styles.exportBtn}
        onPress={onExport}
        disabled={exporting}
        activeOpacity={0.7}
      >
        {exporting
          ? <ActivityIndicator size="small" color="#374151" />
          : <Share2 size={18} color="#374151" />
        }
        <Text style={styles.exportBtnText}>{t('button_export')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ExpenseHeader;
