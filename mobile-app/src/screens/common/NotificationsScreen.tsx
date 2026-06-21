import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { notificationApi, AppNotification } from '../../api/notificationApi';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../ui/GlassCard';
import { Screen } from '../../ui/Screen';

const NotificationsScreen: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!user) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await notificationApi.getMyNotifications(user.id);
      setItems(data);
    } catch (e) {
      console.error('Error fetching notifications:', e);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const markRead = async (id: string) => {
    try {
      const updated = await notificationApi.markAsRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? updated : n)));
    } catch (e) {
      console.error('Error marking read:', e);
    }
  };

  const renderItem = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => (item.read ? null : markRead(item.id))}>
      <GlassCard style={styles.card} strength={item.read ? 'normal' : 'strong'}>
        <Text style={[styles.title, item.read ? styles.readTitle : null]} numberOfLines={1}>
          {item.title}
        </Text>
        {item.body ? <Text style={styles.body}>{item.body}</Text> : null}
        <Text style={styles.meta}>{item.read ? 'Read' : 'Unread'}</Text>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Text style={styles.headerSub}>
          {user ? 'Tap an unread notification to mark it read.' : 'Login to see your notifications.'}
        </Text>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading...' : user ? 'No notifications yet.' : 'Not logged in.'}
            </Text>
          </View>
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { marginBottom: spacing.md },
  headerTitle: { ...typography.h2, color: colors.text },
  headerSub: { marginTop: 6, color: colors.muted, fontWeight: '600' },
  list: { paddingBottom: spacing.xl },
  card: { marginBottom: spacing.md },
  title: { color: colors.text, fontWeight: '900', fontSize: 16 },
  readTitle: { opacity: 0.75 },
  body: { marginTop: 8, color: colors.muted, fontWeight: '600', lineHeight: 20 },
  meta: { marginTop: 10, color: colors.muted, fontWeight: '700' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: colors.muted, fontWeight: '700' },
});

export default NotificationsScreen;
