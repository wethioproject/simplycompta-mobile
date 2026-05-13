import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Platform,
    Modal,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fileIcon } from '../../assets/icons';
import * as DocumentPicker from '@react-native-documents/picker';
import { useBankStatement } from '../../hooks/useBankStatement';
import { useSelector } from 'react-redux';

const AddBankStatement: React.FC = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { createBankStatement } = useBankStatement();
    const user = useSelector((state: any) => state.user.customer);
    console.log('current userrrr101', user);
    // Bank Statement fields
    const [monthYear, setMonthYear] = useState('');
    const [statementFile, setStatementFile] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());

    const handleFilePick = async () => {
        try {
            const result = await DocumentPicker.pick({
                type: [DocumentPicker.types.pdf],
                copyTo: 'cachesDirectory',
            });
            
            if (result && result[0]) {
                setStatementFile(result[0]);
                console.log('File picked:', result[0]);
            }
        } catch (error: any) {
            if (error?.code === 'DOCUMENT_PICKER_CANCELED') {
                console.log('User cancelled file picker');
            } else {
                console.error('Error picking file:', error);
                Alert.alert('Erreur', 'Impossible de sélectionner le fichier');
            }
        }
    };

    const handleRemoveFile = () => {
        setStatementFile(null);
    };

    const formatMonthYear = (date: Date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}-${year}`;
    };

    const handleSave = async () => {
        // Validation
        if (!monthYear) {
            Alert.alert('Erreur', 'Veuillez sélectionner le mois et l\'année');
            return;
        }
        
        if (!statementFile) {
            Alert.alert('Erreur', 'Veuillez sélectionner un relevé bancaire');
            return;
        }
        console.log('current userrrr102', user);
        if (!user?.customer_id) {
            Alert.alert('Erreur', 'Utilisateur non trouvé');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                customer_id: user.id.toString(),
                month_year: monthYear,
                statement: statementFile,
            };

            console.log('Submitting bank statement:', payload);
            const result = await createBankStatement(payload);

            if (result.success) {
                Alert.alert(
                    'Succès',
                    'Relevé bancaire téléchargé avec succès',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack(),
                        },
                    ]
                );
            } else {
                Alert.alert('Erreur', result.error || 'Échec du téléchargement');
            }
        } catch (error) {
            console.error('Error uploading bank statement:', error);
            Alert.alert('Erreur', 'Une erreur s\'est produite lors du téléchargement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ajouter Relevé Bancaire</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Month/Year Selection */}
                <View style={styles.section}>
                    <Text style={styles.label}>
                        Mois et Année <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={styles.inputWithIcon}
                        onPress={() => {
                            setTempDate(monthYear ? new Date(parseInt(monthYear.split('-')[1]), parseInt(monthYear.split('-')[0]) - 1) : new Date());
                            setShowMonthYearPicker(true);
                        }}
                    >
                        <Image source={fileIcon} style={styles.calendarIcon} resizeMode="contain" />
                        <Text style={[styles.dateText, !monthYear && styles.placeholderText]}>
                            {monthYear ? (() => {
                                const [month, year] = monthYear.split('-');
                                const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
                                return `${months[parseInt(month) - 1]} ${year}`;
                            })() : 'Sélectionner le mois et l\'année'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Statement File Upload */}
                <View style={styles.section}>
                    <Text style={styles.label}>
                        Relevé Bancaire (PDF) <Text style={styles.required}>*</Text>
                    </Text>
                    {statementFile ? (
                        <View style={styles.filePreviewContainer}>
                            <View style={styles.filePreview}>
                                <Image source={fileIcon} style={styles.fileIconSmall} resizeMode="contain" />
                                <Text style={styles.fileName} numberOfLines={1}>
                                    {statementFile.name}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.removeFileButton}
                                onPress={handleRemoveFile}
                            >
                                <Text style={styles.removeFileText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.uploadButton}
                            onPress={handleFilePick}
                        >
                            <Image source={fileIcon} style={styles.uploadIcon} resizeMode="contain" />
                            <Text style={styles.uploadButtonText}>Sélectionner un fichier PDF</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Fixed Save Button */}
            <View style={styles.fixedButtonContainer}>
                <TouchableOpacity 
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>Enregistrer</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Month/Year Picker Modal */}
            {Platform.OS === 'ios' ? (
                <Modal
                    visible={showMonthYearPicker}
                    transparent={true}
                    animationType="slide"
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text
                                    style={styles.modalCancelButton}
                                    onPress={() => setShowMonthYearPicker(false)}
                                >
                                    Annuler
                                </Text>
                                <Text style={styles.modalTitle}>Sélectionner le mois</Text>
                                <Text
                                    style={styles.modalConfirmButton}
                                    onPress={() => {
                                        setMonthYear(formatMonthYear(tempDate));
                                        setShowMonthYearPicker(false);
                                    }}
                                >
                                    Valider
                                </Text>
                            </View>
                            <DateTimePicker
                                value={tempDate}
                                mode="date"
                                display="spinner"
                                onChange={(event, selectedDate) => {
                                    if (selectedDate) {
                                        setTempDate(selectedDate);
                                    }
                                }}
                                style={styles.datePicker}
                            />
                        </View>
                    </View>
                </Modal>
            ) : (
                showMonthYearPicker && (
                    <DateTimePicker
                        value={tempDate}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowMonthYearPicker(false);
                            if (selectedDate) {
                                setMonthYear(formatMonthYear(selectedDate));
                            }
                        }}
                    />
                )
            )}
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
    dateText: {
        flex: 1,
        fontSize: 16,
        color: '#333333',
    },
    placeholderText: {
        fontSize: 16,
        color: '#AAAAAA',
    },
    filePreviewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 2,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    filePreview: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    fileIconSmall: {
        width: 20,
        height: 20,
        tintColor: '#0B5FA5',
        marginRight: 12,
    },
    fileName: {
        fontSize: 14,
        color: '#333333',
        flex: 1,
    },
    removeFileButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeFileText: {
        fontSize: 20,
        color: '#E74C3C',
        fontWeight: '600',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#0B5FA5',
        borderRadius: 2,
        paddingHorizontal: 20,
        paddingVertical: 14,
        justifyContent: 'center',
    },
    uploadIcon: {
        width: 20,
        height: 20,
        tintColor: '#0B5FA5',
        marginRight: 12,
    },
    uploadButtonText: {
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
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
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
});

export default AddBankStatement;
