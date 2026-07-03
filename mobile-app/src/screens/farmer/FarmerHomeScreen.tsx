// src/screens/farmer/FarmerHomeScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const FarmerHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  const menuItems = [
    { label: 'Add Produce', emoji: '🌽', screen: 'AddProduce' },
    { label: 'Notifications', emoji: '🔔', screen: 'Notifications', badge: true },
    { label: 'Tracking', emoji: '📍', screen: 'MyTracking' },
    { label: 'Book Storage', emoji: '🏭', screen: 'StorageBrowse' },
    { label: 'Request Transport', emoji: '🚚', screen: 'TransportBrowse' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E5631" />
      
      {/* Curved Green Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.roleText}>Farmer 🌾</Text>
          </View>
          <TouchableOpacity 
            style={styles.bellButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.badgeDot} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search storage or transport..."
            placeholderTextColor="#95A5A6"
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Grid of Action Cards */}
      <ScrollView 
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.85}
              style={styles.card}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardEmoji}>{item.emoji}</Text>
                <Text style={styles.cardLabel}>{item.label}</Text>
                
                {item.badge && (
                  <View style={styles.cardBadgeDot} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDF4ED', // Light greenish cream background
  },
  headerContainer: {
    backgroundColor: '#1E5631',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  roleText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bellButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellIcon: {
    fontSize: 24,
  },
  badgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E74C3C',
    borderWidth: 1.5,
    borderColor: '#1E5631',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#000000',
  },
  gridContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    width: '47%',
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  cardContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 34,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  cardBadgeDot: {
    position: 'absolute',
    top: 0,
    right: 18,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E74C3C',
  },
});

export default FarmerHomeScreen;
