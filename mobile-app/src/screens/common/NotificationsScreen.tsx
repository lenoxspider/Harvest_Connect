import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { notificationApi, AppNotification } from '../../api/notificationApi';
import { useAuth } from '../../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type DateGroup = 'Today' | 'Yesterday' | 'This Week' | 'Older';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Color theme mapping by user role
  const getThemeColor = useCallback(() => {
    if (!user) return { primary: '#1E5631', bg: '#EDF4ED' }; // Default fallback
    switch (user.role) {
      case 'FARMER':
        return { primary: '#1E5631', bg: '#EDF4ED' };
      case 'STORAGE_OWNER':
        return { primary: '#1565C0', bg: '#E3F2FD' };
      case 'TRANSPORTER':
        return { primary: '#E65100', bg: '#FFE0B2' };
      case 'BUYER':
        return { primary: '#7B1FA2', bg: '#F3E5F5' };
      default:
        return { primary: '#2C3E50', bg: '#F8F9FA' };
    }
  }, [user]);

  const theme = getThemeColor();

  // Notification States
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showError, setShowError] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Bookings' | 'Payments' | 'Updates' | 'Alerts'>('All');

  const loadNotifications = async (isRefreshed = false) => {
    if (!user) return;
    if (isRefreshed) setRefreshing(true);
    else setIsLoading(true);
    setShowError(false);

    try {
      const data = await notificationApi.getMyNotifications(user.id);
      setNotifications(data);
    } catch (e) {
      console.error('Error fetching notifications:', e);
      setShowError(true);
      // Auto dismiss error after 3 seconds
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [user?.id])
  );

  const handleMarkAsRead = async (id: string) => {
    try {
      const updated = await notificationApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
    } catch (e) {
      console.error('Error marking as read:', e);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    try {
      // Mark all read in parallel
      await Promise.all(unread.map((n) => notificationApi.markAsRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error('Error marking all as read:', e);
    }
  };

  const handleDeleteNotification = (id: string) => {
    // Delete locally
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Unread badge count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Filter & Group logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeCategory === 'All') return true;
      if (activeCategory === 'Bookings') return n.type === 'booking';
      if (activeCategory === 'Payments') return n.type === 'payment';
      if (activeCategory === 'Updates') return n.type === 'update';
      if (activeCategory === 'Alerts') return n.type === 'alert';
      return true;
    });
  }, [notifications, activeCategory]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<DateGroup, AppNotification[]> = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      Older: [],
    };

    filteredNotifications.forEach((n) => {
      const createdDate = n.createdAt ? new Date(n.createdAt) : new Date();
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;

      if (diffDays === 0) {
        groups.Today.push(n);
      } else if (diffDays === 1) {
        groups.Yesterday.push(n);
      } else if (diffDays <= 7) {
        groups['This Week'].push(n);
      } else {
        groups.Older.push(n);
      }
    });

    return groups;
  }, [filteredNotifications]);

  // UI helpers
  const getNotificationConfig = (type: AppNotification['type']) => {
    switch (type) {
      case 'booking':
        return { label: 'BOOKING', color: '#1B5E20', bg: '#C8E6C9', emoji: '📦' };
      case 'payment':
        return { label: 'PAYMENT', color: '#2E7D32', bg: '#E8F5E9', emoji: '💵' };
      case 'update':
        return { label: 'UPDATE', color: '#1565C0', bg: '#E3F2FD', emoji: '🔔' };
      case 'alert':
        return { label: 'ALERT', color: '#C62828', bg: '#FFCDD2', emoji: '⚠️' };
      default:
        return { label: 'GENERAL', color: '#555555', bg: '#EEEEEE', emoji: '💬' };
    }
  };

  const renderNotificationCard = ({ item }: { item: AppNotification }) => {
    const config = getNotificationConfig(item.type);
    // Format timestamp nicely: e.g. Jun 25, 2026 - 10:30 AM
    const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) : 'Jun 25, 2026';
    const timeStr = item.createdAt ? new Date(item.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }) : '10:30 AM';
    const formattedTimestamp = `${dateStr} - ${timeStr}`;

    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.card,
            { borderLeftColor: config.color },
            item.read ? styles.cardRead : styles.cardUnread,
          ]}
          onPress={() => !item.read && handleMarkAsRead(item.id)}
        >
          <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
            <Text style={styles.iconEmoji}>{config.emoji}</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.typeLabel, { color: config.color }]}>
              {config.label}
            </Text>
            <Text style={[styles.cardTitle, item.read && styles.readText]}>
              {item.title}
            </Text>
            {item.body ? (
              <Text style={[styles.cardBody, item.read && styles.readText]} numberOfLines={2}>
                {item.body}
              </Text>
            ) : null}
            <Text style={styles.timestamp}>{formattedTimestamp}</Text>
          </View>
        </TouchableOpacity>
        
        {/* Simple Side Delete Action Button */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDeleteNotification(item.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Skeleton loading view
  const renderSkeletons = () => (
    <View style={styles.skeletonContainer}>
      <Text style={styles.skeletonLoadingText}>Loading</Text>
      {[1, 2, 3, 4, 5].map((key) => (
        <View key={key} style={styles.skeletonCard}>
          <View style={styles.skeletonCircle} />
          <View style={styles.skeletonLines}>
            <View style={styles.skeletonLineShort} />
            <View style={styles.skeletonLineLong} />
          </View>
        </View>
      ))}
    </View>
  );

  // Grouped sections list content
  const sectionsData = useMemo(() => {
    const list: { title: DateGroup; data: AppNotification[] }[] = [];
    if (groupedNotifications.Today.length > 0) {
      list.push({ title: 'Today', data: groupedNotifications.Today });
    }
    if (groupedNotifications.Yesterday.length > 0) {
      list.push({ title: 'Yesterday', data: groupedNotifications.Yesterday });
    }
    if (groupedNotifications.ItemsWeek && groupedNotifications.ItemsWeek.length > 0) {
      list.push({ title: 'This Week', data: groupedNotifications.ItemsWeek });
    } else if (groupedNotifications['This Week'] && groupedNotifications['This Week'].length > 0) {
      list.push({ title: 'This Week', data: groupedNotifications['This Week'] });
    }
    if (groupedNotifications.Older.length > 0) {
      list.push({ title: 'Older', data: groupedNotifications.Older });
    }
    return list;
  }, [groupedNotifications]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />

      {/* CURVED HEADER */}
      <View style={[styles.header, { backgroundColor: theme.primary, paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity style={styles.headerIconContainer} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Notifications 🔔 {unreadCount > 0 ? `(${unreadCount})` : ''}
        </Text>
        <TouchableOpacity onPress={handleMarkAllAsRead}>
          <Text style={styles.markAllReadText}>Mark all{'\n'}as read</Text>
        </TouchableOpacity>
      </View>

      {/* CATEGORY pills */}
      <View style={styles.pillsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          {(['All', 'Bookings', 'Payments', 'Updates', 'Alerts'] as const).map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.pill,
                  isActive ? { backgroundColor: theme.primary } : styles.pillInactive,
                ]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.pillText, isActive ? styles.pillTextActive : styles.pillTextInactive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* BODY CONTENT */}
      {isLoading ? (
        renderSkeletons()
      ) : filteredNotifications.length === 0 ? (
        <View style={styles.centerEmpty}>
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyIconText}>🔔</Text>
          </View>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySubtitle}>
            You're all caught up! We'll notify you{'\n'}when something happens.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sectionsData}
          keyExtractor={(item) => item.title}
          contentContainerStyle={styles.listScroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadNotifications(true)} colors={[theme.primary]} />
          }
          renderItem={({ item }) => (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionHeaderTitle}>{item.title}</Text>
              {item.data.map((notification) => (
                <View key={notification.id}>
                  {renderNotificationCard({ item: notification })}
                </View>
              ))}
            </View>
          )}
        />
      )}

      {/* ERROR SNACKBAR */}
      {showError && (
        <View style={styles.errorSnackbar}>
          <Text style={styles.errorText}>
            Failed to load notifications. Pull to refresh ↓
          </Text>
          <Text style={styles.errorSubtext}>
            Auto-dismiss after 3 seconds.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 8,
  },
  markAllReadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'right',
    opacity: 0.9,
  },
  pillsContainer: {
    paddingVertical: 14,
  },
  pillsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  pillTextInactive: {
    color: '#757575',
  },
  listScroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 10,
    marginTop: 4,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 5,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardUnread: {
    backgroundColor: '#FFFFFF',
  },
  cardRead: {
    backgroundColor: '#F9F9F9',
    opacity: 0.9,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 20,
  },
  cardContent: {
    flex: 1,
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
    lineHeight: 18,
  },
  cardBody: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
    lineHeight: 16,
  },
  readText: {
    color: '#757575',
    fontWeight: 'normal',
  },
  timestamp: {
    fontSize: 10,
    color: '#9E9E9E',
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFCDD2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: 'bold',
  },
  centerEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0H0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    opacity: 0.65,
  },
  emptyIconText: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
  },
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  skeletonLoadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#757575',
    marginBottom: 16,
    marginTop: 4,
  },
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  skeletonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E0E0E0',
    marginRight: 12,
  },
  skeletonLines: {
    flex: 1,
    gap: 8,
  },
  skeletonLineShort: {
    width: '40%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  skeletonLineLong: {
    width: '80%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  errorSnackbar: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: '#C62828',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorSubtext: {
    color: '#FFCDD2',
    fontSize: 11,
    marginTop: 2,
  },
});
