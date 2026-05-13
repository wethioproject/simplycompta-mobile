import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { appLogoIcon } from '../../assets/icons';

interface ClientHeaderProps {
  title: string;
  onBack: () => void;
  /** Optional element rendered on the right side of the title row (e.g. edit button). */
  rightElement?: React.ReactNode;
}

export const ClientHeader: React.FC<ClientHeaderProps> = ({
  title,
  onBack,
  rightElement,
}) => (
  <View style={styles.header}>
    <View style={styles.headerTop}>
      <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
    </View>
    <View style={styles.titleRow}>
      <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
        <ArrowLeft size={22} color="#1F2937" />
      </TouchableOpacity>
      <Text style={styles.titleText}>{title}</Text>
      <View style={{ flex: 1 }} />
      {rightElement}
    </View>
  </View>
);

const styles = StyleSheet.create({
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
  headerTop: { alignItems: 'center', marginBottom: 12 },
  logo: { height: 48, width: 160 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
});
