import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Image,
    Modal,
    TextInput
} from 'react-native';
import { fileIcon, userIcon, downArrowIcon } from '../../assets/icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const AddClient: React.FC = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const [isProfessional, setIsProfessional] = useState(true);
    const [clientNom, setClientNom] = useState('');
    const [clientPrenom, setClientPrenom] = useState('');
    const [rc, setRc] = useState('');
    const [ice, setIce] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [fax, setFax] = useState('');
    const [website, setWebsite] = useState('');
    const [clientNotes, setClientNotes] = useState('');
    const [billingAddress, setBillingAddress] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [showBillingAddressModal, setShowBillingAddressModal] = useState(false);
    const [showDeliveryAddressModal, setShowDeliveryAddressModal] = useState(false);
    const [addressType, setAddressType] = useState<'billing' | 'delivery'>('billing');
    const [billingAddressStreet, setBillingAddressStreet] = useState('');
    const [billingPostalCode, setBillingPostalCode] = useState('');
    const [billingCity, setBillingCity] = useState('');
    const [billingCountry, setBillingCountry] = useState('');
    const [deliveryAddressStreet, setDeliveryAddressStreet] = useState('');
    const [deliveryPostalCode, setDeliveryPostalCode] = useState('');
    const [deliveryCity, setDeliveryCity] = useState('');
    const [deliveryCountry, setDeliveryCountry] = useState('');
    const [showAddContactModal, setShowAddContactModal] = useState(false);
    const [contactNom, setContactNom] = useState('');
    const [contactPrenom, setContactPrenom] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [isPrimaryContact, setIsPrimaryContact] = useState(true);

    const [clientCurrency, setClientCurrency] = useState('Dirham marocain');
    const [showClientCurrencyModal, setShowClientCurrencyModal] = useState(false);
    const [clientCurrencySearchQuery, setClientCurrencySearchQuery] = useState('');
    const [socialReason, setSocialReason] = useState('');
    const [showSocialReasonModal, setShowSocialReasonModal] = useState(false);
    const [socialReasonSearchQuery, setSocialReasonSearchQuery] = useState('');
    const [showCountryModal, setShowCountryModal] = useState(false);
    const [countrySearchQuery, setCountrySearchQuery] = useState('');

    const currencyOptions = [
        'Dirham marocain',
        'Euro',
        'Dollar',
    ];

    const filteredClientCurrencyOptions = currencyOptions.filter(option =>
        option.toLowerCase().includes(clientCurrencySearchQuery.toLowerCase())
    );

    const handleClientCurrencySelect = (option: string) => {
        setClientCurrency(option);
        setShowClientCurrencyModal(false);
        setClientCurrencySearchQuery('');
    };

    const socialReasonOptions = [
        'SARL',
        'SA',
        'SAS',
        'Auto-entrepreneur',
    ];

    const filteredSocialReasonOptions = socialReasonOptions.filter(option =>
        option.toLowerCase().includes(socialReasonSearchQuery.toLowerCase())
    );

    const handleSocialReasonSelect = (option: string) => {
        setSocialReason(option);
        setShowSocialReasonModal(false);
        setSocialReasonSearchQuery('');
    };

    const countryOptions = [
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

    const filteredCountryOptions = countryOptions.filter(option =>
        option.toLowerCase().includes(countrySearchQuery.toLowerCase())
    );

    const handleCountrySelect = (option: string) => {
        if (addressType === 'billing') {
            setBillingCountry(option);
        } else {
            setDeliveryCountry(option);
        }
        setShowCountryModal(false);
        setCountrySearchQuery('');
    };

    const handleAddContact = () => {
        if (!contactNom.trim() || !contactPrenom.trim() || !contactEmail.trim()) {
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

        setContactNom('');
        setContactPrenom('');
        setContactEmail('');
        setContactPhone('');
        setIsPrimaryContact(true);
        setShowAddContactModal(false);
    };

    const handleSaveBillingAddress = () => {
        const address = `${billingAddressStreet}, ${billingPostalCode} ${billingCity}, ${billingCountry}`;
        setBillingAddress(address);
        setShowBillingAddressModal(false);
    };

    const handleSaveDeliveryAddress = () => {
        const address = `${deliveryAddressStreet}, ${deliveryPostalCode} ${deliveryCity}, ${deliveryCountry}`;
        setDeliveryAddress(address);
        setShowDeliveryAddressModal(false);
    };

    const handleAddClient = () => {
        const { returnScreen, onClientAdded } = route.params || {};
        if (isProfessional) {
            if (!socialReason.trim()) {
                return;
            }
        } else {
            if (!clientNom.trim() || !clientPrenom.trim()) {
                return;
            }
        }

        const newClient = isProfessional ? {
            professional: isProfessional,
            socialReason,
            rc,
            ice,
            currency: clientCurrency,
            email,
            phone,
            fax,
            website,
            clientNotes,
            billingAddress,
            deliveryAddress,
        } : {
            professional: isProfessional,
            nom: clientNom,
            prenom: clientPrenom,
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

        if (returnScreen && onClientAdded) {
            // Return data to calling screen
            navigation.navigate(returnScreen, { newClient });
        } else {
            // Normal flow - just go back to clients list
            navigation.goBack();
        }

        // Navigate back to clients screen
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ajouter client</Text>
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
                                onPress={() => setShowSocialReasonModal(true)}
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
                        onPress={() => setShowClientCurrencyModal(true)}
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
                            setAddressType('billing');
                            setShowBillingAddressModal(true);
                        }}
                    >
                        <Image source={fileIcon} style={styles.addressIcon} resizeMode="contain" />
                        <Text style={styles.addressButtonText}>
                            {billingAddress || 'Adresse de facturation'}
                        </Text>
                        <Text style={styles.arrowIcon}>→</Text>
                    </TouchableOpacity>
                </View>

                {/* Adresse de livraison */}
                <View style={styles.formSection}>
                    <TouchableOpacity
                        style={styles.addressButton}
                        onPress={() => {
                            setAddressType('delivery');
                            setShowDeliveryAddressModal(true);
                        }}
                    >
                        <Image source={fileIcon} style={styles.addressIcon} resizeMode="contain" />
                        <Text style={styles.addressButtonText}>
                            {deliveryAddress || 'Adresse de livraison'}
                        </Text>
                        <Text style={styles.arrowIcon}>→</Text>
                    </TouchableOpacity>
                </View>

                {/* Contacts Section */}
                <View style={styles.contactsSection}>
                    <Text style={styles.contactsHeader}>Contacts</Text>
                    <TouchableOpacity
                        style={styles.addContactButton}
                        onPress={() => setShowAddContactModal(true)}
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
                    <View style={styles.modalContentFullscreen}>
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => setShowSocialReasonModal(false)}
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
                            {socialReasonSearchQuery ? (
                                <TouchableOpacity
                                    style={styles.clearButton}
                                    onPress={() => setSocialReasonSearchQuery('')}
                                >
                                    <Text style={styles.clearButtonText}>×</Text>
                                </TouchableOpacity>
                            ) : null}
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
                    <View style={styles.modalContentFullscreen}>
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => setShowClientCurrencyModal(false)}
                                style={styles.modalBackButton}
                            >
                                <Text style={styles.modalBackArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitleFullscreen}>Devise</Text>
                            <View style={styles.placeholder} />
                        </View>

                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Chercher"
                                placeholderTextColor="#AAAAAA"
                                value={clientCurrencySearchQuery}
                                onChangeText={setClientCurrencySearchQuery}
                            />
                            {clientCurrencySearchQuery ? (
                                <TouchableOpacity
                                    style={styles.clearButton}
                                    onPress={() => setClientCurrencySearchQuery('')}
                                >
                                    <Text style={styles.clearButtonText}>×</Text>
                                </TouchableOpacity>
                            ) : null}
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
                    <View style={styles.modalContentFullscreen}>
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => setShowBillingAddressModal(false)}
                                style={styles.modalBackButton}
                            >
                                <Text style={styles.modalBackArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitleFullscreen}>Adresse de facturation</Text>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleSaveBillingAddress}
                            >
                                <View style={styles.checkmarkButton}>
                                    <Text style={styles.checkmarkText}>✓</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.formContainer}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.formSection}>
                                <Text style={styles.label}>Rue</Text>
                                <TextInput
                                    style={styles.input}
                                    value={billingAddressStreet}
                                    onChangeText={setBillingAddressStreet}
                                    placeholder=""
                                    placeholderTextColor="#AAAAAA"
                                />
                            </View>

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

                            <View style={styles.formSection}>
                                <Text style={styles.label}>Ville</Text>
                                <TextInput
                                    style={styles.input}
                                    value={billingCity}
                                    onChangeText={setBillingCity}
                                    placeholder=""
                                    placeholderTextColor="#AAAAAA"
                                />
                            </View>

                            <View style={styles.formSection}>
                                <Text style={styles.label}>Pays</Text>
                                <TouchableOpacity
                                    style={styles.inputWithIconRight}
                                    onPress={() => {
                                        setAddressType('billing');
                                        setShowBillingAddressModal(false);
                                        setTimeout(() => {
                                            setShowCountryModal(true);

                                        }, 300)

                                    }}
                                >
                                    <Text
                                        style={[styles.dateText, !billingCountry && styles.placeholderText]}
                                    >
                                        {billingCountry || 'Pays'}
                                    </Text>
                                    <Text style={styles.arrowIcon}>→</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.bottomSpacer} />
                        </ScrollView>
                    </View>
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
                    <View style={styles.modalContentFullscreen}>
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => setShowDeliveryAddressModal(false)}
                                style={styles.modalBackButton}
                            >
                                <Text style={styles.modalBackArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitleFullscreen}>Adresse de livraison</Text>
                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleSaveDeliveryAddress}
                            >
                                <View style={styles.checkmarkButton}>
                                    <Text style={styles.checkmarkText}>✓</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            style={styles.formContainer}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.formSection}>
                                <Text style={styles.label}>Rue</Text>
                                <TextInput
                                    style={styles.input}
                                    value={deliveryAddressStreet}
                                    onChangeText={setDeliveryAddressStreet}
                                    placeholder=""
                                    placeholderTextColor="#AAAAAA"
                                />
                            </View>

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

                            <View style={styles.formSection}>
                                <Text style={styles.label}>Ville</Text>
                                <TextInput
                                    style={styles.input}
                                    value={deliveryCity}
                                    onChangeText={setDeliveryCity}
                                    placeholder=""
                                    placeholderTextColor="#AAAAAA"
                                />
                            </View>

                            <View style={styles.formSection}>
                                <Text style={styles.label}>Pays</Text>
                                <TouchableOpacity
                                    style={styles.inputWithIconRight}
                                    onPress={() => {
                                        setAddressType('delivery');
                                        setShowCountryModal(true);
                                    }}
                                >
                                    <Text
                                        style={[styles.dateText, !deliveryCountry && styles.placeholderText]}
                                    >
                                        {deliveryCountry || 'Pays'}
                                    </Text>
                                    <Text style={styles.arrowIcon}>→</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.bottomSpacer} />
                        </ScrollView>
                    </View>
                </View>
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
                    <View style={styles.modalContentFullscreen}>
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => setShowAddContactModal(false)}
                                style={styles.modalBackButton}
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
                            <View style={styles.formSection}>
                                <Text style={styles.label}>
                                    Nom <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    value={contactNom}
                                    onChangeText={setContactNom}
                                    placeholder=""
                                    placeholderTextColor="#AAAAAA"
                                />
                            </View>

                            <View style={styles.formSection}>
                                <Text style={styles.label}>
                                    Prénom <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    value={contactPrenom}
                                    onChangeText={setContactPrenom}
                                    placeholder=""
                                    placeholderTextColor="#AAAAAA"
                                />
                            </View>

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
                                        placeholder=""
                                        placeholderTextColor="#AAAAAA"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>

                            <View style={styles.formSection}>
                                <Text style={styles.label}>Téléphone</Text>
                                <View style={styles.inputWithIconLeft}>
                                    <Image source={fileIcon} style={styles.phoneIcon} resizeMode="contain" />
                                    <TextInput
                                        style={styles.inputWithIconLeftText}
                                        value={contactPhone}
                                        onChangeText={setContactPhone}
                                        placeholder=""
                                        placeholderTextColor="#AAAAAA"
                                        keyboardType="phone-pad"
                                    />
                                </View>
                            </View>

                            <View style={styles.toggleSection}>
                                <Text style={styles.toggleLabel}>Contact principal</Text>
                                <TouchableOpacity
                                    style={[styles.toggle, isPrimaryContact && styles.toggleActive]}
                                    onPress={() => setIsPrimaryContact(!isPrimaryContact)}
                                >
                                    <View
                                        style={[styles.toggleThumb, isPrimaryContact && styles.toggleThumbActive]}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.bottomSpacer} />
                        </ScrollView>

                        <View style={styles.fixedButtonContainer}>
                            <TouchableOpacity style={styles.saveButton} onPress={handleAddContact}>
                                <Text style={styles.saveButtonText}>Ajouter</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Country Selection Modal */}
            <Modal
                visible={showCountryModal}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setShowCountryModal(false)}
            >
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

                                    setShowCountryModal(false)
                                    setTimeout(() => {
                                        setShowBillingAddressModal(true)
                                    }, 300)
                                }}
                                style={styles.modalBackButton}
                            >
                                <Text style={styles.modalBackArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitleFullscreen}>Pays</Text>
                            <View style={styles.placeholder} />
                        </View>

                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Chercher..."
                                placeholderTextColor="#AAAAAA"
                                value={countrySearchQuery}
                                onChangeText={setCountrySearchQuery}
                            />
                            {countrySearchQuery ? (
                                <TouchableOpacity
                                    style={styles.clearButton}
                                    onPress={() => setCountrySearchQuery('')}
                                >
                                    <Text style={styles.clearButtonText}>×</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>

                        <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                            {filteredCountryOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.optionItem}
                                    onPress={() => handleCountrySelect(option)}
                                >
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
        alignItems: 'flex-start',
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
    label: {
        fontSize: 16,
        color: '#333333',
        marginBottom: 8,
        fontWeight: '400',
    },
    required: {
        color: '#E74C3C',
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
    dateText: {
        flex: 1,
        fontSize: 16,
        color: '#333333',
    },
    placeholderText: {
        fontSize: 16,
        color: '#AAAAAA',
    },
    arrowIcon: {
        fontSize: 18,
        color: '#999999',
    },
    dropdownIcon: {
        width: 16,
        height: 16,
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
});

export default AddClient;
