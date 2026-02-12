import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fileIcon } from '../../assets/icons';
import { useNotification } from '../../hooks/useNotification';
import { Notification } from '../../services/notificationService';
import { Image } from 'react-native';

const Notifications: React.FC = ({ navigation }: any) => {
    const { notification } = useNotification();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const result = await notification();
            if (result.success && result.notifications) {
                setNotifications(result.notifications);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Format timestamp to relative time
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds

        if (diff < 60) return 'À l\'instant';
        if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
        if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} j`;
        
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    const renderNotification = ({ item }: { item: Notification }) => (
        <TouchableOpacity 
            style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Notification Detail', { notificationId: item.id })}
        >
            {/* Unread Indicator Dot */}
            {!item.is_read && <View style={styles.unreadDot} />}

            <View style={styles.notificationContent}>
                {/* Title and Time */}
                <View style={styles.headerRow}>
                    <Text style={styles.title} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text style={styles.time}>{formatTime(item.created_at)}</Text>
                </View>

                {/* Message */}
                <Text style={styles.message} numberOfLines={2}>
                    {item.message}
                </Text>

                {/* Document Indicator */}
                {item.document && (
                    <View style={styles.documentRow}>
                        <Image source={fileIcon} style={styles.fileIcon} />
                        <Text style={styles.documentText}>Document joint</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0B5FA5" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={styles.headerSpacer} />
            </View>

            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#0B5FA5"
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Aucune notification</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 4,
        marginRight: 8,
    },
    backIcon: {
        fontSize: 28,
        color: '#0B5FA5',
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        // color: '#0B5FA5',
        flex: 1,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 36,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
    },
    notificationCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        position: 'relative',
    },
    unreadCard: {
        backgroundColor: '#F0F2FF',
        borderLeftWidth: 4,
        borderLeftColor: '#0B5FA5',
    },
    unreadDot: {
        position: 'absolute',
        top: 16,
        left: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#0B5FA5',
    },
    notificationContent: {
        paddingLeft: 8,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0B5FA5',
        flex: 1,
        marginRight: 8,
    },
    time: {
        fontSize: 12,
        color: '#999999',
    },
    message: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 20,
        marginBottom: 8,
    },
    documentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    fileIcon: {
        width: 16,
        height: 16,
        marginRight: 6,
        tintColor: '#0B5FA5',
    },
    documentText: {
        fontSize: 13,
        color: '#0B5FA5',
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#999999',
    },
});

export default Notifications;