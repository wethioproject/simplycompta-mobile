import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Image,
    Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { downArrowIcon } from '../../assets/icons';

const AddProduct: React.FC = ({ navigation, route }: any) => {
    const [title, setTitle] = useState('');
    const [showTitleModal, setShowTitleModal] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const [priceHT, setPriceHT] = useState('');
    const [purchasePriceHT, setPurchasePriceHT] = useState('');
    const [sellingPriceHT, setSellingPriceHT] = useState('');
    const [family, setFamily] = useState('');
    const [familySearchQuery, setFamilySearchQuery] = useState('');
    const [showFamilyModal, setShowFamilyModal] = useState(false);
    const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
    const [familyName, setFamilyName] = useState('');
    const [tax, setTax] = useState('');
    const [showTaxModal, setShowTaxModal] = useState(false);
    const [showAddTaxModal, setShowAddTaxModal] = useState(false);
    const [taxName, setTaxName] = useState('');
    const [taxRate, setTaxRate] = useState('');
    const [taxSearchQuery, setTaxSearchQuery] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [unit, setUnit] = useState('');
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [unitSearchQuery, setUnitSearchQuery] = useState('');
    const [reduction, setReduction] = useState('');
    const [reductionType, setReductionType] = useState('Fixe');
    const [showReductionTypeModal, setShowReductionTypeModal] = useState(false);
    const [reductionTypeSearchQuery, setReductionTypeSearchQuery] = useState('');
    const [designation, setDesignation] = useState('');
    const [productType, setProductType] = useState('Produit');

    const designationEditor = useRef<RichEditor>(null);

    const [taxOptions, setTaxOptions] = useState([
        '10%',
        '20%',
    ]);

    const [familyOptions, setFamilyOptions] = useState([
        'famille A',
        'famille B',
    ])

    const unitOptions = [
        'Pièce',
        'Heure',
        'Kg',
        'Litre',
    ];

    const reductionTypeOptions = [
        'Fixe',
        '%',
    ];

    const filteredTaxOptions = taxOptions.filter(option =>
        option.toLowerCase().includes(taxSearchQuery.toLowerCase())
    );

    const filteredFamilyOptions = familyOptions.filter(option =>
        option.toLowerCase().includes(familySearchQuery.toLowerCase())
    )

    const filteredUnitOptions = unitOptions.filter(option =>
        option.toLowerCase().includes(unitSearchQuery.toLowerCase())
    );

    const filteredReductionTypeOptions = reductionTypeOptions.filter(option =>
        option.toLowerCase().includes(reductionTypeSearchQuery.toLowerCase())
    );

    const handleTaxSelect = (option: string) => {
        setTax(option);
        setShowTaxModal(false);
        setTaxSearchQuery('');
    };

    const handleFamilySelect = (option: string) => {
        setFamily(option);
        setShowFamilyModal(false);
        setFamilySearchQuery('');
    }

    const handleUnitSelect = (option: string) => {
        setUnit(option);
        setShowUnitModal(false);
        setUnitSearchQuery('');
    };

    const handleReductionTypeSelect = (option: string) => {
        setReductionType(option);
        setShowReductionTypeModal(false);
        setReductionTypeSearchQuery('');
    };

    const handleTitleConfirm = () => {
        if (tempTitle.trim()) {
            setTitle(tempTitle.trim());
        }
        setShowTitleModal(false);
        setTempTitle('');
    };

    const handleAddTax = () => {
        if (taxName.trim() && taxRate.trim()) {
            const newTax = `${taxRate}%`;
            setTaxOptions([...taxOptions, newTax]);
            setTax(newTax);
            setTaxName('');
            setTaxRate('');
            setShowAddTaxModal(false);
            setTimeout(() => {
                setShowTaxModal(true);
            }, 300);
        }
    };

    
        const handleAddFamily = () => {
        if (familyName.trim()) {
            setFamily(familyName);
            setFamilyName('');
            setShowAddFamilyModal(false);
            setTimeout(() => {
                setShowFamilyModal(true);
            }, 300);
        }
    };

    const handleSave = () => {
        const articleData = {
            title,
            priceHT,
            tax,
            quantity,
            unit,
            reduction,
            reductionType,
            designation,
        };

        // Pass data back to AddInvoice screen
        route.params?.onArticleAdded?.(articleData);
        navigation.goBack();
    };

    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ajouter produit</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Type */}
                <View style={styles.formSection}>
                    <Text style={styles.label}>
                        Type <Text style={styles.required}>*</Text>
                    </Text>
                    <Dropdown
                        style={styles.dropdown}
                        data={[
                            { label: 'Produit', value: 'Produit' },
                            { label: 'Service', value: 'Service' },
                        ]}
                        labelField="label"
                        valueField="value"
                        placeholder=""
                        value={productType}
                        onChange={(item) => setProductType(item.value)}
                        selectedTextStyle={styles.dropdownText}
                        placeholderStyle={styles.placeholderText}
                    />
                </View>

                {/* Titre */}
                <View style={styles.section}>
                    <Text style={styles.label}>
                        Titre <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        keyboardType="default"
                        placeholder=""
                    />
                </View>

                {/* Famille */}
                <View style={styles.section}>
                    <Text style={styles.label}>Famille</Text>
                    <TouchableOpacity style={styles.inputWithIcon} onPress={() => setShowFamilyModal(true)}>
                        <Text style={[styles.inputText, !family && styles.placeholderText]}>
                            {family || 'Famille'}
                        </Text>
                        <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
                    </TouchableOpacity>
                </View>

                {/* TVA applicable */}
                <View style={styles.section}>
                    <Text style={styles.label}>TVA applicable</Text>
                    <TouchableOpacity style={styles.inputWithIcon} onPress={() => setShowTaxModal(true)}>
                        <Text style={[styles.inputText, !tax && styles.placeholderText]}>
                            {tax || 'TVA applicable'}
                        </Text>
                        <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
                    </TouchableOpacity>
                </View>

                {/* Prix d'achat HT */}
                <View style={styles.section}>
                    <Text style={styles.label}>
                         Prix d'achat HT <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={styles.input}
                        value={purchasePriceHT}
                        onChangeText={setPurchasePriceHT}
                        keyboardType="decimal-pad"
                        placeholder=""
                    />
                </View>

                {/* Prix de vente HT */}
                <View style={styles.section}>
                    <Text style={styles.label}>
                        Prix de vente HT <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                        style={styles.input}
                        value={sellingPriceHT}
                        onChangeText={setSellingPriceHT}
                        keyboardType="decimal-pad"
                        placeholder=""
                    />
                </View>

                {/* Unité */}
                <View style={styles.section}>
                    <Text style={styles.label}>Unité</Text>
                    <TouchableOpacity style={styles.inputWithIcon} onPress={() => setShowUnitModal(true)}>
                        <Text style={[styles.inputText, !unit && styles.placeholderText]}>
                            {unit || 'Unité'}
                        </Text>
                        <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
                    </TouchableOpacity>
                </View>

                {/* Désignation */}
                <View style={styles.section}>
                    <Text style={styles.label}>Désignation</Text>
                    <View style={styles.richTextContainer}>
                        <RichToolbar
                            editor={designationEditor}
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
                            ref={designationEditor}
                            style={styles.richTextInput}
                            initialContentHTML=""
                            placeholder=""
                            onChange={(text: string) => setDesignation(text)}
                            editorStyle={{
                                backgroundColor: '#FFFFFF',
                                color: '#333333',
                                placeholderColor: '#999999',
                                contentCSSText: 'font-size: 16px; min-height: 80px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 12px 20px;',
                            }}
                        />
                    </View>
                </View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Fixed Save Button */}
            <View style={styles.fixedButtonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Enregistrer</Text>
                </TouchableOpacity>
            </View>

            {/* Title/Product Modal */}
            <Modal
                visible={showTitleModal}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setShowTitleModal(false)}
            >
                <View style={[styles.modalOverlayFullscreen, { paddingTop: insets.top }]}>
                    <View style={styles.modalContentFullscreen}>
                        {/* Modal Header */}
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowTitleModal(false);
                                    setTempTitle('');
                                }}
                                style={styles.modalBackButton}
                            >
                                <Text style={styles.modalBackArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitleFullscreen}>Produit</Text>
                            <View style={styles.placeholder} />
                        </View>

                        {/* Search/Input Bar with Checkmark */}
                        <View style={styles.inputRow}>
                            <View style={styles.searchContainerWithButton}>
                                <TextInput
                                    style={styles.searchInputLarge}
                                    placeholder="Chercher..."
                                    placeholderTextColor="#AAAAAA"
                                    value={tempTitle}
                                    onChangeText={setTempTitle}
                                    autoFocus
                                />
                            </View>
                            <TouchableOpacity
                                onPress={handleTitleConfirm}
                                style={styles.checkmarkButtonContainer}
                            >
                                <View style={styles.checkmarkButton}>
                                    <Text style={styles.checkmark}>✓</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


            {/* Family Modal */}
            <Modal
                visible={showFamilyModal}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setShowFamilyModal(false)}
            >
                <View style={[styles.modalOverlayFullscreen, { paddingTop: insets.top }]}>
                    <View style={styles.modalContentFullscreen}>
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowFamilyModal(false);
                                    setFamilySearchQuery('');
                                }}
                                style={styles.modalBackButton}
                            >
                                <Text style={styles.modalBackArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitleFullscreen}>Famille</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowFamilyModal(false);
                                    setTimeout(() => {
                                        setShowAddFamilyModal(true);
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
                                value={familySearchQuery}
                                onChangeText={setFamilySearchQuery}
                            />
                            {familySearchQuery.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => setFamilySearchQuery('')}
                                    style={styles.clearButton}
                                >
                                    <Text style={styles.clearButtonText}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                            {filteredFamilyOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.optionItem}
                                    onPress={() => handleFamilySelect(option)}
                                >
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Add Family Modal */}
            <Modal
                visible={showAddFamilyModal}
                transparent={false}
                animationType="slide"
                presentationStyle="pageSheet" // Add this line
                onRequestClose={() => setShowAddFamilyModal(false)}
            >
                <View style={[styles.modalOverlayFullscreen, { paddingTop: insets.top }]}>
                    <View style={styles.modalContentFullscreen}>
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowAddFamilyModal(false);
                                    setFamily('');
                                }}
                                style={styles.modalBackButton}
                            >
                                <Text style={styles.modalBackArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitleFullscreen}>Ajouter famille</Text>
                            <View style={styles.placeholder} />
                        </View>

                        <ScrollView
                            style={styles.formContainer}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Title */}
                            <View style={styles.formSection}>
                                <Text style={styles.label}>
                                    Titre <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    value={familyName}
                                    onChangeText={setFamilyName}
                                    placeholder=""
                                    placeholderTextColor="#AAAAAA"
                                />
                            </View>
                        </ScrollView>

                        {/* Fixed Save Button */}
                        <View style={styles.fixedButtonContainer}>
                            <TouchableOpacity style={styles.saveButton} onPress={handleAddFamily}>
                                <Text style={styles.saveButtonText}>Enregistrer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Tax Modal */}
            <Modal
                visible={showTaxModal}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setShowTaxModal(false)}
            >
                <View style={[styles.modalOverlayFullscreen, { paddingTop: insets.top }]}>
                    <View style={styles.modalContentFullscreen}>
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowTaxModal(false);
                                    setTaxSearchQuery('');
                                }}
                                style={styles.modalBackButton}
                            >
                                <Text style={styles.modalBackArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitleFullscreen}>Tax</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowTaxModal(false);
                                    setTimeout(() => {
                                        setShowAddTaxModal(true);
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
                                value={taxSearchQuery}
                                onChangeText={setTaxSearchQuery}
                            />
                            {taxSearchQuery.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => setTaxSearchQuery('')}
                                    style={styles.clearButton}
                                >
                                    <Text style={styles.clearButtonText}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                            {filteredTaxOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.optionItem}
                                    onPress={() => handleTaxSelect(option)}
                                >
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Add Tax Modal */}
            <Modal
                visible={showAddTaxModal}
                transparent={false}
                animationType="slide"
                presentationStyle="pageSheet" // Add this line
                onRequestClose={() => setShowAddTaxModal(false)}
            >
                <View style={[styles.modalOverlayFullscreen, { paddingTop: insets.top }]}>
                    <View style={styles.modalContentFullscreen}>
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowAddTaxModal(false);
                                    setTaxName('');
                                    setTaxRate('');
                                }}
                                style={styles.modalBackButton}
                            >
                                <Text style={styles.modalBackArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitleFullscreen}>Ajouter taxe</Text>
                            <View style={styles.placeholder} />
                        </View>

                        <ScrollView
                            style={styles.formContainer}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Nom */}
                            <View style={styles.formSection}>
                                <Text style={styles.label}>
                                    Nom <Text style={styles.required}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    value={taxName}
                                    onChangeText={setTaxName}
                                    placeholder=""
                                    placeholderTextColor="#AAAAAA"
                                />
                            </View>

                            {/* Taux */}
                            <View style={styles.formSection}>
                                <Text style={styles.label}>
                                    Taux <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputWithSuffix}>
                                    <TextInput
                                        style={styles.inputWithSuffixText}
                                        value={taxRate}
                                        onChangeText={setTaxRate}
                                        keyboardType="decimal-pad"
                                        placeholder=""
                                        placeholderTextColor="#AAAAAA"
                                    />
                                    <Text style={styles.suffixText}>%</Text>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Fixed Save Button */}
                        <View style={styles.fixedButtonContainer}>
                            <TouchableOpacity style={styles.saveButton} onPress={handleAddTax}>
                                <Text style={styles.saveButtonText}>Enregistrer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Unit Modal */}
            <Modal
                visible={showUnitModal}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setShowUnitModal(false)}
            >
                <View style={[styles.modalOverlayFullscreen, { paddingTop: insets.top }]}>
                    <View style={styles.modalContentFullscreen}>
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowUnitModal(false);
                                    setUnitSearchQuery('');
                                }}
                                style={styles.modalBackButton}
                            >
                                <Text style={styles.modalBackArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitleFullscreen}>Unité</Text>
                            <View style={styles.placeholder} />
                        </View>

                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Chercher"
                                placeholderTextColor="#AAAAAA"
                                value={unitSearchQuery}
                                onChangeText={setUnitSearchQuery}
                            />
                            {unitSearchQuery.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => setUnitSearchQuery('')}
                                    style={styles.clearButton}
                                >
                                    <Text style={styles.clearButtonText}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                            {filteredUnitOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.optionItem}
                                    onPress={() => handleUnitSelect(option)}
                                >
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Reduction Type Modal */}
            <Modal
                visible={showReductionTypeModal}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setShowReductionTypeModal(false)}
            >
                <View style={[styles.modalOverlayFullscreen, { paddingTop: insets.top }]}>
                    <View style={styles.modalContentFullscreen}>
                        <View style={styles.modalHeaderFullscreen}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowReductionTypeModal(false);
                                    setReductionTypeSearchQuery('');
                                }}
                                style={styles.modalBackButton}
                            >
                                <Text style={styles.modalBackArrow}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.modalTitleFullscreen}>Type de réduction</Text>
                            <View style={styles.placeholder} />
                        </View>

                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Chercher"
                                placeholderTextColor="#AAAAAA"
                                value={reductionTypeSearchQuery}
                                onChangeText={setReductionTypeSearchQuery}
                            />
                            {reductionTypeSearchQuery.length > 0 && (
                                <TouchableOpacity
                                    onPress={() => setReductionTypeSearchQuery('')}
                                    style={styles.clearButton}
                                >
                                    <Text style={styles.clearButtonText}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                            {filteredReductionTypeOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.optionItem}
                                    onPress={() => handleReductionTypeSelect(option)}
                                >
                                    <Text style={styles.optionText}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

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
    rowSection: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 20,
        gap: 12,
    },
    halfSection: {
        flex: 1,
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
    inputText: {
        flex: 1,
        fontSize: 16,
        color: '#333333',
    },
    placeholderText: {
        color: '#AAAAAA',
    },
    dropdownIcon: {
        width: 16,
        height: 16,
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
    // Modal Styles
    modalOverlayFullscreen: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    modalContentFullscreen: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    modalHeaderFullscreen: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 16,
        gap: 12,
    },
    searchContainerWithButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    searchInputLarge: {
        fontSize: 16,
        color: '#333333',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    checkmarkButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkButton: {
        width: 48,
        height: 48,
        backgroundColor: '#0B5FA5',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    formContainer: {
        flex: 1,
    },
    formSection: {
        marginHorizontal: 20,
        marginTop: 20,
    },
    inputWithSuffix: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 2,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    inputWithSuffixText: {
        flex: 1,
        fontSize: 16,
        color: '#333333',
    },
    suffixText: {
        fontSize: 16,
        color: '#666666',
        marginLeft: 8,
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
});

export default AddProduct;