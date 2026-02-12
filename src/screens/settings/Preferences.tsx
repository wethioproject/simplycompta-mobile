import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { downArrowIcon, fileIcon } from '../../assets/icons';

const Preferences: React.FC = ({ navigation }: any) => {
    const [numericFormat, setNumericFormat] = useState('12 345,67');
    const [dateFormat, setDateFormat] = useState('d/m/Y');
    const [timezone, setTimezone] = useState('UTC+1 Africa/Casablanca');
    const [devisValidity, setDevisValidity] = useState('15');
    const [invoiceDueDate, setInvoiceDueDate] = useState('À date d\'émission');
    const [enableBarcodes, setEnableBarcodes] = useState(false);
    const [enableImages, setEnableImages] = useState(false);
    const [enableBrands, setEnableBrands] = useState(false);
    const [notificationEmail, setNotificationEmail] = useState('');
    const [invoiceViewed, setInvoiceViewed] = useState(false);
    const [quoteViewed, setQuoteViewed] = useState(false);

    const handleSave = () => {
        console.log('Preferences saved');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Préférences</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Valeurs par défaut Section */}
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleWrapper}>
                        <Text style={styles.sectionTitle}>Valeurs par défaut</Text>
                    </View>

                </View>

                {/* Format numérique and Format date Row */}
                <View style={styles.rowContainer}>
                    <View style={styles.halfSection}>
                        <Text style={styles.label}>
                            Format numérique <Text style={styles.required}>*</Text>
                        </Text>
                        <TouchableOpacity style={styles.dropdown}>
                            <Text style={styles.dropdownText}>{numericFormat}</Text>
                            <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.halfSection}>
                        <Text style={styles.label}>
                            Format date <Text style={styles.required}>*</Text>
                        </Text>
                        <TouchableOpacity style={styles.dropdown}>
                            <Text style={styles.dropdownText}>{dateFormat}</Text>
                            <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Fuseau horaire */}
                <View style={styles.section}>
                    <Text style={styles.label}>
                        Fuseau horaire <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity style={styles.dropdown}>
                        <Text style={styles.dropdownText}>{timezone}</Text>
                        <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
                    </TouchableOpacity>
                </View>

                {/* Gestion commerciale Section */}
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleWrapper}>
                        <Text style={styles.sectionTitle}>Gestion commerciale</Text>
                    </View>
                </View>

                {/* Validité des devis */}
                <View style={styles.section}>
                    <Text style={styles.label}>Validité des devis</Text>
                    <View style={styles.inputWithSuffix}>
                        <TextInput
                            style={styles.numberInput}
                            value={devisValidity}
                            onChangeText={setDevisValidity}
                            keyboardType="number-pad"
                            placeholderTextColor="#999999"
                        />
                        <Text style={styles.suffix}>jours</Text>
                    </View>
                </View>

                {/* Echéance des factures */}
                <View style={styles.section}>
                    <Text style={styles.label}>Echéance des factures</Text>
                    <TouchableOpacity style={styles.dropdown}>
                        <Text style={styles.dropdownText}>{invoiceDueDate}</Text>
                        <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
                    </TouchableOpacity>
                </View>

                {/* Catalogue Section */}
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleWrapper}>
                        <Text style={styles.sectionTitle}>Catalogue</Text>
                    </View>

                </View>

                {/* Toggle Items */}
                <View style={styles.toggleItem}>
                    <Text style={styles.toggleLabel}>Activer les codes à barres</Text>
                    <Switch
                        value={enableBarcodes}
                        onValueChange={setEnableBarcodes}
                        trackColor={{ false: '#D0D0D0', true: '#0B5FA5' }}
                        thumbColor="#FFFFFF"
                    />
                </View>

                <View style={styles.toggleItem}>
                    <Text style={styles.toggleLabel}>Activer les images</Text>
                    <Switch
                        value={enableImages}
                        onValueChange={setEnableImages}
                        trackColor={{ false: '#D0D0D0', true: '#0B5FA5' }}
                        thumbColor="#FFFFFF"
                    />
                </View>

                <View style={styles.toggleItem}>
                    <Text style={styles.toggleLabel}>Activer les marques</Text>
                    <Switch
                        value={enableBrands}
                        onValueChange={setEnableBrands}
                        trackColor={{ false: '#D0D0D0', true: '#0B5FA5' }}
                        thumbColor="#FFFFFF"
                    />
                </View>

                {/* Les notifications Section */}
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleWrapper}>
                        <Text style={styles.sectionTitle}>Les notifications</Text>
                    </View>
                </View>

                {/* Email Input */}
                <View style={styles.section}>
                    <Text style={styles.label}>Envoyer les notifictions à</Text>
                    <View style={styles.emailInput}>
                        <Image source={fileIcon} style={{ width: 16, height: 16, marginRight: 12 }} resizeMode="contain" />
                        <TextInput
                            style={styles.emailTextInput}
                            value={notificationEmail}
                            onChangeText={setNotificationEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="Email"
                            placeholderTextColor="#999999"
                        />
                    </View>
                </View>

                {/* Notification Toggles */}
                <View style={styles.toggleItem}>
                    <Text style={styles.toggleLabel}>Facture consultée</Text>
                    <Switch
                        value={invoiceViewed}
                        onValueChange={setInvoiceViewed}
                        trackColor={{ false: '#D0D0D0', true: '#0B5FA5' }}
                        thumbColor="#FFFFFF"
                    />
                </View>

                <View style={styles.toggleItem}>
                    <Text style={styles.toggleLabel}>Devis consulté</Text>
                    <Switch
                        value={quoteViewed}
                        onValueChange={setQuoteViewed}
                        trackColor={{ false: '#D0D0D0', true: '#0B5FA5' }}
                        thumbColor="#FFFFFF"
                    />
                </View>

                {/* Extra spacing for fixed button */}
                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Fixed Save Button */}
            <TouchableOpacity style={styles.fixedSaveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#FFFFFF',
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        // borderBottomWidth: 1,
        // borderBottomColor: '#E5E5E5',
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
    sectionHeader: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 12,
        // borderBottomWidth: 1,
        // borderBottomColor: '#333333',
    },

    sectionTitleWrapper: {
        alignSelf: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#333333',
        paddingBottom: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
    },
    section: {
        marginHorizontal: 20,
        marginTop: 20,
    },
    rowContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 20,
        gap: 12,
    },
    halfSection: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        color: '#666666',
        marginBottom: 8,
        fontWeight: '500',
    },
    required: {
        color: '#E74C3C',
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 2,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    dropdownText: {
        fontSize: 14,
        color: '#333333',
    },
    dropdownIcon: {
        width: 14,
        height: 14,
    },
    inputWithSuffix: {
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 2,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    numberInput: {
        flex: 1,
        fontSize: 14,
        color: '#333333',
        padding: 0,
    },
    suffix: {
        fontSize: 14,
        color: '#999999',
        marginLeft: 12,
    },
    emailInput: {
        flexDirection: 'row',
        alignItems: 'center',
        // backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 2,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    emailTextInput: {
        flex: 1,
        fontSize: 14,
        color: '#333333',
        padding: 0,
    },
    toggleItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 16,
        paddingBottom: 12,
    },
    toggleLabel: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
    bottomSpacer: {
        height: 20,
    },
    fixedSaveButton: {
        backgroundColor: '#0B5FA5',
        marginHorizontal: 16,
        marginVertical: 40,
        paddingVertical: 12,
        borderRadius: 6,
        alignItems: 'center',
        shadowColor: '#0B5FA5',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default Preferences;
