// src/screens/common/ProfileScreen.tsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { reviewApi, Review } from '../../api/reviewApi';

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const navigation = useNavigation<NavigationProp<any>>();

  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.fullName ?? '');
  const [editedRegion, setEditedRegion] = useState(user?.region ?? '');

  const getRoleTheme = useCallback(() => {
    if (!user) return { primary: '#2C3E50', bg: '#F8F9FA', accent: '#7F8C8D' };
    switch (user.role) {
      case 'FARMER':
        return { primary: '#1E5631', bg: '#EDF4ED', accent: '#C8E6C9' };
      case 'STORAGE_OWNER':
        return { primary: '#1565C0', bg: '#E3F2FD', accent: '#BBDEFB' };
      case 'TRANSPORTER':
        return { primary: '#E65100', bg: '#FFE0B2', accent: '#FFE0B2' };
      case 'BUYER':
        return { primary: '#7B1FA2', bg: '#F3E5F5', accent: '#E1BEE7' };
      default:
        return { primary: '#2C3E50', bg: '#F8F9FA', accent: '#E0E0E0' };
    }
  }, [user]);

  const theme = getRoleTheme();

  const loadReviews = async () => {
    try {
      const data = await reviewApi.getReviews();
      setMyReviews(data);
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReviews();
    }, [])
  );

  useEffect(() => {
    if (user) {
      setEditedName(user.fullName);
      setEditedRegion(user.region);
    }
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReviews();
    setRefreshing(false);
  };

  const handleSave = async () => {
    if (editedName.trim().length === 0) {
      Alert.alert('Validation Error', 'Full Name is required.');
      return;
    }
    if (editedRegion.trim().length === 0) {
      Alert.alert('Validation Error', 'Region is required.');
      return;
    }

    try {
      await updateProfile(editedName.trim(), editedRegion.trim());
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (e) {
      Alert.alert('Error', 'Could not update profile.');
    }
  };

  const ratingStats = useMemo(() => {
    if (myReviews.length === 0) {
      return { score: '0.0', count: '0' };
    }
    const totalScore = myReviews.reduce((sum, r) => sum + r.rating, 0);
    const scoreVal = (totalScore / myReviews.length).toFixed(1);
    return { score: scoreVal, count: String(myReviews.length) };
  }, [myReviews]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.bg} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
        }
      >
        {/* Profile Card Header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          
          {isEditing ? (
            <TextInput
              style={styles.editNameInput}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Full Name"
              placeholderTextColor="#9E9E9E"
            />
          ) : (
            <Text style={styles.title}>{user?.fullName ?? 'User Profile'}</Text>
          )}
          
          <Text style={styles.subtitle}>{user?.role ?? 'Role'}</Text>

          <View style={[styles.ratingBadge, { backgroundColor: theme.accent }]}>
            <Text style={[styles.ratingText, { color: theme.primary }]}>
              ⭐ {ratingStats.score} ({ratingStats.count} reviews)
            </Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Phone Number</Text>
            <Text style={styles.value}>{user?.phoneNumber ?? '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Region</Text>
            {isEditing ? (
              <TextInput
                style={styles.editRegionInput}
                value={editedRegion}
                onChangeText={setEditedRegion}
                placeholder="Region"
                placeholderTextColor="#9E9E9E"
              />
            ) : (
              <Text style={styles.value}>{user?.region ?? '—'}</Text>
            )}
          </View>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={styles.label}>Account ID</Text>
            <Text style={styles.value}>#{user?.id ? String(user.id).substring(0, 8) : '—'}</Text>
          </View>
        </View>

        {/* EDIT / SAVE ACTIONS */}
        {isEditing ? (
          <View style={styles.editActionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={() => {
                setIsEditing(false);
                setEditedName(user?.fullName ?? '');
                setEditedRegion(user?.region ?? '');
              }}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.txBtn, { borderColor: theme.primary }]}
            onPress={() => setIsEditing(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.txBtnText, { color: theme.primary }]}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        )}

        {/* Transactions Button */}
        {!isEditing && (
          <TouchableOpacity
            style={[styles.txBtn, { borderColor: theme.primary, marginTop: 0 }]}
            onPress={() => navigation.navigate('MyTransactions')}
            activeOpacity={0.8}
          >
            <Text style={[styles.txBtnText, { color: theme.primary }]}>🧾 My Transactions</Text>
          </TouchableOpacity>
        )}

        {/* Reviews Section */}
        {myReviews.length > 0 && !isEditing && (
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>Recent Reviews</Text>
            {myReviews.map((item) => (
              <View key={item.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewRating}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</Text>
                  <Text style={styles.reviewDate}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.reviewComment}>{item.comment}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Logout Button */}
        {!isEditing && (
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: theme.primary }]}
            onPress={logout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
  },
  editNameInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    borderBottomWidth: 2,
    borderBottomColor: '#757575',
    textAlign: 'center',
    width: '80%',
    paddingVertical: 2,
  },
  editRegionInput: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#757575',
    width: 120,
    textAlign: 'right',
    paddingVertical: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '600',
    marginTop: 6,
  },
  ratingBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    opacity: 0.85,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  logoutBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 16,
  },
  logoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  txBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  txBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  editActionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    borderWidth: 2,
    borderColor: '#757575',
  },
  cancelBtnText: {
    color: '#757575',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reviewsSection: {
    width: '100%',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewRating: {
    color: '#FFB300',
    fontSize: 14,
  },
  reviewDate: {
    fontSize: 10,
    color: '#9E9E9E',
  },
  reviewComment: {
    fontSize: 13,
    color: '#424242',
    lineHeight: 18,
  },
});
