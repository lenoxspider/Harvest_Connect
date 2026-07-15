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
import { kycApi, KycVerificationResponse } from '../../api/kycApi';
import { Picker } from '@react-native-picker/picker';
import { Modal } from 'react-native';

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const navigation = useNavigation<NavigationProp<any>>();

  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.fullName ?? '');
  const [editedRegion, setEditedRegion] = useState(user?.region ?? '');

  // KYC Verification States
  const [kycStatus, setKycStatus] = useState<KycVerificationResponse | null>(null);
  const [kycModalVisible, setKycModalVisible] = useState(false);
  const [docType, setDocType] = useState<'PASSPORT' | 'DRIVER_LICENSE' | 'NATIONAL_ID'>('NATIONAL_ID');
  const [docNumber, setDocNumber] = useState('');
  const [kycSubmitting, setKycSubmitting] = useState(false);

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

  const getKycStatusColor = (status?: string) => {
    switch (status) {
      case 'VERIFIED': return '#2E7D32';
      case 'PENDING': return '#E65100';
      case 'IN_REVIEW': return '#1565C0';
      case 'REJECTED': return '#D32F2F';
      case 'EXPIRED': return '#795548';
      default: return '#7F8C8D';
    }
  };

  const getKycStatusLabel = (status?: string) => {
    switch (status) {
      case 'NOT_STARTED': return 'NOT VERIFIED';
      case 'PENDING': return 'PENDING';
      case 'IN_REVIEW': return 'IN REVIEW';
      case 'VERIFIED': return 'VERIFIED ✓';
      case 'REJECTED': return 'REJECTED';
      case 'EXPIRED': return 'EXPIRED';
      default: return 'NOT VERIFIED';
    }
  };

  const loadReviews = async () => {
    try {
      const data = await reviewApi.getReviews();
      setMyReviews(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadKycStatus = async () => {
    if (!user?.id) return;
    try {
      const res = await kycApi.getStatus(String(user.id));
      setKycStatus(res);
    } catch (e: any) {
      // Service now returns NOT_STARTED instead of throwing; this handles network errors.
      console.warn('[KYC] Status check error:', e?.message);
      setKycStatus(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReviews();
      loadKycStatus();
    }, [user?.id])
  );

  useEffect(() => {
    if (user) {
      setEditedName(user.fullName);
      setEditedRegion(user.region);
    }
  }, [user]);

  const handleKycSubmit = async () => {
    if (!docNumber.trim()) {
      Alert.alert('Error', 'Please enter a document number');
      return;
    }
    setKycSubmitting(true);
    try {
      // Simulate ID Image upload with standard base64 placeholder
      const dummyBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      
      const res = await kycApi.startVerification({
        userId: user!.id,
        documentType: docType,
        documentNumber: docNumber.trim(),
        idImageBase64: dummyBase64,
      });

      setKycStatus(res);
      setKycModalVisible(false);
      setDocNumber('');
      Alert.alert('Success', 'KYC submission request sent successfully!');
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'KYC submission failed';
      Alert.alert('Error', msg);
    } finally {
      setKycSubmitting(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadReviews(), loadKycStatus()]);
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
          <View style={styles.row}>
            <Text style={styles.label}>Account ID</Text>
            <Text style={styles.value}>#{user?.id ? String(user.id).substring(0, 8) : '—'}</Text>
          </View>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={styles.label}>KYC Status</Text>
            <Text style={[styles.value, { color: getKycStatusColor(kycStatus?.status) }]}>
              {getKycStatusLabel(kycStatus?.status)}
            </Text>
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

        {/* KYC Verify Button */}
        {!isEditing && kycStatus?.status !== 'VERIFIED' && kycStatus?.status !== 'PENDING' && kycStatus?.status !== 'IN_REVIEW' && (
          <TouchableOpacity
            style={[styles.txBtn, { borderColor: '#E65100', marginTop: 0 }]}
            onPress={() => setKycModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.txBtnText, { color: '#E65100' }]}>🛡️ Verify Identity (KYC)</Text>
          </TouchableOpacity>
        )}

        {/* KYC Verification Info Banner */}
        {!isEditing && (kycStatus?.status === 'PENDING' || kycStatus?.status === 'IN_REVIEW') && (
          <View style={{ width: '100%', padding: 12, borderRadius: 12, backgroundColor: '#E3F2FD', borderLeftWidth: 4, borderLeftColor: '#1565C0', marginBottom: 16 }}>
            <Text style={{ fontWeight: 'bold', color: '#1565C0', fontSize: 13 }}>Identity Verification In Progress</Text>
            <Text style={{ fontSize: 11, color: '#000', marginTop: 4 }}>Our security compliance team is currently reviewing your document submissions.</Text>
          </View>
        )}

        {!isEditing && kycStatus?.status === 'REJECTED' && (
          <View style={{ width: '100%', padding: 12, borderRadius: 12, backgroundColor: '#FFEBEE', borderLeftWidth: 4, borderLeftColor: '#C62828', marginBottom: 16 }}>
            <Text style={{ fontWeight: 'bold', color: '#C62828', fontSize: 13 }}>Identity Verification Rejected</Text>
            <Text style={{ fontSize: 11, color: '#000', marginTop: 4 }}>Reason: {kycStatus.rejectionReason || 'Invalid documents'}. Please try again.</Text>
            <TouchableOpacity onPress={() => setKycModalVisible(true)} style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#C62828', textDecorationLine: 'underline' }}>Resubmit KYC Documents</Text>
            </TouchableOpacity>
          </View>
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

      {/* KYC Submit Modal */}
      <Modal visible={kycModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Identity Verification (KYC)</Text>
            <Text style={styles.modalSubtitle}>Please submit your legal identification details to enable fully secure escrow trading.</Text>
            
            <Text style={styles.inputLabel}>Select ID Type</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={docType}
                onValueChange={(val: any) => setDocType(val)}
                style={styles.picker}
              >
                <Picker.Item label="National ID (Ghana Card)" value="NATIONAL_ID" />
                <Picker.Item label="Passport" value="PASSPORT" />
                <Picker.Item label="Driver's License" value="DRIVER_LICENSE" />
              </Picker>
            </View>

            <Text style={styles.inputLabel}>ID Document Number</Text>
            <TextInput
              style={styles.textInput}
              value={docNumber}
              onChangeText={setDocNumber}
              placeholder="e.g. GHA-723924719-2"
              placeholderTextColor="#999"
              editable={!kycSubmitting}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalCancelBtn]} 
                onPress={() => {
                  setKycModalVisible(false);
                  setDocNumber('');
                }}
                disabled={kycSubmitting}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: theme.primary }]} 
                onPress={handleKycSubmit}
                disabled={kycSubmitting}
              >
                <Text style={styles.modalSubmitBtnText}>{kycSubmitting ? 'Submitting...' : 'Submit ID'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 6,
    marginTop: 12,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    width: '100%',
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#333333',
    backgroundColor: '#FAFAFA',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelBtn: {
    borderWidth: 1,
    borderColor: '#999999',
  },
  modalCancelBtnText: {
    color: '#666666',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
