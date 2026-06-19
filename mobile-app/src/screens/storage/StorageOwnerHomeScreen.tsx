// src/screens/storage/StorageOwnerHomeScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';

const StorageOwnerHomeScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavigationProp<any>>();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.fullName}!</Text>
        <Text style={styles.subtitle}>Manage your storage facilities</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('AddStorage')}
        >
          <View style={styles.cardIcon}>
            <Text style={styles.iconText}>🏢</Text>
          </View>
          <Text style={styles.cardTitle}>Add Storage</Text>
          <Text style={styles.cardDescription}>Add new cold storage facility</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <View style={styles.cardIcon}>
            <Text style={styles.iconText}>📋</Text>
          </View>
          <Text style={styles.cardTitle}>My Facilities</Text>
          <Text style={styles.cardDescription}>Manage your storages</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <View style={styles.cardIcon}>
            <Text style={styles.iconText}>📦</Text>
          </View>
          <Text style={styles.cardTitle}>Incoming Bookings</Text>
          <Text style={styles.cardDescription}>View and confirm bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={logout}>
          <View style={styles.cardIcon}>
            <Text style={styles.iconText}>🚪</Text>
          </View>
          <Text style={styles.cardTitle}>Logout</Text>
          <Text style={styles.cardDescription}>Sign out of your account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666666',
  },
});

export default StorageOwnerHomeScreen;
