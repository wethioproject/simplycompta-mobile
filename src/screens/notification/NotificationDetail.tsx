import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotification } from '../../hooks/useNotification';
import { Notification } from '../../services/notificationService';

const NotificationDetail: React.FC = ({ navigation, route }: any) => {
  const { notificationId } = route.params;
  const { viewSingleNotification } = useNotification();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotificationDetail = async () => {
      try {
        const result = await viewSingleNotification(notificationId);
        console.log('detchh notificatiosn:', result)
        if (result.success && result.notification) {
          setNotification(result.notification);
        }
      } catch (error) {
        console.error('Error fetching notification detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationDetail();
  }, [notificationId]);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openDocument = () => {
    if (notification?.document) {
      const documentUrl = `https://simply-compta.com/storage/${notification.document}`;
      Linking.openURL(documentUrl);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0B5FA5" />
        </View>
      </SafeAreaView>
    );
  }

  if (!notification) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notification</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Notification introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Notification Content */}
        <View style={styles.contentContainer}>
          {/* Title */}
          <Text style={styles.title}>{notification.title}</Text>
          
          {/* Date */}
          <Text style={styles.date}>{formatDate(notification.created_at)}</Text>
          
          {/* Message */}
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{notification.message}</Text>
          </View>

          {/* Document */}
          {notification.document && (
            <TouchableOpacity style={styles.documentButton} onPress={openDocument}>
              <Text style={styles.documentButtonText}>Ouvrir le document</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#999999',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0B5FA5',
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 20,
  },
  messageContainer: {
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
  documentButton: {
    backgroundColor: '#F0F2FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0B5FA5',
    alignItems: 'center',
  },
  documentButtonText: {
    fontSize: 16,
    color: '#0B5FA5',
    fontWeight: '500',
  },
});

export default NotificationDetail;