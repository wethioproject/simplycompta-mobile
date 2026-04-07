// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   TextInput,
//   Modal,
//   Platform,
//   ActivityIndicator,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { fileIcon, userIcon, downArrowIcon } from '../../assets/icons';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { useTransaction } from '../../hooks/useTransaction';

// type TabType = 'Toutes' | 'Brouillon' | 'Validée' | 'A recevoir';

// interface Transaction {
//   id: number;
//   type: 'expense' | 'income';
//   transaction_date: string;
//   amount: string;
//   customer_id: number;
//   account_id: number;
//   category_id: number;
//   description: string;
//   reference: string;
//   attachment_path: string | null;
//   created_at: string;
//   updated_at: string;
//   account: {
//     id: number;
//     holder_name: string;
//   };
//   category: {
//     id: number;
//     name: string;
//   };
// }

// const CLIENT_OPTIONS = [
//   'Test client 1',
//   'Test client 2',
//   'Test client 3',
// ];

// const Transactions: React.FC = ({ navigation }: any) => {
//   const { getTransactions } = useTransaction();
//   const insets = useSafeAreaInsets();
//   const [activeTab, setActiveTab] = useState<TabType>('Toutes');
//   const [isSearchActive, setIsSearchActive] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const searchInputRef = useRef<TextInput>(null);

//   const [client, setClient] = useState('');
//   const [showFilterModal, setShowFilterModal] = useState(false);
//   const [showSelectClientModal, setShowSelectClientModal] = useState(false);
//   const [clientSearchQuery, setClientSearchQuery] = useState('');
//   const [duDate, setDuDate] = useState(new Date(2026, 0, 29));
//   const [showDuDatePicker, setShowDuDatePicker] = useState(false);
//   const [tempDuDate, setTempDuDate] = useState(new Date(2026, 0, 29));
//   const [auDate, setAuDate] = useState(new Date(2026, 0, 29));
//   const [showAuDatePicker, setShowAuDatePicker] = useState(false);
//   const [tempAuDate, setTempAuDate] = useState(new Date(2026, 0, 29));
//   const [isAlreadySent, setIsAlreadySent] = useState(true);
  
//   // Transactions state
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   useEffect(() => {
//     fetchTransactions();
//   }, []);

//   const fetchTransactions = async () => {
//     try {
//       setLoading(true);
//       const result = await getTransactions();
//       if (result.success && result.transactions) {
//         setTransactions(result.transactions);
//       }
//     } catch (err) {
//       console.error('Error fetching transactions:', err);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchTransactions();
//   };

//   const formatDate = (date: Date) => {
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   const formatTransactionDate = (dateString: string) => {
//     const date = new Date(dateString);
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   const formatAmount = (amount: string) => {
//     return parseFloat(amount).toFixed(2).replace('.', ',');
//   };

//   const getTransactionStatus = (transaction: Transaction) => {
//     return transaction.type === 'expense' ? 'Dépense' : 'Revenu';
//   };

//   const getStatusColor = (transaction: Transaction) => {
//     return transaction.type === 'expense' ? '#333333' : '#3cebba';
//   };

//   const handleAddInvoice = () => {
//     console.log('Add new invoice');
//   };

//   const handleInvoicePress = (invoice: any) => {
//     navigation.navigate('Invoice Detail', { invoice });
//   };

//   const handleClientSelect = (option: string) => {
//     setClient(option);
//     setShowSelectClientModal(false);
//     setClientSearchQuery('');
//   };

//   const filteredClientOptions = CLIENT_OPTIONS.filter(option =>
//     option.toLowerCase().includes(clientSearchQuery.toLowerCase())
//   );

//   return (
//     <SafeAreaView style={styles.container} edges={['top']}>
//       {/* Header */}
//       {isSearchActive ? (
//         // Search Header
//         <View style={styles.searchHeader}>
//           <TouchableOpacity
//             onPress={() => {
//               setIsSearchActive(false);
//               setSearchQuery('');
//             }}
//             style={styles.searchBackButton}
//           >
//             <Text style={styles.searchBackArrow}>←</Text>
//           </TouchableOpacity>
//           <TextInput
//             ref={searchInputRef}
//             style={styles.searchInput}
//             placeholder="Chercher"
//             placeholderTextColor="#999999"
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             autoFocus
//           />
//           {searchQuery.length > 0 && (
//             <TouchableOpacity
//               onPress={() => setSearchQuery('')}
//               style={styles.clearButton}
//             >
//               <Text style={styles.clearButtonText}>✕</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       ) : (
//         // Normal Header
//         <View style={styles.header}>
//           <TouchableOpacity
//             style={styles.avatarButton}
//             onPress={() => navigation.openDrawer()}
//           >
//             <Image source={userIcon}
//               style={styles.avatar}
//               resizeMode="contain" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Transactions</Text>
//           <View style={styles.headerIcons}>
//             {/* filter icon */}
//             <TouchableOpacity style={styles.iconButton} onPress={() => setShowFilterModal(true)}>
//               <Image
//                 source={fileIcon}
//                 style={[styles.icon, { tintColor: '#0B5FA5' }]}
//                 resizeMode="contain"
//               />
//             </TouchableOpacity>
//             {/* search icon */}
//             <TouchableOpacity
//               style={styles.iconButton}
//               onPress={() => setIsSearchActive(true)}
//             >
//               <Image
//                 source={fileIcon}
//                 style={[styles.icon, { tintColor: '#0B5FA5' }]}
//                 resizeMode="contain"
//               />
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}

//       {/* Tabs */}
//       <View style={styles.tabsContainer}>
//         <TouchableOpacity
//           style={styles.tab}
//           onPress={() => setActiveTab('Toutes')}
//         >
//           <Text
//             style={[
//               styles.tabText,
//               activeTab === 'Toutes' && styles.activeTabText,
//             ]}
//           >
//             Toutes
//           </Text>
//           {activeTab === 'Toutes' && <View style={styles.tabIndicator} />}
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.tab}
//           onPress={() => setActiveTab('Brouillon')}
//         >
//           <Text
//             style={[
//               styles.tabText,
//               activeTab === 'Brouillon' && styles.activeTabText,
//             ]}
//           >
//             Brouillon
//           </Text>
//           {activeTab === 'Brouillon' && <View style={styles.tabIndicator} />}
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.tab}
//           onPress={() => setActiveTab('Validée')}
//         >
//           <Text
//             style={[
//               styles.tabText,
//               activeTab === 'Validée' && styles.activeTabText,
//             ]}
//           >
//             Validée
//           </Text>
//           {activeTab === 'Validée' && <View style={styles.tabIndicator} />}
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.tab}
//           onPress={() => setActiveTab('A recevoir')}
//         >
//           <Text
//             style={[
//               styles.tabText,
//               activeTab === 'A recevoir' && styles.activeTabText,
//             ]}
//           >
//             A recevoir
//           </Text>
//           {activeTab === 'A recevoir' && <View style={styles.tabIndicator} />}
//         </TouchableOpacity>
//       </View>

//       {/* Invoices List */}
//       <ScrollView
//         style={styles.scrollView}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//         // refreshControl={
//         //   <View style={{ paddingTop: 20 }}>
//         //     {refreshing && <ActivityIndicator size="small" color="#0B5FA5" />}
//         //   </View>
//         // }
//         onScroll={(e) => {
//           const offsetY = e.nativeEvent.contentOffset.y;
//           if (offsetY < -50 && !refreshing) {
//             onRefresh();
//           }
//         }}
//         scrollEventThrottle={16}
//       >
//         {loading ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#0B5FA5" />
//             <Text style={styles.loadingText}>Chargement...</Text>
//           </View>
//         ) : transactions.length === 0 ? (
//           <View style={styles.emptyContainer}>
//             <Text style={styles.emptyText}>Aucune transaction trouvée</Text>
//             <Text style={styles.emptySubText}>Ajoutez votre première transaction</Text>
//           </View>
//         ) : (
//           transactions.map((transaction) => (
//             <TouchableOpacity
//               key={transaction.id}
//               style={styles.invoiceCard}
//               onPress={() => handleInvoicePress(transaction)}
//             >
//               <View style={styles.invoiceLeft}>
//                 <Text style={styles.clientName}>{transaction.category.name}</Text>
//                 <Text style={styles.invoiceNumber}>{transaction.reference || 'N/A'}</Text>
//                 <View
//                   style={[
//                     styles.statusBadge,
//                     { backgroundColor: getStatusColor(transaction) },
//                   ]}
//                 >
//                   <Text style={styles.statusText}>{getTransactionStatus(transaction)}</Text>
//                 </View>
//               </View>
//               <View style={styles.invoiceRight}>
//                 <Text style={styles.amount}>
//                   {formatAmount(transaction.amount)} MAD
//                 </Text>
//                 <Text style={styles.date}>{formatTransactionDate(transaction.transaction_date)}</Text>
//               </View>
//             </TouchableOpacity>
//           ))
//         )}
//       </ScrollView>

//       {/* FAB Button */}
//       <TouchableOpacity
//         style={styles.fab}
//         onPress={() => navigation.navigate('Add Transaction')}
//       >
//         <Text style={styles.fabIcon}>+</Text>
//       </TouchableOpacity>


//       {/* Add Filter Modal */}
//       <Modal
//         visible={showFilterModal}
//         transparent={false}
//         animationType="slide"
//         onRequestClose={() => setShowFilterModal(false)}
//       >
//         <View
//           style={[
//             styles.modalOverlayFullscreen,
//             { paddingTop: insets.top }
//           ]}
//         >

//           {/* <SafeAreaView style={styles.modalOverlayFullscreen} edges={['top']}> */}
//           <View style={styles.modalContentFullscreen}>
//             <View style={styles.modalHeaderFullscreen}>
//               <TouchableOpacity
//                 onPress={() => {
//                   setShowFilterModal(false);
//                 }}
//                 style={styles.modalBackButton}
//               >
//                 <Text style={styles.modalBackArrow}>←</Text>
//               </TouchableOpacity>
//               <Text style={styles.modalTitleFullscreen}>Les filtres</Text>
//               <View style={styles.placeholder} />
//             </View>

//             <ScrollView
//               style={styles.formContainer}
//               keyboardShouldPersistTaps="handled"
//               showsVerticalScrollIndicator={false}
//             >

//               {/* Client */}
//               <View style={styles.formSection}>
//                 <Text style={styles.label}>
//                   Client <Text style={styles.required}>*</Text>
//                 </Text>
//                 <TouchableOpacity
//                   style={styles.inputWithIcon}
//                   onPress={() => {
//                     setShowFilterModal(false);
//                     setTimeout(() => {
//                       setShowSelectClientModal(true);
//                     }, 300);
//                   }}
//                 >
//                   <Text style={styles.dateText}>{client || 'Sélectionner un client'}</Text>
//                   <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.rowSection}>
//                 {/* Du */}
//                 <View style={styles.halfSection}>
//                   <Text style={styles.label}>
//                     Du
//                   </Text>
//                   <TouchableOpacity
//                     style={styles.inputWithIcon}
//                     onPress={() => {
//                       setTempDuDate(duDate);
//                       setShowFilterModal(false);
//                       setTimeout(() => {
//                         setShowDuDatePicker(true);
//                       }, 300)

//                     }}
//                   >
//                     <Image source={fileIcon} style={styles.calendarIcon} resizeMode="contain" />
//                     <Text style={styles.dateText}>{formatDate(duDate)}</Text>
//                   </TouchableOpacity>
//                 </View>

//                 {/* Au */}
//                 <View style={styles.halfSection}>
//                   <Text style={styles.label}>
//                     Au
//                   </Text>
//                   <TouchableOpacity
//                     style={styles.inputWithIcon}
//                     onPress={() => {
//                       setTempAuDate(auDate);
//                       setShowFilterModal(false);
//                       setTimeout(() => {
//                         setShowAuDatePicker(true);
//                       }, 300)

//                     }}
//                   >
//                     <Image source={fileIcon} style={styles.calendarIcon} resizeMode="contain" />
//                     <Text style={styles.dateText}>{formatDate(auDate)}</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>

//               {/* Already Sent Toggle */}
//               <View style={styles.toggleSection}>
//                 <Text style={styles.toggleLabel}>Déjà envoyée</Text>
//                 <TouchableOpacity
//                   style={[styles.toggle, isAlreadySent && styles.toggleActive]}
//                   onPress={() => setIsAlreadySent(!isAlreadySent)}
//                 >
//                   <View
//                     style={[styles.toggleThumb, isAlreadySent && styles.toggleThumbActive]}
//                   />
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.bottomSpacer} />
//             </ScrollView>

//             {/* Fixed Effacer & Chercher Button */}
//             <View style={styles.fixedButtons}>
//               <TouchableOpacity style={styles.fixedEraseButton}>
//                 <Text style={styles.eraseButtonText}>Effacer</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.fixedSeekButton}>
//                 <Text style={styles.seekButtonText}>Chercher</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//         {/* </SafeAreaView> */}
//       </Modal>

//       {/* Sélectionner un client Modal */}
//       <Modal
//         visible={showSelectClientModal}
//         transparent={false}
//         animationType="slide"
//         onRequestClose={() => setShowSelectClientModal(false)}
//       >
//         {/* <SafeAreaView style={styles.modalOverlayFullscreen} edges={['top']}> */}
//         <View
//           style={[
//             styles.modalOverlayFullscreen,
//             { paddingTop: insets.top }
//           ]}
//         >

//           <View style={styles.modalContentFullscreen}>
//             <View style={styles.modalHeaderFullscreen}>
//               <TouchableOpacity
//                 onPress={() => {
//                   setShowSelectClientModal(false);
//                   setClientSearchQuery('');
//                   setTimeout(() => {
//                     setShowFilterModal(true);
//                   }, 300);
//                 }}
//                 style={styles.modalBackButton}
//               >
//                 <Text style={styles.modalBackArrow}>←</Text>
//               </TouchableOpacity>
//               <Text style={styles.modalTitleFullscreen}>Sélectionner un client</Text>
//             </View>

//             <View style={styles.searchContainer}>
//               <TextInput
//                 style={styles.searchInputModal}
//                 placeholder="Chercher"
//                 placeholderTextColor="#AAAAAA"
//                 value={clientSearchQuery}
//                 onChangeText={setClientSearchQuery}
//               />
//               {clientSearchQuery.length > 0 && (
//                 <TouchableOpacity
//                   onPress={() => setClientSearchQuery('')}
//                   style={styles.clearButton}
//                 >
//                   <Text style={styles.clearButtonText}>✕</Text>
//                 </TouchableOpacity>
//               )}
//             </View>

//             <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
//               {filteredClientOptions.map((option, index) => (
//                 <TouchableOpacity
//                   key={index}
//                   style={styles.optionItem}
//                   onPress={() => {
//                     handleClientSelect(option)
//                     setTimeout(() => {
//                       setShowFilterModal(true);
//                     }, 300);
//                   }}
//                 >
//                   <Text style={styles.optionText}>{option}</Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         </View>
//         {/* </SafeAreaView> */}
//       </Modal>

//       {/* Date Picker */}
//       {Platform.OS === 'ios' ? (
//         <Modal
//           visible={showDuDatePicker}
//           transparent={true}
//           animationType="slide"
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContent}>
//               <View style={styles.modalHeader}>
//                 <TouchableOpacity onPress={() => {
//                   setShowDuDatePicker(false)
//                   setTimeout(() => {
//                     setShowFilterModal(true);
//                   }, 300);
//                 }}>
//                   <Text style={styles.modalCancelButton}>Annuler</Text>
//                 </TouchableOpacity>
//                 <Text style={styles.modalTitle}>Du</Text>
//                 <TouchableOpacity
//                   onPress={() => {
//                     setDuDate(tempDuDate);
//                     setShowDuDatePicker(false);
//                     setTimeout(() => {
//                       setShowFilterModal(true);
//                     }, 300);
//                   }}
//                 >
//                   <Text style={styles.modalConfirmButton}>OK</Text>
//                 </TouchableOpacity>
//               </View>
//               <DateTimePicker
//                 value={tempDuDate}
//                 mode="date"
//                 display="spinner"
//                 onChange={(event, selectedDate) => {
//                   if (selectedDate) {
//                     setTempDuDate(selectedDate);
//                   }
//                 }}
//                 style={styles.datePicker}
//               />
//             </View>
//           </View>
//         </Modal>
//       ) : (
//         showDuDatePicker && (
//           <DateTimePicker
//             value={duDate}
//             mode="date"
//             display="default"
//             onChange={(event, selectedDate) => {
//               setShowDuDatePicker(false);
//               if (selectedDate) {
//                 setDuDate(selectedDate);
//               }
//             }}
//           />
//         )
//       )}

//       {/* Date Picker */}
//       {Platform.OS === 'ios' ? (
//         <Modal
//           visible={showAuDatePicker}
//           transparent={true}
//           animationType="slide"
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContent}>
//               <View style={styles.modalHeader}>
//                 <TouchableOpacity onPress={() => {
//                   setShowAuDatePicker(false)
//                   setTimeout(() => {
//                     setShowFilterModal(true);
//                   }, 300);
//                 }}>
//                   <Text style={styles.modalCancelButton}>Annuler</Text>
//                 </TouchableOpacity>
//                 <Text style={styles.modalTitle}>Au</Text>
//                 <TouchableOpacity
//                   onPress={() => {
//                     setAuDate(tempAuDate);
//                     setShowAuDatePicker(false);
//                     setTimeout(() => {
//                       setShowFilterModal(true);
//                     }, 300);
//                   }}
//                 >
//                   <Text style={styles.modalConfirmButton}>OK</Text>
//                 </TouchableOpacity>
//               </View>
//               <DateTimePicker
//                 value={tempAuDate}
//                 mode="date"
//                 display="spinner"
//                 onChange={(event, selectedDate) => {
//                   if (selectedDate) {
//                     setTempAuDate(selectedDate);
//                   }
//                 }}
//                 style={styles.datePicker}
//               />
//             </View>
//           </View>
//         </Modal>
//       ) : (
//         showAuDatePicker && (
//           <DateTimePicker
//             value={auDate}
//             mode="date"
//             display="default"
//             onChange={(event, selectedDate) => {
//               setShowAuDatePicker(false);
//               if (selectedDate) {
//                 setAuDate(selectedDate);
//               }
//             }}
//           />
//         )
//       )}
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     backgroundColor: '#FFFFFF',
//   },
//   avatarButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#E5E5E5',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   avatar: {
//     width: 24,
//     height: 24,
//     tintColor: '#999999',
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333333',
//     flex: 1,
//     textAlign: 'center',
//   },
//   headerIcons: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   iconButton: {
//     width: 28,
//     height: 28,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   icon: {
//     width: 24,
//     height: 24,
//   },
//   tabsContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E5E5',
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 12,
//     alignItems: 'center',
//     position: 'relative',
//   },
//   tabText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#CCCCCC',
//   },
//   activeTabText: {
//     color: '#0B5FA5',
//     fontWeight: '600',
//   },
//   tabIndicator: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 3,
//     backgroundColor: '#0B5FA5',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     padding: 0,
//   },
//   invoiceCard: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     backgroundColor: '#FFFFFF',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E5E5',
//   },
//   invoiceLeft: {
//     flex: 1,
//   },
//   clientName: {
//     fontSize: 16,
//     color: '#333333',
//     fontWeight: '500',
//     marginBottom: 4,
//   },
//   invoiceNumber: {
//     fontSize: 14,
//     color: '#999999',
//     marginBottom: 8,
//   },
//   statusBadge: {
//     alignSelf: 'flex-start',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 1,
//   },
//   statusText: {
//     fontSize: 12,
//     color: '#FFFFFF',
//     fontWeight: '500',
//   },
//   invoiceRight: {
//     alignItems: 'flex-end',
//   },
//   amount: {
//     fontSize: 16,
//     color: '#333333',
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   date: {
//     fontSize: 14,
//     color: '#999999',
//   },
//   fab: {
//     position: 'absolute',
//     right: 24,
//     bottom: 20,
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: '#0B5FA5',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#0B5FA5',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   fabIcon: {
//     fontSize: 32,
//     color: '#FFFFFF',
//     fontWeight: '300',
//   },
//   // Modal Styles
//   modalOverlayFullscreen: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   modalContentFullscreen: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   modalHeaderFullscreen: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     backgroundColor: '#FFFFFF',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E5E5',
//   },
//   modalBackButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'flex-start',
//   },
//   modalBackArrow: {
//     fontSize: 28,
//     color: '#0B5FA5',
//     fontWeight: '600',
//   },
//   modalTitleFullscreen: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333333',
//     flex: 1,
//     textAlign: 'center',
//     marginRight: 40,
//   },
//   placeholder: {
//     width: 40,
//   },
//   formContainer: {
//     flex: 1,
//   },
//   formSection: {
//     marginHorizontal: 20,
//     marginTop: 20,
//   },
//   label: {
//     fontSize: 16,
//     color: '#333333',
//     marginBottom: 8,
//     fontWeight: '400',
//   },
//   required: {
//     color: '#E74C3C',
//   },
//   inputWithIcon: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     borderWidth: 1,
//     borderColor: '#E5E5E5',
//     borderRadius: 2,
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//   },
//   dateText: {
//     flex: 1,
//     fontSize: 16,
//     color: '#333333',
//   },
//   dropdownIcon: {
//     width: 16,
//     height: 16,
//   },
//   rowSection: {
//     flexDirection: 'row',
//     marginHorizontal: 20,
//     marginTop: 20,
//     gap: 12,
//   },
//   halfSection: {
//     flex: 1,
//   },
//   calendarIcon: {
//     width: 20,
//     height: 20,
//     tintColor: '#999999',
//     marginRight: 8,
//   },
//   toggleSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginHorizontal: 20,
//     marginTop: 20,
//   },
//   toggleLabel: {
//     fontSize: 16,
//     color: '#333333',
//     fontWeight: '400',
//   },
//   toggle: {
//     width: 51,
//     height: 31,
//     borderRadius: 15.5,
//     backgroundColor: '#E5E5E5',
//     padding: 2,
//     justifyContent: 'center',
//   },
//   toggleActive: {
//     backgroundColor: '#0B5FA5',
//   },
//   toggleThumb: {
//     width: 27,
//     height: 27,
//     borderRadius: 13.5,
//     backgroundColor: '#FFFFFF',
//     alignSelf: 'flex-start',
//   },
//   toggleThumbActive: {
//     alignSelf: 'flex-end',
//   },
//   bottomSpacer: {
//     height: 100,
//   },

//   eraseButtonText: {
//     color: '#0B5FA5',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   seekButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   fixedButtons: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     paddingHorizontal: 16,
//     paddingVertical: 40,
//     backgroundColor: '#FFFFFF',
//     borderTopWidth: 1,
//     borderTopColor: '#E5E5E5',
//   },
//   fixedEraseButton: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//     paddingVertical: 12,
//     borderRadius: 6,
//     alignItems: 'center',
//     shadowColor: '#0B5FA5',
//     borderWidth: 1,
//     borderColor: '#0B5FA5',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   fixedSeekButton: {
//     flex: 1,
//     backgroundColor: '#0B5FA5',
//     paddingVertical: 12,
//     borderRadius: 6,
//     alignItems: 'center',
//     shadowColor: '#0B5FA5',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F8F8F8',
//     marginHorizontal: 20,
//     marginTop: 16,
//     marginBottom: 8,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#E5E5E5',
//     paddingHorizontal: 16,
//   },
//   searchInputModal: {
//     flex: 1,
//     fontSize: 16,
//     color: '#333333',
//     paddingVertical: 12,
//   },
//   clearButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   clearButtonText: {
//     fontSize: 20,
//     color: '#0B5FA5',
//     fontWeight: '600',
//   },
//   optionsList: {
//     flex: 1,
//     marginTop: 8,
//   },
//   optionItem: {
//     backgroundColor: '#FFFFFF',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E5E5',
//   },
//   optionText: {
//     fontSize: 16,
//     color: '#333333',
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: {
//     backgroundColor: '#FFFFFF',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingBottom: 20,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E5E5',
//   },
//   modalTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333333',
//     flex: 1,
//     textAlign: 'center',
//   },
//   modalCancelButton: {
//     fontSize: 16,
//     color: '#999999',
//     width: 70,
//   },
//   modalConfirmButton: {
//     fontSize: 16,
//     color: '#0B5FA5',
//     fontWeight: '600',
//     width: 70,
//     textAlign: 'right',
//   },
//   datePicker: {
//     alignSelf: 'center',
//     width: '100%',
//   },
//   searchHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E5E5',
//     gap: 12,
//   },
//   searchBackButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   searchBackArrow: {
//     fontSize: 24,
//     color: '#0B5FA5',
//     fontWeight: '600',
//   },
//   searchInput: {
//     flex: 1,
//     height: 40,
//     backgroundColor: '#F5F5F5',
//     borderRadius: 8,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     fontSize: 16,
//     color: '#333333',
//     borderWidth: 1,
//     borderColor: '#E5E5E5',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 60,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: '#666666',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 60,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333333',
//     marginBottom: 8,
//   },
//   emptySubText: {
//     fontSize: 14,
//     color: '#999999',
//   },
// });

// export default Transactions;
