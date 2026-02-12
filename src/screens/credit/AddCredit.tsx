import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Image,
    Platform,
    Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { fileIcon, downArrowIcon, userIcon } from '../../assets/icons';

// ============================================================================
// CONSTANTS
// ============================================================================

const DUE_DATE_OPTIONS = [
    'À date d\'émission',
    '1 semaine',
    '2 semaines',
    'Fin du mois',
    '30 jours',
    '30 jours fin de mois',
    '45 jours',
    '60 jours',
    '60 jours fin de mois',
    '90 jours',
    '90 jours fin de mois',
    '120 jours',
    '120 jours fin de mois',
];

const CURRENCY_OPTIONS = [
    'Dirham marocain',
    'Euro',
    'Dollar',
];

const PAYMENT_MODE_OPTIONS = [
    'Chèque',
    'Espèces',
    'Carte bancaire',
    'Virement bancaire',
];

const SOCIAL_REASON_OPTIONS = [
    'SARL',
    'SA',
    'SAS',
    'Auto-entrepreneur',
];

const DEVISE_OPTIONS = [
    'Afghani',
    'Lek',
    'Dinar algérien',
    'Kwanza',
    'Peso argentin',
    'Dram arménien',
    'Florin d\'Aruba',
    'Dollar australien',
    'Manat azerbaïdjanais',
    'Dollar des Bahamas',
    'Dinar bahreïni',
    'Taka',
    'Dollar de la Barbade',
    'Rouble du Bélarus',
    'Dollar de Belize',
    'Dirham marocain',
    'Euro',
    'Dollar',
];

const COUNTRY_OPTIONS = [
    'Afghanistan',
    'Îles Åland',
    'Albanie',
    'Algérie',
    'Samoa américaines',
    'Andorre',
    'Angola',
    'Anguilla',
    'Antarctique',
    'Antigua-et-Barbuda',
    'Argentine',
    'Arménie',
    'Aruba',
    'Australie',
    'Autriche',
    'Maroc',
    'France',
];


// Mock client data - should come from API/state management
const CLIENT_DATA_OPTIONS = [
    'a barb',
    'Client 2',
    'Client 3',
];

// ============================================================================
// TYPES
// ============================================================================

interface AddCreditProps {
    navigation: any; // Replace with proper navigation type
}

type AddressType = 'billing' | 'delivery';
type DeviseModalSource = 'main' | 'client';

// ============================================================================
// COMPONENT
// ============================================================================

const AddCredit: React.FC<AddCreditProps> = ({ navigation }) => {
    const insets = useSafeAreaInsets();

    // ========================================================================
    // STATE - Main Form
    // ========================================================================
    const [issueDate, setIssueDate] = useState(new Date(2026, 0, 29));
    const [deliveryDate, setDeliveryDate] = useState(new Date(2026, 0, 29));
    const [dueDate, setDueDate] = useState('À date d\'émission');
    const [client, setClient] = useState('');
    const [currency, setCurrency] = useState('Dirham marocain');
    const [paymentMode, setPaymentMode] = useState('');
    const [model, setModel] = useState('Modèle Auto-entrepreneur');
    const [paymentTerms, setPaymentTerms] = useState('');
    const [notes, setNotes] = useState('');

    // ========================================================================
    // STATE - Date Pickers
    // ========================================================================
    const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
    const [tempIssueDate, setTempIssueDate] = useState(new Date(2026, 0, 29));

    // ========================================================================
    // STATE - Main Modals
    // ========================================================================
    const [showDueDateModal, setShowDueDateModal] = useState(false);
    const [showClientModal, setShowClientModal] = useState(false);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    const [showPaymentModeModal, setShowPaymentModeModal] = useState(false);

    // ========================================================================
    // STATE - Search Queries
    // ========================================================================
    const [dueDateSearchQuery, setDueDateSearchQuery] = useState('');
    const [clientSearchQuery, setClientSearchQuery] = useState('');
    const [currencySearchQuery, setCurrencySearchQuery] = useState('');
    const [paymentModeSearchQuery, setPaymentModeSearchQuery] = useState('');

    // ========================================================================
    // STATE - Client Form
    // ========================================================================
    const [showAddClientModal, setShowAddClientModal] = useState(false);
    const [isProfessional, setIsProfessional] = useState(true);
    const [socialReason, setSocialReason] = useState('');
    const [clientNom, setClientNom] = useState('');
    const [clientPrenom, setClientPrenom] = useState('');
    const [rc, setRc] = useState('');
    const [ice, setIce] = useState('');
    const [clientCurrency, setClientCurrency] = useState('Dirham marocain');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [fax, setFax] = useState('');
    const [website, setWebsite] = useState('');
    const [clientNotes, setClientNotes] = useState('');
    const [billingAddress, setBillingAddress] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');

    // ========================================================================
    // STATE - Client Related Modals
    // ========================================================================
    const [showSocialReasonModal, setShowSocialReasonModal] = useState(false);
    const [socialReasonSearchQuery, setSocialReasonSearchQuery] = useState('');
    const [showClientCurrencyModal, setShowClientCurrencyModal] = useState(false);
    const [clientCurrencySearchQuery, setClientCurrencySearchQuery] = useState('');
    const [showBillingAddressModal, setShowBillingAddressModal] = useState(false);
    const [showDeliveryAddressModal, setShowDeliveryAddressModal] = useState(false);

    // ========================================================================
    // STATE - Address Fields
    // ========================================================================
    const [billingAddressStreet, setBillingAddressStreet] = useState('');
    const [billingPostalCode, setBillingPostalCode] = useState('');
    const [billingCity, setBillingCity] = useState('');
    const [billingCountry, setBillingCountry] = useState('');
    const [deliveryAddressStreet, setDeliveryAddressStreet] = useState('');
    const [deliveryPostalCode, setDeliveryPostalCode] = useState('');
    const [deliveryCity, setDeliveryCity] = useState('');
    const [deliveryCountry, setDeliveryCountry] = useState('');
    const [addressType, setAddressType] = useState<AddressType>('billing');
    const [showCountryModal, setShowCountryModal] = useState(false);

    // ========================================================================
    // STATE - Contact Form
    // ========================================================================
    const [showAddContactModal, setShowAddContactModal] = useState(false);
    const [contactNom, setContactNom] = useState('');
    const [contactPrenom, setContactPrenom] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [isPrimaryContact, setIsPrimaryContact] = useState(true);

    // ========================================================================
    // STATE - Devise Form
    // ========================================================================
    const [showAddDeviseModal, setShowAddDeviseModal] = useState(false);
    const [deviseName, setDeviseName] = useState('');
    const [defaultRate, setDefaultRate] = useState('');
    const [deviseType, setDeviseType] = useState('Gauche');
    const [deviseSymbol, setDeviseSymbol] = useState('');
    const [showDeviseTypeModal, setShowDeviseTypeModal] = useState(false);
    const [showDeviseSelectionModal, setShowDeviseSelectionModal] = useState(false);
    const [deviseSearchQuery, setDeviseSearchQuery] = useState('');
    const [deviseModalSource, setDeviseModalSource] = useState<DeviseModalSource>('main');

    // ========================================================================
    // REFS
    // ========================================================================
    const paymentTermsEditor = useRef<RichEditor>(null);
    const notesEditor = useRef<RichEditor>(null);

    // ========================================================================
    // FILTERED OPTIONS
    // ========================================================================
    const filteredDueDateOptions = DUE_DATE_OPTIONS.filter(option =>
        option.toLowerCase().includes(dueDateSearchQuery.toLowerCase())
    );

    const filteredClientDataOptions = CLIENT_DATA_OPTIONS.filter(option =>
        option.toLowerCase().includes(clientSearchQuery.toLowerCase())
    );

    const filteredCurrencyOptions = CURRENCY_OPTIONS.filter(option =>
        option.toLowerCase().includes(currencySearchQuery.toLowerCase())
    );

    const filteredPaymentModeOptions = PAYMENT_MODE_OPTIONS.filter(option =>
        option.toLowerCase().includes(paymentModeSearchQuery.toLowerCase())
    );

    const filteredSocialReasonOptions = SOCIAL_REASON_OPTIONS.filter(option =>
        option.toLowerCase().includes(socialReasonSearchQuery.toLowerCase())
    );

    const filteredClientCurrencyOptions = CURRENCY_OPTIONS.filter(option =>
        option.toLowerCase().includes(clientCurrencySearchQuery.toLowerCase())
    );

    const filteredDeviseOptions = DEVISE_OPTIONS.filter(option =>
        option.toLowerCase().includes(deviseSearchQuery.toLowerCase())
    );

    // ========================================================================
    // UTILITY FUNCTIONS
    // ========================================================================
    const formatDate = (date: Date): string => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const resetClientForm = () => {
        setSocialReason('');
        setClientNom('');
        setClientPrenom('');
        setRc('');
        setIce('');
        setEmail('');
        setPhone('');
        setFax('');
        setWebsite('');
        setClientNotes('');
        setBillingAddress('');
        setDeliveryAddress('');
    };

    const resetContactForm = () => {
        setContactNom('');
        setContactPrenom('');
        setContactEmail('');
        setContactPhone('');
        setIsPrimaryContact(true);
    };

    // ========================================================================
    // HANDLERS - Selection
    // ========================================================================
    const handleDueDateSelect = (option: string) => {
        setDueDate(option);
        setShowDueDateModal(false);
        setDueDateSearchQuery('');
    };

    const handleClientSelect = (option: string) => {
        setClient(option);
        setShowClientModal(false);
        setClientSearchQuery('');
    };

    const handleCurrencySelect = (option: string) => {
        setCurrency(option);
        setShowCurrencyModal(false);
        setCurrencySearchQuery('');
    };

    const handlePaymentModeSelect = (option: string) => {
        setPaymentMode(option);
        setShowPaymentModeModal(false);
        setPaymentModeSearchQuery('');
    };

    const handleSocialReasonSelect = (option: string) => {
        setSocialReason(option);
        setShowSocialReasonModal(false);
        setSocialReasonSearchQuery('');
        setTimeout(() => setShowAddClientModal(true), 300);
    };

    const handleClientCurrencySelect = (option: string) => {
        setClientCurrency(option);
        setShowClientCurrencyModal(false);
        setClientCurrencySearchQuery('');
        setTimeout(() => setShowAddClientModal(true), 300);
    };

    const handleDeviseSelect = (option: string) => {
        setDeviseName(option);
        setShowDeviseSelectionModal(false);
        setDeviseSearchQuery('');
        setTimeout(() => setShowAddDeviseModal(true), 300);
    };

    // ========================================================================
    // HANDLERS - Forms
    // ========================================================================
    const handleSave = () => {
        // TODO: Add validation
        console.log('Save delivery note');
        console.log('Payment Terms:', paymentTerms);
        console.log('Notes:', notes);
        navigation.goBack();
    };

    const handleAddClient = () => {
        // Validate required fields
        if (isProfessional) {
            if (!socialReason.trim()) {
                // TODO: Show validation error
                console.warn('Social reason is required');
                return;
            }
        } else {
            if (!clientNom.trim() || !clientPrenom.trim()) {
                // TODO: Show validation error
                console.warn('Name and surname are required');
                return;
            }
        }

        // Create client object
        const newClient = {
            professional: isProfessional,
            ...(isProfessional
                ? { socialReason, rc, ice }
                : { nom: clientNom, prenom: clientPrenom }
            ),
            currency: clientCurrency,
            email,
            phone,
            fax,
            website,
            clientNotes,
            billingAddress,
            deliveryAddress,
        };

        console.log('New client:', newClient);

        // Add to client list and select it
        const clientName = isProfessional ? socialReason : `${clientNom} ${clientPrenom}`;
        setClient(clientName);

        // Reset form and close modals
        resetClientForm();
        setShowAddClientModal(false);
        setTimeout(() => setShowClientModal(true), 300);
    };

    const handleAddContact = () => {
        // Validate required fields
        if (!contactNom.trim() || !contactPrenom.trim() || !contactEmail.trim()) {
            // TODO: Show validation error
            console.warn('Name, surname and email are required');
            return;
        }

        const newContact = {
            nom: contactNom,
            prenom: contactPrenom,
            email: contactEmail,
            phone: contactPhone,
            isPrimary: isPrimaryContact,
        };

        console.log('New contact:', newContact);

        // Reset form and close modal
        resetContactForm();
        setShowAddContactModal(false);
        setTimeout(() => setShowAddClientModal(true), 300);
    };

    // ========================================================================
    // RENDER - Main Form
    // ========================================================================
    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ajouter avoir</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Date d'émission */}
                <View style={styles.section}>
                    <Text style={styles.label}>
                        Date d'émission <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={styles.inputWithIcon}
                        onPress={() => {
                            setTempIssueDate(issueDate);
                            setShowIssueDatePicker(true);
                        }}
                    >
                        <Image source={fileIcon} style={styles.calendarIcon} resizeMode="contain" />
                        <Text style={styles.dateText}>{formatDate(issueDate)}</Text>
                    </TouchableOpacity>
                </View>

                {/* Échéance */}
                <View style={styles.section}>
                    <Text style={styles.label}>
                        Échéance <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={styles.inputWithIcon}
                        onPress={() => setShowDueDateModal(true)}
                    >
                        <Text style={styles.dateText}>{dueDate}</Text>
                        <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
                    </TouchableOpacity>
                </View>

                {/* Client */}
                <View style={styles.section}>
                    <Text style={styles.label}>
                        Client <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={styles.inputWithIcon}
                        onPress={() => setShowClientModal(true)}
                    >
                        <Image source={userIcon} style={styles.userIcon} resizeMode="contain" />
                        <Text style={[styles.dateText, !client && styles.placeholderText]}>
                            {client || 'Sélectionner un client'}
                        </Text>
                        <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
                    </TouchableOpacity>
                </View>

                {/* Devise */}
                <View style={styles.section}>
                    <Text style={styles.label}>
                        Devise <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={styles.inputWithIcon}
                        onPress={() => setShowCurrencyModal(true)}
                    >
                        <Text style={styles.dateText}>{currency}</Text>
                        <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
                    </TouchableOpacity>
                </View>

                {/* Mode de paiement */}
                <View style={styles.section}>
                    <Text style={styles.label}>Mode de paiement</Text>
                    <TouchableOpacity
                        style={styles.inputWithIcon}
                        onPress={() => setShowPaymentModeModal(true)}
                    >
                        <Text style={[styles.dateText, !paymentMode && styles.placeholderText]}>
                            {paymentMode || 'Sélectionner un mode de paiement'}
                        </Text>
                        <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
                    </TouchableOpacity>
                </View>

                {/* Modèle */}
                <View style={styles.section}>
                    <Text style={styles.label}>
                        Modèle <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity style={styles.inputWithIcon}>
                        <Image source={fileIcon} style={styles.fileIconLeft} resizeMode="contain" />
                        <Text style={styles.dateText}>{model}</Text>
                    </TouchableOpacity>
                </View>

                {/* Articles */}
                <View style={styles.section}>
                    <Text style={styles.label}>
                        Articles <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={styles.addArticleButton}
                        onPress={() => navigation.navigate('Add Article', {
                            onArticleAdded: (articleData: any) => {
                                console.log('Article added:', articleData);
                            }
                        })}
                    >
                        <Image source={fileIcon} style={styles.cartIcon} resizeMode="contain" />
                        <Text style={styles.addArticleText}>Ajouter un article</Text>
                        <Text style={styles.arrowIcon}>→</Text>
                    </TouchableOpacity>
                </View>

                {/* Conditions de règlement */}
                <View style={styles.section}>
                    <Text style={styles.label}>Conditions de règlement</Text>
                    <View style={styles.richTextContainer}>
                        <RichToolbar
                            editor={paymentTermsEditor}
                            actions={[
                                actions.setBold,
                                actions.setItalic,
                                actions.setUnderline,
                                actions.insertBulletsList,
                                actions.insertOrderedList,
                                actions.blockquote,
                                actions.alignLeft,
                                actions.alignCenter,
                                actions.alignRight,
                            ]}
                            iconMap={{
                                [actions.setBold]: () => <Text style={styles.toolbarText}>B</Text>,
                                [actions.setItalic]: () => <Text style={styles.toolbarTextItalic}>I</Text>,
                                [actions.setUnderline]: () => <Text style={styles.toolbarTextUnderline}>U</Text>,
                                [actions.insertBulletsList]: () => <Text style={styles.toolbarText}>•</Text>,
                                [actions.insertOrderedList]: () => <Text style={styles.toolbarText}>1.</Text>,
                                [actions.blockquote]: () => <Text style={styles.toolbarText}>""</Text>,
                                [actions.alignLeft]: () => <Text style={styles.toolbarText}>≡</Text>,
                                [actions.alignCenter]: () => <Text style={styles.toolbarText}>≡</Text>,
                                [actions.alignRight]: () => <Text style={styles.toolbarText}>≡</Text>,
                            }}
                            style={styles.toolbar}
                        />
                        <RichEditor
                            ref={paymentTermsEditor}
                            style={styles.richTextInput}
                            initialContentHTML=""
                            placeholder="Écrivez ici..."
                            onChange={(text: string) => setPaymentTerms(text)}
                            editorStyle={{
                                backgroundColor: '#FFFFFF',
                                color: '#333333',
                                placeholderColor: '#999999',
                                contentCSSText: 'font-size: 16px; min-height: 80px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 12px 20px;',
                            }}
                        />
                    </View>
                </View>

                {/* Notes */}
                <View style={styles.section}>
                    <Text style={styles.label}>Notes</Text>
                    <View style={styles.richTextContainer}>
                        <RichToolbar
                            editor={notesEditor}
                            actions={[
                                actions.setBold,
                                actions.setItalic,
                                actions.setUnderline,
                                actions.insertBulletsList,
                                actions.insertOrderedList,
                                actions.blockquote,
                                actions.alignLeft,
                                actions.alignCenter,
                                actions.alignRight,
                            ]}
                            iconMap={{
                                [actions.setBold]: () => <Text style={styles.toolbarText}>B</Text>,
                                [actions.setItalic]: () => <Text style={styles.toolbarTextItalic}>I</Text>,
                                [actions.setUnderline]: () => <Text style={styles.toolbarTextUnderline}>U</Text>,
                                [actions.insertBulletsList]: () => <Text style={styles.toolbarText}>•</Text>,
                                [actions.insertOrderedList]: () => <Text style={styles.toolbarText}>1.</Text>,
                                [actions.blockquote]: () => <Text style={styles.toolbarText}>""</Text>,
                                [actions.alignLeft]: () => <Text style={styles.toolbarText}>≡</Text>,
                                [actions.alignCenter]: () => <Text style={styles.toolbarText}>≡</Text>,
                                [actions.alignRight]: () => <Text style={styles.toolbarText}>≡</Text>,
                            }}
                            style={styles.toolbar}
                        />
                        <RichEditor
                            ref={notesEditor}
                            style={styles.richTextInput}
                            initialContentHTML=""
                            placeholder="Écrivez ici..."
                            onChange={(text: string) => setNotes(text)}
                            editorStyle={{
                                backgroundColor: '#FFFFFF',
                                color: '#333333',
                                placeholderColor: '#999999',
                                contentCSSText: 'font-size: 16px; min-height: 80px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 12px 20px;',
                            }}
                        />
                    </View>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Fixed Save Button */}
            <View style={styles.fixedButtonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Enregistrer</Text>
                </TouchableOpacity>
            </View>

            {/* Due Date Modal */}
            <Modal
                visible={showDueDateModal}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setShowDueDateModal(false)}
            >
                <View style={[styles.modalOverlayFullscreen, { paddingTop: insets.top }]}>
                    <View style={styles.modalContentFullscreen}>
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowDueDateModal(false);
                                    setDueDateSearchQuery('');
                                }}
                                style={styles.modalBackButton}
                            >
                                <Text style={styles.modalBackArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitleFullscreen}>Sélectionner une échéance</Text>
                        </View>

                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Chercher"
                                placeholderTextColor="#AAAAAA"
                                value={dueDateSearchQuery}
                                onChangeText={setDueDateSearchQuery}
                            />
                            {dueDateSearchQuery.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => setDueDateSearchQuery('')}
                                    style={styles.clearButton}
                                >
                                    <Text style={styles.clearButtonText}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                            {filteredDueDateOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.optionItem}
                                    onPress={() => handleDueDateSelect(option)}
                                >
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Client Modal */}
            <Modal
                visible={showClientModal}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setShowClientModal(false)}
            >
                {/* <SafeAreaView style={styles.modalOverlayFullscreen} edges={['top']}> */}
                <View
                    style={[
                        styles.modalOverlayFullscreen,
                        { paddingTop: insets.top }
                    ]}
                >

                    <View style={styles.modalContentFullscreen}>
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowClientModal(false);
                                    setClientSearchQuery('');
                                }}
                                style={styles.modalBackButton}
                            >
                                <Text style={styles.modalBackArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitleFullscreen}>Sélectionner un client</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowClientModal(false);
                                    setTimeout(() => {
                                        setShowAddClientModal(true);
                                    }, 300);
                                }}
                                style={styles.addButton}
                            >
                                <Text style={styles.addButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Chercher"
                                placeholderTextColor="#AAAAAA"
                                value={clientSearchQuery}
                                onChangeText={setClientSearchQuery}
                            />
                            {clientSearchQuery.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => setClientSearchQuery('')}
                                    style={styles.clearButton}
                                >
                                    <Text style={styles.clearButtonText}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                            {filteredClientDataOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.optionItem}
                                    onPress={() => handleClientSelect(option)}
                                >
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
                {/* </SafeAreaView> */}
            </Modal>

            {/* Currency Modal */}
            <Modal
                visible={showCurrencyModal}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setShowCurrencyModal(false)}
            >
                {/* <SafeAreaView style={styles.modalOverlayFullscreen} edges={['top']}> */}
                <View
                    style={[
                        styles.modalOverlayFullscreen,
                        { paddingTop: insets.top }
                    ]}
                >

                    <View style={styles.modalContentFullscreen}>
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowCurrencyModal(false);
                                    setCurrencySearchQuery('');
                                }}
                                style={styles.modalBackButton}
                            >
                                <Text style={styles.modalBackArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitleFullscreen}>Sélectionner une devise</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowCurrencyModal(false);
                                    setDeviseModalSource('main');
                                    setTimeout(() => {
                                        setShowDeviseSelectionModal(true);
                                    }, 300);
                                }}
                                style={styles.addButton}
                            >
                                <Text style={styles.addButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Chercher"
                                placeholderTextColor="#AAAAAA"
                                value={currencySearchQuery}
                                onChangeText={setCurrencySearchQuery}
                            />
                            {currencySearchQuery.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => setCurrencySearchQuery('')}
                                    style={styles.clearButton}
                                >
                                    <Text style={styles.clearButtonText}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                            {filteredCurrencyOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.optionItem}
                                    onPress={() => handleCurrencySelect(option)}
                                >
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
                {/* </SafeAreaView> */}
            </Modal>

            {/* Payment Mode Modal */}
            <Modal
                visible={showPaymentModeModal}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setShowPaymentModeModal(false)}
            >
                <View style={[styles.modalOverlayFullscreen, { paddingTop: insets.top }]}>
                    <View style={styles.modalContentFullscreen}>
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowPaymentModeModal(false);
                                    setPaymentModeSearchQuery('');
                                }}
                                style={styles.modalBackButton}
                            >
                                <Text style={styles.modalBackArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitleFullscreen}>Sélectionner un mode de paiement</Text>
                        </View>

                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Chercher"
                                placeholderTextColor="#AAAAAA"
                                value={paymentModeSearchQuery}
                                onChangeText={setPaymentModeSearchQuery}
                            />
                            {paymentModeSearchQuery.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => setPaymentModeSearchQuery('')}
                                    style={styles.clearButton}
                                >
                                    <Text style={styles.clearButtonText}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                            {filteredPaymentModeOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.optionItem}
                                    onPress={() => handlePaymentModeSelect(option)}
                                >
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Add Client Modal */}
            <Modal
                visible={showAddClientModal}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setShowAddClientModal(false)}
            >
                <View
                    style={[
                        styles.modalOverlayFullscreen,
                        { paddingTop: insets.top }
                    ]}
                >

                    {/* <SafeAreaView style={styles.modalOverlayFullscreen} edges={['top']}> */}
                    <View style={styles.modalContentFullscreen}>
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => {
                                    resetClientForm();
                                    setShowAddClientModal(false);
                                    setTimeout(() => {
                                        setShowClientModal(true);
                                    }, 300);
                                }}
                                style={styles.modalBackButton}
                            >
                                <Text style={styles.modalBackArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitleFullscreen}>Ajouter client</Text>
                            <View style={styles.placeholder} />
                        </View>

                        <ScrollView
                            style={styles.formContainer}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Professional Toggle */}
                            <View style={styles.toggleSection}>
                                <Text style={styles.toggleLabel}>Professionnel</Text>
                                <TouchableOpacity
                                    style={[styles.toggle, isProfessional && styles.toggleActive]}
                                    onPress={() => setIsProfessional(!isProfessional)}
                                >
                                    <View
                                        style={[styles.toggleThumb, isProfessional && styles.toggleThumbActive]}
                                    />
                                </TouchableOpacity>
                            </View>

                            {isProfessional ? (
                                <>
                                    {/* Raison sociale */}
                                    <View style={styles.formSection}>
                                        <Text style={styles.label}>
                                            Raison sociale <Text style={styles.required}>*</Text>
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.inputWithIconRight}
                                            onPress={() => {
                                                setShowAddClientModal(false);
                                                setTimeout(() => {
                                                    setShowSocialReasonModal(true);
                                                }, 300);
                                            }}
                                        >
                                            <Text
                                                style={[styles.dateText, !socialReason && styles.placeholderText]}
                                            >
                                                {socialReason || 'Raison sociale'}
                                            </Text>
                                            <Text style={styles.arrowIcon}>→</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* R.C */}
                                    <View style={styles.formSection}>
                                        <Text style={styles.label}>R.C</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={rc}
                                            onChangeText={setRc}
                                            placeholder=""
                                            placeholderTextColor="#AAAAAA"
                                        />
                                    </View>

                                    {/* I.C.E */}
                                    <View style={styles.formSection}>
                                        <Text style={styles.label}>I.C.E</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={ice}
                                            onChangeText={setIce}
                                            placeholder=""
                                            placeholderTextColor="#AAAAAA"
                                        />
                                    </View>
                                </>
                            ) : (
                                <>
                                    {/* Nom */}
                                    <View style={styles.formSection}>
                                        <Text style={styles.label}>
                                            Nom <Text style={styles.required}>*</Text>
                                        </Text>
                                        <TextInput
                                            style={styles.input}
                                            value={clientNom}
                                            onChangeText={setClientNom}
                                            placeholder=""
                                            placeholderTextColor="#AAAAAA"
                                        />
                                    </View>

                                    {/* Prénom */}
                                    <View style={styles.formSection}>
                                        <Text style={styles.label}>
                                            Prénom <Text style={styles.required}>*</Text>
                                        </Text>
                                        <TextInput
                                            style={styles.input}
                                            value={clientPrenom}
                                            onChangeText={setClientPrenom}
                                            placeholder=""
                                            placeholderTextColor="#AAAAAA"
                                        />
                                    </View>
                                </>
                            )}

                            {/* Devise */}
                            <View style={styles.formSection}>
                                <Text style={styles.label}>
                                    Devise <Text style={styles.required}>*</Text>
                                </Text>
                                <TouchableOpacity
                                    style={styles.inputWithIcon}
                                    onPress={() => {
                                        setShowAddClientModal(false);
                                        setTimeout(() => {
                                            setShowClientCurrencyModal(true);
                                        }, 300);
                                    }}
                                >
                                    <Text style={styles.dateText}>{clientCurrency}</Text>
                                    <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
                                </TouchableOpacity>
                            </View>

                            {/* E-mail */}
                            <View style={styles.formSection}>
                                <Text style={styles.label}>E-mail</Text>
                                <View style={styles.inputWithIconLeft}>
                                    <Text style={styles.emailIcon}>@</Text>
                                    <TextInput
                                        style={styles.inputWithIconLeftText}
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder=""
                                        placeholderTextColor="#AAAAAA"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>

                            {/* Téléphone */}
                            <View style={styles.formSection}>
                                <Text style={styles.label}>Téléphone</Text>
                                <View style={styles.inputWithIconLeft}>
                                    <Image source={fileIcon} style={styles.phoneIcon} resizeMode="contain" />
                                    <TextInput
                                        style={styles.inputWithIconLeftText}
                                        value={phone}
                                        onChangeText={setPhone}
                                        placeholder=""
                                        placeholderTextColor="#AAAAAA"
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            </View>

                            {/* Fax */}
                            <View style={styles.formSection}>
                                <Text style={styles.label}>Fax</Text>
                                <View style={styles.inputWithIconLeft}>
                                    <Image source={fileIcon} style={styles.faxIcon} resizeMode="contain" />
                                    <TextInput
                                        style={styles.inputWithIconLeftText}
                                        value={fax}
                                        onChangeText={setFax}
                                        placeholder=""
                                        placeholderTextColor="#AAAAAA"
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            </View>

                            {/* Site Web */}
                            <View style={styles.formSection}>
                                <Text style={styles.label}>Site Web</Text>
                                <View style={styles.inputWithIconLeft}>
                                    <Image source={fileIcon} style={styles.websiteIcon} resizeMode="contain" />
                                    <TextInput
                                        style={styles.inputWithIconLeftText}
                                        value={website}
                                        onChangeText={setWebsite}
                                        placeholder=""
                                        placeholderTextColor="#AAAAAA"
                                        keyboardType="url"
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>

                            {/* Notes */}
                            <View style={styles.formSection}>
                                <Text style={styles.label}>Notes</Text>
                                <TextInput
                                    style={styles.notesInput}
                                    value={clientNotes}
                                    onChangeText={setClientNotes}
                                    placeholder=""
                                    placeholderTextColor="#AAAAAA"
                                    multiline
                                    numberOfLines={6}
                                    textAlignVertical="top"
                                />
                            </View>

                            {/* Adresse de facturation */}
                            <View style={styles.formSection}>
                                <TouchableOpacity
                                    style={styles.addressButton}
                                    onPress={() => {
                                        setShowAddClientModal(false);
                                        setTimeout(() => {
                                            setShowBillingAddressModal(true);
                                        }, 300);
                                    }}
                                >
                                    <Image source={fileIcon} style={styles.addressIcon} resizeMode="contain" />
                                    <Text style={styles.addressButtonText}>Adresse de facturation</Text>
                                    <Text style={styles.arrowIcon}>→</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Adresse de livraison */}
                            <View style={styles.formSection}>
                                <TouchableOpacity
                                    style={styles.addressButton}
                                    onPress={() => {
                                        setShowAddClientModal(false);
                                        setTimeout(() => {
                                            setShowDeliveryAddressModal(true);
                                        }, 300);
                                    }}
                                >
                                    <Image source={fileIcon} style={styles.addressIcon} resizeMode="contain" />
                                    <Text style={styles.addressButtonText}>Adresse de livraison</Text>
                                    <Text style={styles.arrowIcon}>→</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Contacts Section */}
                            <View style={styles.contactsSection}>
                                <Text style={styles.contactsHeader}>Contacts</Text>
                                <TouchableOpacity
                                    style={styles.addContactButton}
                                    onPress={() => {
                                        setShowAddClientModal(false);
                                        setTimeout(() => {
                                            setShowAddContactModal(true);
                                        }, 300);
                                    }}
                                >
                                    <Image source={userIcon} style={styles.contactIcon} resizeMode="contain" />
                                    <Text style={styles.addContactButtonText}>Ajouter contact</Text>
                                    <Text style={styles.arrowIcon}>›</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.bottomSpacer} />
                        </ScrollView>

                        {/* Fixed Save Button */}
                        <View style={styles.fixedButtonContainer}>
                            <TouchableOpacity style={styles.saveButton} onPress={handleAddClient}>
                                <Text style={styles.saveButtonText}>Enregistrer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                {/* </SafeAreaView> */}
            </Modal>

            {/* Social Reason Modal */}
            <Modal
                visible={showSocialReasonModal}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setShowSocialReasonModal(false)}
            >
                <View
                    style={[
                        styles.modalOverlayFullscreen,
                        { paddingTop: insets.top }
                    ]}
                >

                    {/* <SafeAreaView style={styles.modalOverlayFullscreen} edges={['top']}> */}
                    <View style={styles.modalContentFullscreen}>
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowSocialReasonModal(false);
                                    setSocialReasonSearchQuery('');
                                    setTimeout(() => {
                                        setShowAddClientModal(true);
                                    }, 300);
                                }}
                                style={styles.modalBackButton}
                            >
                                <Text style={styles.modalBackArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitleFullscreen}>Raison sociale</Text>
                            <View style={styles.placeholder} />
                        </View>

                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Chercher..."
                                placeholderTextColor="#AAAAAA"
                                value={socialReasonSearchQuery}
                                onChangeText={setSocialReasonSearchQuery}
                            />
                            {socialReasonSearchQuery.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => setSocialReasonSearchQuery('')}
                                    style={styles.clearButton}
                                >
                                    <Text style={styles.clearButtonText}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                            {filteredSocialReasonOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.optionItem}
                                    onPress={() => handleSocialReasonSelect(option)}
                                >
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
                {/* </SafeAreaView> */}
            </Modal>


            {/* Client Currency Modal */}
            <Modal
                visible={showClientCurrencyModal}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setShowClientCurrencyModal(false)}
            >
                <View
                    style={[
                        styles.modalOverlayFullscreen,
                        { paddingTop: insets.top }
                    ]}
                >

                    {/* <SafeAreaView style={styles.modalOverlayFullscreen} edges={['top']}> */}
                    <View style={styles.modalContentFullscreen}>
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowClientCurrencyModal(false);
                                    setClientCurrencySearchQuery('');
                                    setTimeout(() => {
                                        setShowAddClientModal(true);
                                    }, 300);
                                }}
                                style={styles.modalBackButton}
                            >
                                <Text style={styles.modalBackArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitleFullscreen}>Devise</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowClientCurrencyModal(false);
                                    setDeviseModalSource('client');
                                    setTimeout(() => {
                                        setShowDeviseSelectionModal(true);
                                    }, 300);
                                }}
                                style={styles.addButton}
                            >
                                <Text style={styles.addButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Chercher"
                                placeholderTextColor="#AAAAAA"
                                value={clientCurrencySearchQuery}
                                onChangeText={setClientCurrencySearchQuery}
                            />
                            {clientCurrencySearchQuery.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => setClientCurrencySearchQuery('')}
                                    style={styles.clearButton}
                                >
                                    <Text style={styles.clearButtonText}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                            {filteredClientCurrencyOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.optionItem}
                                    onPress={() => handleClientCurrencySelect(option)}
                                >
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
                {/* </SafeAreaView> */}
            </Modal>


            {/* Add Devise Modal */}
            <Modal
                visible={showAddDeviseModal}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setShowAddDeviseModal(false)}
            >
                <View
                    style={[
                        styles.modalOverlayFullscreen,
                        { paddingTop: insets.top }
                    ]}
                >

                    {/* <SafeAreaView style={styles.modalOverlayFullscreen} edges={['top']}> */}
                    <View style={styles.modalContentFullscreen}>
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowAddDeviseModal(false);
                                    setDeviseName('');
                                    setDefaultRate('');
                                    setDeviseType('Gauche');
                                    setDeviseSymbol('');
                                    setTimeout(() => {
                                        if (deviseModalSource === 'client') {
                                            setShowClientCurrencyModal(true);
                                        } else {
                                            setShowCurrencyModal(true);
                                        }
                                    }, 300);
                                }}
                                style={styles.modalBackButton}
                            >
                                <Text style={styles.modalBackArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitleFullscreen}>Ajouter Devise</Text>
                            <View style={styles.placeholder} />
                        </View>

                        <ScrollView
                            style={styles.formContainer}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Devise */}
                            <View style={styles.formSection}>
                                <Text style={styles.label}>
                                    Devise <Text style={styles.required}>*</Text>
                                </Text>
                                <TouchableOpacity
                                    style={styles.inputWithIcon}
                                    onPress={() => {
                                        setShowAddDeviseModal(false);
                                        setTimeout(() => {
                                            setShowDeviseSelectionModal(true);
                                        }, 300);
                                    }}
                                >
                                    <Text style={[styles.dateText, !deviseName && styles.placeholderText]}>
                                        {deviseName || 'Sélectionner devise'}
                                    </Text>
                                    <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
                                </TouchableOpacity>
                            </View>

                            {/* Taux par défaut */}
                            <View style={styles.formSection}>
                                <Text style={styles.label}>
                                    Taux par défaut <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputWithPercentage}>
                                    <TextInput
                                        style={styles.inputPercentage}
                                        value={defaultRate}
                                        onChangeText={setDefaultRate}
                                        placeholder=""
                                        placeholderTextColor="#AAAAAA"
                                        keyboardType="decimal-pad"
                                    />
                                    <Text style={styles.percentageSymbol}>%</Text>
                                </View>
                            </View>

                            {/* Type */}
                            <View style={styles.formSection}>
                                <Text style={styles.label}>
                                    Type <Text style={styles.required}>*</Text>
                                </Text>
                                <Dropdown
                                    style={styles.dropdown}
                                    data={[
                                        { label: 'Gauche', value: 'Gauche' },
                                        { label: 'Droite', value: 'Droite' },
                                    ]}
                                    labelField="label"
                                    valueField="value"
                                    placeholder=""
                                    value={deviseType}
                                    onChange={(item) => setDeviseType(item.value)}
                                    selectedTextStyle={styles.dropdownText}
                                    placeholderStyle={styles.placeholderText}
                                />
                            </View>

                            {/* Symbole */}
                            <View style={styles.formSection}>
                                <Text style={styles.label}>
                                    Symbole <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    value={deviseSymbol}
                                    onChangeText={setDeviseSymbol}
                                    placeholder=""
                                    placeholderTextColor="#AAAAAA"
                                />
                            </View>

                            <View style={styles.bottomSpacer} />
                        </ScrollView>

                        {/* Fixed Save Button */}
                        <View style={styles.fixedButtonContainer}>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={() => {
                                    // Validate and save devise
                                    console.log('Save devise:', {
                                        deviseName,
                                        defaultRate,
                                        deviseType,
                                        deviseSymbol
                                    });
                                    setShowAddDeviseModal(false);
                                    setDeviseName('');
                                    setDefaultRate('');
                                    setDeviseType('Gauche');
                                    setDeviseSymbol('');
                                    setTimeout(() => {
                                        setShowClientCurrencyModal(true);
                                    }, 300);
                                }}
                            >
                                <Text style={styles.saveButtonText}>Enregistrer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                {/* </SafeAreaView> */}
            </Modal>

            {/* Devise Selection Modal */}
            <Modal
                visible={showDeviseSelectionModal}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setShowDeviseSelectionModal(false)}
            >
                <View
                    style={[
                        styles.modalOverlayFullscreen,
                        { paddingTop: insets.top }
                    ]}
                >

                    {/* <SafeAreaView style={styles.modalOverlayFullscreen} edges={['top']}> */}
                    <View style={styles.modalContentFullscreen}>
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowDeviseSelectionModal(false);
                                    setDeviseSearchQuery('');
                                    setTimeout(() => {
                                        if (deviseModalSource === 'client') {
                                            setShowClientCurrencyModal(true);
                                        } else {
                                            setShowCurrencyModal(true);
                                        }
                                    }, 300);
                                }}
                                style={styles.modalBackButton}
                            >
                                <Text style={styles.modalBackArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitleFullscreen}>Devise</Text>
                        </View>

                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Chercher"
                                placeholderTextColor="#AAAAAA"
                                value={deviseSearchQuery}
                                onChangeText={setDeviseSearchQuery}
                            />
                            {deviseSearchQuery.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => setDeviseSearchQuery('')}
                                    style={styles.clearButton}
                                >
                                    <Text style={styles.clearButtonText}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                            {filteredDeviseOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.optionItem}
                                    onPress={() => handleDeviseSelect(option)}
                                >
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
                {/* </SafeAreaView> */}
            </Modal>


            {/* Billing Address Modal */}
            <Modal
                visible={showBillingAddressModal}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setShowBillingAddressModal(false)}
            >
                <View
                    style={[
                        styles.modalOverlayFullscreen,
                        { paddingTop: insets.top }
                    ]}
                >
                    {/* <SafeAreaView style={styles.modalOverlayFullscreen} edges={['top']}> */}
                    <View style={styles.modalContentFullscreen}>
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowBillingAddressModal(false);
                                    setTimeout(() => {
                                        setShowAddClientModal(true);
                                    }, 300);
                                }}
                                style={styles.modalBackButton}
                            >
                                <Text style={styles.modalBackArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitleFullscreen}>Adresse de facturation</Text>
                            <View style={styles.placeholder} />
                        </View>

                        <ScrollView
                            style={styles.formContainer}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Adresse */}
                            <View style={styles.formSection}>
                                <Text style={styles.label}>
                                    Adresse <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.notesInput}
                                    value={billingAddressStreet}
                                    onChangeText={setBillingAddressStreet}
                                    placeholder=""
                                    placeholderTextColor="#AAAAAA"
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </View>

                            {/* Code postal */}
                            <View style={styles.formSection}>
                                <Text style={styles.label}>Code postal</Text>
                                <TextInput
                                    style={styles.input}
                                    value={billingPostalCode}
                                    onChangeText={setBillingPostalCode}
                                    placeholder=""
                                    placeholderTextColor="#AAAAAA"
                                />
                            </View>

                            {/* Ville */}
                            <View style={styles.formSection}>
                                <Text style={styles.label}>
                                    Ville <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    value={billingCity}
                                    onChangeText={setBillingCity}
                                    placeholder=""
                                    placeholderTextColor="#AAAAAA"
                                />
                            </View>

                            {/* Pays */}
                            <View style={styles.formSection}>
                                <Text style={styles.label}>Pays</Text>
                                <Dropdown
                                    style={styles.dropdown}
                                    data={COUNTRY_OPTIONS.map(country => ({ label: country, value: country }))}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Sélectionner un pays"
                                    value={billingCountry}
                                    onChange={(item) => setBillingCountry(item.value)}
                                    selectedTextStyle={styles.dropdownText}
                                    placeholderStyle={styles.placeholderText}
                                    onFocus={() => {
                                        setAddressType('billing');
                                        setShowBillingAddressModal(false);
                                        setTimeout(() => {
                                            setShowCountryModal(true);
                                        }, 300);
                                    }}
                                />
                            </View>

                            <View style={styles.bottomSpacer} />
                        </ScrollView>

                        <View style={styles.fixedButtonContainer}>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={() => {
                                    setShowBillingAddressModal(false);
                                    setTimeout(() => {
                                        setShowAddClientModal(true);
                                    }, 300);
                                }}
                            >
                                <Text style={styles.saveButtonText}>Terminé</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* </SafeAreaView> */}
                </View>
            </Modal>

            {/* Delivery Address Modal */}
            <Modal
                visible={showDeliveryAddressModal}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setShowDeliveryAddressModal(false)}
            >
                <View
                    style={[
                        styles.modalOverlayFullscreen,
                        { paddingTop: insets.top }
                    ]}
                >

                    {/* <SafeAreaView style={styles.modalOverlayFullscreen} edges={['top']}> */}
                    <View style={styles.modalContentFullscreen}>
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowDeliveryAddressModal(false);
                                    setTimeout(() => {
                                        setShowAddClientModal(true);
                                    }, 300);
                                }}
                                style={styles.modalBackButton}
                            >
                                <Text style={styles.modalBackArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitleFullscreen}>Adresse de livraison</Text>
                            <View style={styles.placeholder} />
                        </View>

                        <ScrollView
                            style={styles.formContainer}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Adresse */}
                            <View style={styles.formSection}>
                                <Text style={styles.label}>
                                    Adresse <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.notesInput}
                                    value={deliveryAddressStreet}
                                    onChangeText={setDeliveryAddressStreet}
                                    placeholder=""
                                    placeholderTextColor="#AAAAAA"
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </View>

                            {/* Code postal */}
                            <View style={styles.formSection}>
                                <Text style={styles.label}>Code postal</Text>
                                <TextInput
                                    style={styles.input}
                                    value={deliveryPostalCode}
                                    onChangeText={setDeliveryPostalCode}
                                    placeholder=""
                                    placeholderTextColor="#AAAAAA"
                                />
                            </View>

                            {/* Ville */}
                            <View style={styles.formSection}>
                                <Text style={styles.label}>
                                    Ville <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    value={deliveryCity}
                                    onChangeText={setDeliveryCity}
                                    placeholder=""
                                    placeholderTextColor="#AAAAAA"
                                />
                            </View>

                            {/* Pays */}
                            <View style={styles.formSection}>
                                <Text style={styles.label}>Pays</Text>
                                <Dropdown
                                    style={styles.dropdown}
                                    data={COUNTRY_OPTIONS.map(country => ({ label: country, value: country }))}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Sélectionner un pays"
                                    value={deliveryCountry}
                                    onChange={(item) => setDeliveryCountry(item.value)}
                                    selectedTextStyle={styles.dropdownText}
                                    placeholderStyle={styles.placeholderText}
                                    onFocus={() => {
                                        setAddressType('delivery');
                                        setShowDeliveryAddressModal(false);
                                        setTimeout(() => {
                                            setShowCountryModal(true);
                                        }, 300);
                                    }}
                                />
                            </View>

                            <View style={styles.bottomSpacer} />
                        </ScrollView>

                        <View style={styles.fixedButtonContainer}>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={() => {
                                    setShowDeliveryAddressModal(false);
                                    setTimeout(() => {
                                        setShowAddClientModal(true);
                                    }, 300);
                                }}
                            >
                                <Text style={styles.saveButtonText}>Terminé</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                {/* </SafeAreaView> */}
            </Modal>

            {/* Add Contact Modal */}
            <Modal
                visible={showAddContactModal}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setShowAddContactModal(false)}
            >
                <View
                    style={[
                        styles.modalOverlayFullscreen,
                        { paddingTop: insets.top }
                    ]}
                >

                    {/* <SafeAreaView style={styles.modalOverlayFullscreen} edges={['top']}> */}
                    {/* Modal Header */}
                    <View style={styles.modalHeaderFullscreen}>
                        <TouchableOpacity
                            style={styles.modalBackButton}
                            onPress={() => {
                                setShowAddContactModal(false);
                                setTimeout(() => {
                                    setShowAddClientModal(true);
                                }, 300);
                            }}
                        >
                            <Text style={styles.modalBackArrow}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitleFullscreen}>Ajouter contact</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView
                        style={styles.formContainer}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Nom */}
                        <View style={styles.formSection}>
                            <Text style={styles.label}>
                                Nom <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={contactNom}
                                onChangeText={setContactNom}
                                placeholder=""
                            />
                        </View>

                        {/* Prénom */}
                        <View style={styles.formSection}>
                            <Text style={styles.label}>
                                Prénom <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={contactPrenom}
                                onChangeText={setContactPrenom}
                                placeholder=""
                            />
                        </View>

                        {/* E-mail */}
                        <View style={styles.formSection}>
                            <Text style={styles.label}>
                                E-mail <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.inputWithIconLeft}>
                                <Text style={styles.emailIcon}>@</Text>
                                <TextInput
                                    style={styles.inputWithIconLeftText}
                                    value={contactEmail}
                                    onChangeText={setContactEmail}
                                    keyboardType="email-address"
                                    placeholder=""
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {/* Téléphone */}
                        <View style={styles.formSection}>
                            <Text style={styles.label}>Téléphone</Text>
                            <View style={styles.inputWithIconLeft}>
                                <Image source={userIcon} style={styles.phoneIcon} />
                                <TextInput
                                    style={styles.inputWithIconLeftText}
                                    value={contactPhone}
                                    onChangeText={setContactPhone}
                                    keyboardType="phone-pad"
                                    placeholder=""
                                />
                            </View>
                        </View>

                        {/* Contact principal Toggle */}
                        <View style={styles.toggleSection}>
                            <Text style={styles.toggleLabel}>Contact principal</Text>
                            <TouchableOpacity
                                style={[styles.toggle, isPrimaryContact && styles.toggleActive]}
                                onPress={() => setIsPrimaryContact(!isPrimaryContact)}
                            >
                                <View style={[styles.toggleThumb, isPrimaryContact && styles.toggleThumbActive]} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bottomSpacer} />
                    </ScrollView>

                    {/* Fixed Save Button */}
                    <View style={styles.fixedButtonContainer}>
                        <TouchableOpacity style={styles.saveButton} onPress={handleAddContact}>
                            <Text style={styles.saveButtonText}>Enregistrer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* </SafeAreaView> */}
            </Modal>

            {/* Date Picker */}
            {Platform.OS === 'ios' ? (
                <Modal
                    visible={showIssueDatePicker}
                    transparent={true}
                    animationType="slide"
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setShowIssueDatePicker(false)}>
                                    <Text style={styles.modalCancelButton}>Annuler</Text>
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>Date d'émission</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setIssueDate(tempIssueDate);
                                        setShowIssueDatePicker(false);
                                    }}
                                >
                                    <Text style={styles.modalConfirmButton}>OK</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={tempIssueDate}
                                mode="date"
                                display="spinner"
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) {
                                        setTempIssueDate(selectedDate);
                                    }
                                }}
                                style={styles.datePicker}
                            />
                        </View>
                    </View>
                </Modal>
            ) : (
                showIssueDatePicker && (
                    <DateTimePicker
                        value={issueDate}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowIssueDatePicker(false);
                            if (selectedDate) {
                                setIssueDate(selectedDate);
                            }
                        }}
                    />
                )
            )}

        </View>
    );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
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
    section: {
        marginHorizontal: 20,
        marginTop: 20,
    },
    label: {
        fontSize: 16,
        color: '#333333',
        marginBottom: 8,
        fontWeight: '400',
    },
    required: {
        color: '#E74C3C',
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 2,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    calendarIcon: {
        width: 20,
        height: 20,
        tintColor: '#999999',
        marginRight: 8,
    },
    fileIconLeft: {
        width: 20,
        height: 20,
        tintColor: '#999999',
        marginRight: 8,
    },
    userIcon: {
        width: 20,
        height: 20,
        tintColor: '#999999',
        marginRight: 8,
    },
    dateText: {
        flex: 1,
        fontSize: 16,
        color: '#333333',
    },
    dropdown: {
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    dropdownText: {
        fontSize: 16,
        color: '#333333',
    },
    placeholderText: {
        fontSize: 16,
        color: '#AAAAAA',
    },
    dropdownIcon: {
        width: 16,
        height: 16,
    },
    addArticleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 2,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    cartIcon: {
        width: 20,
        height: 20,
        tintColor: '#0B5FA5',
        marginRight: 8,
    },
    addArticleText: {
        flex: 1,
        fontSize: 16,
        color: '#0B5FA5',
        fontWeight: '500',
    },
    arrowIcon: {
        fontSize: 18,
        color: '#999999',
    },
    richTextContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        overflow: 'hidden',
    },
    richTextInput: {
        minHeight: 100,
    },
    toolbar: {
        backgroundColor: '#F8F8F8',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        height: 44,
        paddingHorizontal: 8,
    },
    toolbarText: {
        fontSize: 16,
        color: '#666666',
        fontWeight: '600',
    },
    toolbarTextItalic: {
        fontSize: 16,
        color: '#666666',
        fontStyle: 'italic',
        fontWeight: '600',
    },
    toolbarTextUnderline: {
        fontSize: 16,
        color: '#666666',
        textDecorationLine: 'underline',
        fontWeight: '600',
    },
    bottomSpacer: {
        height: 100,
    },
    fixedButtonContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 40,
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
    saveButton: {
        backgroundColor: '#0B5FA5',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    // Fullscreen Modal Styles
    modalOverlayFullscreen: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    modalContentFullscreen: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    modalHeaderFullscreen: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    modalBackButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    modalBackArrow: {
        fontSize: 28,
        color: '#0B5FA5',
        fontWeight: '600',
    },
    modalTitleFullscreen: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
        flex: 1,
        textAlign: 'center',
        marginRight: 40,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        paddingHorizontal: 16,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333333',
        paddingVertical: 12,
    },
    clearButton: {
        padding: 8,
    },
    clearButtonText: {
        fontSize: 18,
        color: '#0B5FA5',
        fontWeight: '600',
    },
    optionsList: {
        flex: 1,
        marginTop: 8,
    },
    optionItem: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    optionText: {
        fontSize: 16,
        color: '#333333',
    },
    // Date Picker Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        flex: 1,
        textAlign: 'center',
    },
    modalCancelButton: {
        fontSize: 16,
        color: '#999999',
        width: 70,
    },
    modalConfirmButton: {
        fontSize: 16,
        color: '#0B5FA5',
        fontWeight: '600',
        width: 70,
        textAlign: 'right',
    },
    datePicker: {
        alignSelf: 'center',
        width: '100%',
    },
    addButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    addButtonText: {
        fontSize: 32,
        color: '#0B5FA5',
        fontWeight: '400',
    },

    // add client modal styles 
    formContainer: {
        flex: 1,
    },
    formSection: {
        marginHorizontal: 20,
        marginTop: 20,
    },
    toggleSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginTop: 20,
    },
    toggleLabel: {
        fontSize: 16,
        color: '#333333',
        fontWeight: '400',
    },
    toggle: {
        width: 51,
        height: 31,
        borderRadius: 15.5,
        backgroundColor: '#E5E5E5',
        padding: 2,
        justifyContent: 'center',
    },
    toggleActive: {
        backgroundColor: '#0B5FA5',
    },
    toggleThumb: {
        width: 27,
        height: 27,
        borderRadius: 13.5,
        backgroundColor: '#FFFFFF',
        alignSelf: 'flex-start',
    },
    toggleThumbActive: {
        alignSelf: 'flex-end',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
        paddingHorizontal: 20,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333333',
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    inputWithIconRight: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 2,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    inputWithIconLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 2,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    inputWithIconLeftText: {
        flex: 1,
        fontSize: 16,
        color: '#333333',
        marginLeft: 8,
    },
    emailIcon: {
        fontSize: 18,
        color: '#999999',
    },
    phoneIcon: {
        width: 18,
        height: 18,
        tintColor: '#999999',
    },
    faxIcon: {
        width: 18,
        height: 18,
        tintColor: '#999999',
    },
    websiteIcon: {
        width: 18,
        height: 18,
        tintColor: '#999999',
    },
    notesInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
        paddingHorizontal: 20,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333333',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        minHeight: 120,
    },
    addressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 2,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    addressIcon: {
        width: 20,
        height: 20,
        tintColor: '#999999',
        marginRight: 12,
    },
    addressButtonText: {
        flex: 1,
        fontSize: 16,
        color: '#333333',
    },
    contactsSection: {
        marginHorizontal: 20,
        marginTop: 30,
    },
    contactsHeader: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 12,
        fontWeight: '400',
    },
    addContactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 2,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    contactIcon: {
        width: 20,
        height: 20,
        tintColor: '#0B5FA5',
        marginRight: 12,
    },
    addContactButtonText: {
        flex: 1,
        fontSize: 16,
        color: '#0B5FA5',
        fontWeight: '500',
    },
    confirmButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    checkmarkButton: {
        width: 44,
        height: 44,
        backgroundColor: '#0B5FA5',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkText: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    inputWithPercentage: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 2,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    inputPercentage: {
        flex: 1,
        fontSize: 16,
        color: '#333333',
    },
    percentageSymbol: {
        fontSize: 16,
        color: '#999999',
        marginLeft: 8,
    },

});

export default AddCredit;
