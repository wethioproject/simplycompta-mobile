import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import { downArrowIcon, fileIcon } from '../../assets/icons';
import { pick } from "@react-native-documents/picker";

const MyBusiness: React.FC = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();

  const businessTypeData = [
    { label: 'Un auto-entrepreneur', value: 'Un auto-entrepreneur' },
    { label: 'Une entreprise individuelle', value: 'Une entreprise individuelle' },
    { label: 'Une société', value: 'Une société' },
    { label: 'Une association', value: 'Une association' },
  ];

  const sectorData = [
    { label: 'Commerce', value: 'Commerce' },
    { label: 'Services', value: 'Services' },
    { label: 'Industrie', value: 'Industrie' },
    { label: 'Agriculture', value: 'Agriculture' },
    { label: 'Construction', value: 'Construction' },
    { label: 'Technologie', value: 'Technologie' },
  ];

  const sizeData = [
    { label: 'Micro-entreprise (1-10 employés)', value: 'Micro-entreprise (1-10 employés)' },
    { label: 'Petite entreprise (11-50 employés)', value: 'Petite entreprise (11-50 employés)' },
    { label: 'Moyenne entreprise (51-250 employés)', value: 'Moyenne entreprise (51-250 employés)' },
    { label: 'Grande entreprise (250+ employés)', value: 'Grande entreprise (250+ employés)' },
  ];

  const [businessType, setBusinessType] = useState('Un auto-entrepreneur');
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('Commerce');
  const [size, setSize] = useState('');
  const [rc, setRc] = useState('');
  const [ice, setIce] = useState('');
  const [IF, setIF] = useState('');
  const [cnss, setCnss] = useState('');
  const [tp, setTp] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fax, setFax] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [selected, setSelected] = useState(null);
  const [file, setFile] = useState<any>(null);
  const [showSectorModal, setShowSectorModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [sectorSearchQuery, setSectorSearchQuery] = useState('');
  const [sizeSearchQuery, setSizeSearchQuery] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [addressStreet, setAddressStreet] = useState('');
  const [addressPostalCode, setAddressPostalCode] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressCountry, setAddressCountry] = useState('');
  const [countrySearchQuery, setCountrySearchQuery] = useState('');

  const handleSave = () => {
    console.log('Form saved');
  };

  const handlePick = async () => {
    try {
      const [selectedFile] = await pick({
        allowMultiSelection: false,
      });

      setFile(selectedFile);
      console.log("Picked file:", selectedFile);
    } catch (err: any) {
      if (err?.code === "DOCUMENT_PICKER_CANCELED") {
        console.log("User cancelled picker");
      } else {
        console.log("Picker error:", err);
      }
    }
  };

  const filteredSectorData = sectorData.filter(item =>
    item.label.toLowerCase().includes(sectorSearchQuery.toLowerCase())
  );

  const filteredSizeData = sizeData.filter(item =>
    item.label.toLowerCase().includes(sizeSearchQuery.toLowerCase())
  );

  const handleSectorSelect = (item: any) => {
    setSector(item.value);
    setShowSectorModal(false);
    setSectorSearchQuery('');
  };

  const handleSizeSelect = (item: any) => {
    setSize(item.value);
    setShowSizeModal(false);
    setSizeSearchQuery('');
  };

  const countryData = [
    { label: 'Afghanistan', value: 'Afghanistan' },
    { label: 'Albanie', value: 'Albanie' },
    { label: 'Algérie', value: 'Algérie' },
    { label: 'Allemagne', value: 'Allemagne' },
    { label: 'Andorre', value: 'Andorre' },
    { label: 'Angola', value: 'Angola' },
    { label: 'Arabie Saoudite', value: 'Arabie Saoudite' },
    { label: 'Argentine', value: 'Argentine' },
    { label: 'Arménie', value: 'Arménie' },
    { label: 'Australie', value: 'Australie' },
    { label: 'Autriche', value: 'Autriche' },
    { label: 'Belgique', value: 'Belgique' },
    { label: 'Brésil', value: 'Brésil' },
    { label: 'Canada', value: 'Canada' },
    { label: 'Chine', value: 'Chine' },
    { label: 'Égypte', value: 'Égypte' },
    { label: 'Espagne', value: 'Espagne' },
    { label: 'États-Unis', value: 'États-Unis' },
    { label: 'France', value: 'France' },
    { label: 'Inde', value: 'Inde' },
    { label: 'Italie', value: 'Italie' },
    { label: 'Japon', value: 'Japon' },
    { label: 'Maroc', value: 'Maroc' },
    { label: 'Mexique', value: 'Mexique' },
    { label: 'Pays-Bas', value: 'Pays-Bas' },
    { label: 'Portugal', value: 'Portugal' },
    { label: 'Royaume-Uni', value: 'Royaume-Uni' },
    { label: 'Russie', value: 'Russie' },
    { label: 'Suisse', value: 'Suisse' },
    { label: 'Tunisie', value: 'Tunisie' },
  ];

  const filteredCountryData = countryData.filter(item =>
    item.label.toLowerCase().includes(countrySearchQuery.toLowerCase())
  );

  const handleCountrySelect = (item: any) => {
    setAddressCountry(item.value);
    setShowCountryModal(false);
    setCountrySearchQuery('');
  };

  const handleSaveAddress = () => {
    const fullAddress = `${addressStreet}, ${addressPostalCode} ${addressCity}, ${addressCountry}`;
    setAddress(fullAddress);
    setShowAddressModal(false);
  };



  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon entreprise</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Logo Upload Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Logo</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={handlePick}>
            <Image source={fileIcon} style={{ width: 18, height: 18, marginRight: 12, }} resizeMode="contain" />
            <Text style={styles.uploadText}>Cliquer ici pour choisir un fichier</Text>
          </TouchableOpacity>
        </View>

        {/* Business Type Dropdown */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Vous êtes <Text style={styles.required}>*</Text>
          </Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownText}
            selectedTextStyle={styles.dropdownText}
            data={businessTypeData}
            maxHeight={300}
            labelField="label"
            valueField="value"
            value={businessType}
            onChange={item => setBusinessType(item.value)}
            renderRightIcon={() => (
              <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
            )}
          />
        </View>

        {/* Company Name */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Raison sociale <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="Hishl"
            placeholderTextColor="#999999"
          />
        </View>

        {/* Sector Dropdown */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Secteur d'activité <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowSectorModal(true)}
          >
            <Text style={styles.dropdownText}>{sector}</Text>
            <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Size Dropdown */}
        <View style={styles.section}>
          <Text style={styles.label}>Taille</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowSizeModal(true)}
          >
            <Text style={[styles.dropdownText, !size && styles.placeholderText]}>
              {size || 'Sélectionner une taille'}
            </Text>
            <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* R.C and I.C.E Row */}
        <View style={styles.rowContainer}>
          <View style={styles.halfSection}>
            <Text style={styles.label}>R.C</Text>
            <TextInput
              style={styles.input}
              value={rc}
              onChangeText={setRc}
              placeholderTextColor="#999999"
            />
          </View>
          <View style={styles.halfSection}>
            <Text style={styles.label}>I.C.E</Text>
            <TextInput
              style={styles.input}
              value={ice}
              onChangeText={setIce}
              placeholderTextColor="#999999"
            />
          </View>
        </View>

        {/* I.F and C.N.S.S Row */}
        <View style={styles.rowContainer}>
          <View style={styles.halfSection}>
            <Text style={styles.label}>I.F</Text>
            <TextInput
              style={styles.input}
              value={IF}
              onChangeText={setIF}
              placeholderTextColor="#999999"
            />
          </View>
          <View style={styles.halfSection}>
            <Text style={styles.label}>C.N.S.S</Text>
            <TextInput
              style={styles.input}
              value={cnss}
              onChangeText={setCnss}
              placeholderTextColor="#999999"
            />
          </View>
        </View>

        {/* T.P */}
        <View style={styles.section}>
          <Text style={styles.label}>T.P</Text>
          <TextInput
            style={styles.input}
            value={tp}
            onChangeText={setTp}
            placeholderTextColor="#999999"
          />
        </View>

        {/* Email */}
        <View style={styles.section}>
          <Text style={styles.label}>E-mail</Text>
          <View style={styles.emailInput}>
            <Text style={styles.emailIcon}>@</Text>
            <TextInput
              style={styles.emailTextInput}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999999"
            />
          </View>
        </View>

        {/* Phone and Fax Row */}
        <View style={styles.rowContainer}>
          <View style={styles.halfSection}>
            <Text style={styles.label}>Téléphone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#999999"
            />
          </View>
          <View style={styles.halfSection}>
            <Text style={styles.label}>Fax</Text>
            <TextInput
              style={styles.input}
              value={fax}
              onChangeText={setFax}
              placeholder="3"
              placeholderTextColor="#999999"
            />
          </View>
        </View>

        {/* Website */}
        <View style={styles.section}>
          <Text style={styles.label}>Site Web</Text>
          <TextInput
            style={styles.input}
            value={website}
            onChangeText={setWebsite}
            autoCapitalize="none"
            placeholderTextColor="#999999"
          />
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.label}>Adresse du siège</Text>
          <TouchableOpacity 
            style={styles.addressButton}
            onPress={() => setShowAddressModal(true)}
          >
            <Image source={fileIcon} style={{ width: 18, height: 18, marginRight: 12 }} resizeMode="contain" />
            <Text style={[styles.addressText, !address && { color: '#333333' }]}>
              {address || 'Adresse du siège'}
            </Text>
            <Text style={styles.chevronIcon}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Extra spacing for fixed button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Save Button */}
      <TouchableOpacity style={styles.fixedSaveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Enregistrer</Text>
      </TouchableOpacity>

      {/* Sector Modal */}
      <Modal
        visible={showSectorModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowSectorModal(false)}
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
                onPress={() => setShowSectorModal(false)}
                style={styles.modalBackButton}
              >
                <Text style={styles.modalBackArrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitleFullscreen}>Secteur d'activité</Text>
              <View style={styles.placeholder} />
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Chercher..."
                placeholderTextColor="#AAAAAA"
                value={sectorSearchQuery}
                onChangeText={setSectorSearchQuery}
              />
              {sectorSearchQuery ? (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setSectorSearchQuery('')}
                >
                  <Text style={styles.clearButtonText}>×</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {filteredSectorData.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionItem}
                  onPress={() => handleSectorSelect(item)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Size Modal */}
      <Modal
        visible={showSizeModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowSizeModal(false)}
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
                onPress={() => setShowSizeModal(false)}
                style={styles.modalBackButton}
              >
                <Text style={styles.modalBackArrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitleFullscreen}>Taille</Text>
              <View style={styles.placeholder} />
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Chercher..."
                placeholderTextColor="#AAAAAA"
                value={sizeSearchQuery}
                onChangeText={setSizeSearchQuery}
              />
              {sizeSearchQuery ? (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setSizeSearchQuery('')}
                >
                  <Text style={styles.clearButtonText}>×</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {filteredSizeData.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionItem}
                  onPress={() => handleSizeSelect(item)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Address Modal */}
      <Modal
        visible={showAddressModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowAddressModal(false)}
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
                onPress={() => setShowAddressModal(false)}
                style={styles.modalBackButton}
              >
                <Text style={styles.modalBackArrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitleFullscreen}>Adresse du siège</Text>
              <View style={styles.placeholder} />
            </View>

            <ScrollView
              style={styles.formContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.section}>
                <Text style={styles.label}>
                  Adresse <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, styles.addressInput]}
                  value={addressStreet}
                  onChangeText={setAddressStreet}
                  placeholder=""
                  placeholderTextColor="#AAAAAA"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Code postal</Text>
                <TextInput
                  style={styles.input}
                  value={addressPostalCode}
                  onChangeText={setAddressPostalCode}
                  placeholder=""
                  placeholderTextColor="#AAAAAA"
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>
                  Ville <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={addressCity}
                  onChangeText={setAddressCity}
                  placeholder=""
                  placeholderTextColor="#AAAAAA"
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Pays</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowCountryModal(true)}
                >
                  <Text style={[styles.dropdownText, !addressCountry && styles.placeholderText]}>
                    {addressCountry || 'Sélectionner un pays'}
                  </Text>
                  <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
                </TouchableOpacity>
              </View>

              <View style={styles.bottomSpacer} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
                <Text style={styles.saveButtonText}>Terminé</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Country Modal */}
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
                onPress={() => setShowCountryModal(false)}
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
              {filteredCountryData.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionItem}
                  onPress={() => handleCountrySelect(item)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
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
    fontWeight: '500',
  },
  required: {
    color: '#E74C3C',
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D0D0D0',
    borderRadius: 4,
    paddingVertical: 25,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  uploadIcon: {
    fontSize: 18,
    marginBottom: 10,
  },
  uploadText: {
    fontSize: 14,
    color: '#999999',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 2,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333333',
  },
  placeholderText: {
    color: '#999999',
  },
  dropdownIcon: {
    width: 16,
    height: 16,
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
  rowContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  halfSection: {
    flex: 1,
  },
  emailInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 2,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  emailIcon: {
    fontSize: 20,
    color: '#999999',
    marginRight: 8,
  },
  emailTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    padding: 0,
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 2,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 16,
    color: '#4A90E2',
  },
  chevronIcon: {
    fontSize: 24,
    color: '#999999',
  },
  saveButton: {
    backgroundColor: '#0B5FA5',
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
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
  bottomSpacer: {
    height: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
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
  formContainer: {
    flex: 1,
  },
  addressInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  modalFooter: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
});

export default MyBusiness;