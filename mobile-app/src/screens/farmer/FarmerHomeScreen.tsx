// src/screens/farmer/FarmerHomeScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

type FarmerStackParamList = {
  FarmerDashboard: undefined;
  AddProduce: undefined;
};

const FarmerHomeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.fullName}!</Text>
        <Text style={styles.subtitle}>Manage your farm produce and orders</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('AddProduce')}
        >
          <View style={styles.cardIcon}>
            <Text style={styles.iconText}>+</Text>
          </View>
          <Text style={styles.cardTitle}>Add Produce</Text>
          <Text style={styles.cardDescription}>List new produce for sale</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <View style={styles.cardIcon}>
            <Text style={styles.iconText}>📦</Text>
          </View>
          <Text style={styles.cardTitle}>My Listings</Text>
          <Text style={styles.cardDescription}>View and manage your listings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <View style={styles.cardIcon}>
            <Text style={styles.iconText}>🛒</Text>
          </View>
          <Text style={styles.cardTitle}>Incoming Orders</Text>
          <Text style={styles.cardDescription}>See and accept orders</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <View style={styles.cardIcon}>
            <Text style={styles.iconText}>❄️</Text>
          </View>
          <Text style={styles.cardTitle}>Book Storage</Text>
          <Text style={styles.cardDescription}>Find cold storage nearby</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <View style={styles.cardIcon}>
            <Text style={styles.iconText}>🚚</Text>
          </View>
          <Text style={styles.cardTitle}>Book Transport</Text>
          <Text style={styles.cardDescription}>Arrange delivery</Text>
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
    color: '#2E7D32',
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

export default FarmerHomeScreen;
