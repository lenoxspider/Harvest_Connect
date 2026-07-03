import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const getRoleThemeColor = (role?: string) => {
    switch (role) {
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
  };

  const theme = getRoleThemeColor(user?.role);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.bg} />
      
      <View style={styles.content}>
        {/* Profile Card Header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.title}>{user?.fullName ?? 'User Profile'}</Text>
          <Text style={styles.subtitle}>{user?.role ?? 'Role'}</Text>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Phone Number</Text>
            <Text style={styles.value}>{user?.phoneNumber ?? '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Region</Text>
            <Text style={styles.value}>{user?.region ?? '—'}</Text>
          </View>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={styles.label}>Account ID</Text>
            <Text style={styles.value}>#{user?.id ? String(user.id).substring(0, 8) : '—'}</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: theme.primary }]}
          onPress={logout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
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
    color: '#2C3E50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 32,
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
  },
  logoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
