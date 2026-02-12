import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Image,
    TextInput,
} from 'react-native';
import { fileIcon, userIcon } from '../../assets/icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const Clients: React.FC = ({ navigation }: any) => {
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<TextInput>(null);
    const [clients] = useState([
        { id: 1, name: 'a barb' },
    ]);

    const handleClientPress = (client: any) => {
        console.log('Client pressed:', client);
        navigation.navigate('Client Detail', { client });
    };

    const getInitials = (name: string) => {
        return name.charAt(0).toLowerCase();
    };

    const handleAddClientPress = () => {
        navigation.navigate('Add Client');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {
                isSearchActive ? (
                    // Search Header
                    <View style={styles.searchHeader}>
                        <TouchableOpacity
                            onPress={() => {
                                setIsSearchActive(false);
                                setSearchQuery('');
                            }}
                            style={styles.searchBackButton}
                        >
                            <Text style={styles.searchBackArrow}>←</Text>
                        </TouchableOpacity>
                        <TextInput
                            ref={searchInputRef}
                            style={styles.searchInput}
                            placeholder="Chercher"
                            placeholderTextColor="#999999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setSearchQuery('')}
                                style={styles.clearButton}
                            >
                                <Text style={styles.clearButtonText}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    // Normal Header 
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.avatarButton}
                            onPress={() => navigation.openDrawer()}
                        >
                            <Image source={userIcon}
                                style={styles.avatar}
                                resizeMode="contain" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Clients</Text>
                        <TouchableOpacity style={styles.searchButton} onPress={() => setIsSearchActive(true)}>
                            <Image
                                source={fileIcon}
                                style={[styles.icon, { tintColor: '#0B5FA5' }]}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    </View>
                )
            }

            {/* Clients List */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {clients.map((client) => (
                    <TouchableOpacity
                        key={client.id}
                        style={styles.clientItem}
                        onPress={() => handleClientPress(client)}
                    >
                        <View style={styles.clientAvatar}>
                            <Text style={styles.clientInitial}>{getInitials(client.name)}</Text>
                        </View>
                        <Text style={styles.clientName}>{client.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* FAB Button */}
            <TouchableOpacity style={styles.fab} onPress={handleAddClientPress}>
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    avatarButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E5E5E5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 24,
        height: 24,
        tintColor: '#999999',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
        flex: 1,
        textAlign: 'center',
    },
    searchButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: 24,
        height: 24,
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContent: {
        // paddingHorizontal: 20,
        // paddingTop: 20,
    },
    clientItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        marginBottom: 1,
    },
    clientAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#C5D5E4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    clientInitial: {
        fontSize: 24,
        color: '#FFFFFF',
        fontWeight: '400',
    },
    clientName: {
        fontSize: 18,
        color: '#333333',
        fontWeight: '400',
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 20,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#0B5FA5',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0B5FA5',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabIcon: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: '300',
    },
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        gap: 12,
    },
    searchBackButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchBackArrow: {
        fontSize: 24,
        color: '#0B5FA5',
        fontWeight: '600',
    },
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        color: '#333333',
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    clearButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearButtonText: {
        fontSize: 20,
        color: '#0B5FA5',
        fontWeight: '600',
    },
});

export default Clients;
