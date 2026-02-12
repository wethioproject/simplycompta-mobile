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
import { sampleTemplateImage } from '../../assets/images';


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

const CLIENT_OPTIONS = [
  'a barb',
  'Client 2',
  'Client 3',
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


const AddInvoice: React.FC = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  const paymentTermsEditor = useRef<RichEditor>(null);
  const notesEditor = useRef<RichEditor>(null);

  // Invoice Form State
  const [issueDate, setIssueDate] = useState(new Date(2026, 0, 29));
  const [dueDate, setDueDate] = useState('À date d\'émission');
  const [client, setClient] = useState('');
  const [currency, setCurrency] = useState('Dirham marocain');
  const [paymentMode, setPaymentMode] = useState('');
  const [model, setModel] = useState('Modèle Auto-entrepreneur');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [notes, setNotes] = useState('');

  // Date Picker State
  const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
  const [tempIssueDate, setTempIssueDate] = useState(new Date(2026, 0, 29));

  // Modal Visibility State
  const [showDueDateModal, setShowDueDateModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showPaymentModeModal, setShowPaymentModeModal] = useState(false);
  const [showAddDeviseModal, setShowAddDeviseModal] = useState(false);
  const [showDeviseSelectionModal, setShowDeviseSelectionModal] = useState(false);
  const [showAddPaymentModeModal, setShowAddPaymentModeModal] = useState(false);

  // Search Query State
  const [dueDateSearchQuery, setDueDateSearchQuery] = useState('');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [currencySearchQuery, setCurrencySearchQuery] = useState('');
  const [paymentModeSearchQuery, setPaymentModeSearchQuery] = useState('');
  const [deviseSearchQuery, setDeviseSearchQuery] = useState('');

  // Devise Form State
  const [deviseName, setDeviseName] = useState('');
  const [defaultRate, setDefaultRate] = useState('');
  const [deviseType, setDeviseType] = useState('Gauche');
  const [deviseSymbol, setDeviseSymbol] = useState('');

  // Payment Mode State
  const [paymentModeName, setPaymentModeName] = useState('');

  // Computed Values - Filtered Options
  const filteredDueDateOptions = DUE_DATE_OPTIONS.filter(option =>
    option.toLowerCase().includes(dueDateSearchQuery.toLowerCase())
  );

  const filteredClientDataOptions = CLIENT_OPTIONS.filter(option =>
    option.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  const filteredCurrencyOptions = CURRENCY_OPTIONS.filter(option =>
    option.toLowerCase().includes(currencySearchQuery.toLowerCase())
  );

  const filteredPaymentModeOptions = PAYMENT_MODE_OPTIONS.filter(option =>
    option.toLowerCase().includes(paymentModeSearchQuery.toLowerCase())
  );

  const filteredDeviseOptions = DEVISE_OPTIONS.filter(option =>
    option.toLowerCase().includes(deviseSearchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

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

  const handleDeviseSelect = (option: string) => {
    setDeviseName(option);
    setShowDeviseSelectionModal(false);
    setDeviseSearchQuery('');
    setTimeout(() => {
      setShowAddDeviseModal(true);
    }, 300);
  };

  const handleAddClient = () => {
    setShowClientModal(false);
    navigation.navigate('Add Client', {
      returnScreen: 'Add Invoice',
      onClientAdded: (newClient: any) => {
        const clientName = newClient.professional
          ? newClient.socialReason
          : `${newClient.nom} ${newClient.prenom}`;
        setClient(clientName);
      }
    });
  };

  const handleSave = () => {
    console.log('Invoice Data:', {
      issueDate: formatDate(issueDate),
      dueDate,
      client,
      currency,
      paymentMode,
      model,
      paymentTerms,
      notes,
    });
    console.log('Save invoice');
    console.log('Payment Terms:', paymentTerms);
    console.log('Notes:', notes);
    navigation.goBack();
  };


  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const templates = [
    { id: 1, name: 'Template 1', description: 'Facteurs 1' },
    { id: 2, name: 'Template 2', description: 'Facteurs 2' },
    { id: 3, name: 'Template 3', description: 'Facteurs 3' },
  ];

  const handleTemplatePress = (id: number) => {
    setSelectedTemplate(id);
    console.log('Selected template:', id);
  };



  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter facture</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Invoice Issue Date */}
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

        {/* Invoice Due Date */}
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

        {/* Client Selection */}
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

        {/* Currency Selection */}
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

        {/* Payment Mode */}
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

        {/* Invoice Template */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Modèle <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity style={styles.inputWithIcon} onPress={() => setShowTemplateModal(true)}>
            <Image source={fileIcon} style={styles.fileIconLeft} resizeMode="contain" />
            <Text style={styles.dateText}>{model}</Text>
          </TouchableOpacity>
        </View>

        {/* Articles/Products */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Articles <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.addArticleButton}
            onPress={() => navigation.navigate('Add Article', {
              onArticleAdded: (articleData: any) => {
                console.log('Article added:', articleData);
                // Handle the article data here
              }
            })}
          >
            <Image source={fileIcon} style={styles.cartIcon} resizeMode="contain" />
            <Text style={styles.addArticleText}>Ajouter un article</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Terms (Rich Text Editor) */}
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

        {/* Notes (Rich Text Editor) */}
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

        {/* Bottom Spacing for Scroll */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>


      {/* Due Date Selection Modal */}
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

      {/* Client Selection Modal */}
      <Modal
        visible={showClientModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowClientModal(false)}
      >
        <View style={[styles.modalOverlayFullscreen, { paddingTop: insets.top }]}>
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
                onPress={handleAddClient}
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
      </Modal>

      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={[styles.modalOverlayFullscreen, { paddingTop: insets.top }]}>
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
                  setTimeout(() => {
                    setShowAddDeviseModal(true);
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
      </Modal>

      {/* Add New Devise Modal */}
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
                }}
              >
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
                    setShowAddDeviseModal(true);
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
              <TouchableOpacity
                onPress={() => {
                  setShowPaymentModeModal(false);
                  setTimeout(() => {
                    setShowAddPaymentModeModal(true);
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

      {/* Show Add Payment Mode Modal */}
      <Modal
        visible={showAddPaymentModeModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowAddPaymentModeModal(false)}
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
                  setShowAddPaymentModeModal(false);
                  setTimeout(() => {
                    setShowPaymentModeModal(true);
                  }, 300);
                }}
                style={styles.modalBackButton}
              >
                <Text style={styles.modalBackArrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitleFullscreen}>Ajouter mode de paiement</Text>
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
                  value={paymentModeName}
                  onChangeText={setPaymentModeName}
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
                  // Validate and save payment mode
                  console.log('Save payment mode:', {
                    paymentModeName
                  });
                  setShowAddPaymentModeModal(false);
                  setPaymentModeName('');
                }}
              >
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* </SafeAreaView> */}
      </Modal>

      {/* Template Modal */}
      <Modal
        visible={showTemplateModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <View style={[styles.modalOverlayFullscreen, { paddingTop: insets.top }]}>
          <View style={styles.modalContentFullscreen}>
            <View style={styles.modalHeaderFullscreen}>
              <TouchableOpacity
                onPress={() => {
                  setShowTemplateModal(false);
                }}
                style={styles.modalBackButton}
              >
                <Text style={styles.modalBackArrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitleFullscreen}>Sélectionner un modèle</Text>
            </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Templates Grid */}
        <View style={styles.templatesContainer}>
          {templates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={[
                styles.templateCard,
                selectedTemplate === template.id && styles.templateCardSelected,
              ]}
              onPress={() => handleTemplatePress(template.id)}
            >
              {/* Template Preview */}
              <View style={styles.templatePreview}>
                <Image source={sampleTemplateImage} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                {/* <View style={styles.documentContent}>
                  <View style={styles.docHeader} />
                  <View style={styles.docLine} />
                  <View style={styles.docLine} />
                  <View style={styles.docLine} />
                  <View style={styles.docLineShort} />
                </View> */}
              </View>

              {/* Checkmark Badge */}
              {selectedTemplate === template.id && (
                <View style={styles.checkmarkBadge}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              )}

              {/* Template Name */}
              {/* <Text style={styles.templateName}>{template.description}</Text> */}
            </TouchableOpacity>
          ))}
        </View>

        {/* Extra spacing for fixed button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Save Button */}
      <TouchableOpacity style={styles.fixedSaveButton} onPress={() => setShowTemplateModal(false)}>
        <Text style={styles.saveButtonText}>Terminer</Text>
      </TouchableOpacity>
          </View>
        </View>
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
  formContainer: {
    flex: 1,
  },
  formSection: {
    marginHorizontal: 20,
    marginTop: 20,
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


    templatesContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  templateCard: {
    width: '48%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  templateCardSelected: {
    borderWidth: 3,
    borderColor: '#0B5FA5',
  },
  templatePreview: {
    width: '100%',
    height: 300,
    backgroundColor: '#FFFFFF',
    padding: 16,
    justifyContent: 'flex-start',
  },
  documentContent: {
    flex: 1,
    width: '100%',
  },
  docHeader: {
    height: 30,
    backgroundColor: '#F0F0F0',
    marginBottom: 12,
    borderRadius: 4,
  },
  docLine: {
    height: 10,
    backgroundColor: '#F0F0F0',
    marginBottom: 8,
    borderRadius: 2,
  },
  docLineShort: {
    height: 10,
    backgroundColor: '#F0F0F0',
    width: '70%',
    borderRadius: 2,
  },
  checkmarkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0B5FA5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0B5FA5',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  checkmark: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  templateName: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingBottom: 16,
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
});

export default AddInvoice;