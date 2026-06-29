// src/screens/transporter/TransporterHomeScreen.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const TransporterHomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  const stats = useMemo(
    () => [
      { label: 'Active Jobs', value: '5' },
      { label: 'Pending Bookings', value: '12' },
      { label: 'Earnings (GHS)', value: '2,150' },
    ],
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#E65100" />
      
      {/* Curved Orange Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.roleText}>Transporter 🚚</Text>
          </View>
          <TouchableOpacity 
            style={styles.bellButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.badgeDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Section */}
      <ScrollView 
        contentContainerStyle={styles.contentScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions Row */}
        <View style={styles.actionsRow}>
          {/* Add Truck */}
          <TouchableOpacity 
            activeOpacity={0.85} 
            style={styles.actionCard} 
            onPress={() => navigation.navigate('AddTruck')}
          >
            <View style={styles.plusCircle}>
              <Text style={styles.plusEmoji}>🚚</Text>
            </View>
            <Text style={styles.actionLabel}>Add Truck</Text>
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity 
            activeOpacity={0.85} 
            style={styles.actionCard} 
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.actionEmoji}>🔔</Text>
            <Text style={styles.actionLabel}>Notifications</Text>
            <View style={styles.cardBadgeDot} />
          </TouchableOpacity>

          {/* Tracking */}
          <TouchableOpacity 
            activeOpacity={0.85} 
            style={styles.actionCard} 
            onPress={() => navigation.navigate('BookingsTab')}
          >
            <Text style={styles.actionEmoji}>📍</Text>
            <Text style={styles.actionLabel}>Tracking</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {stats.map((item) => (
            <View key={item.label} style={styles.statCard}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF0E6', // Light orange/cream background
  },
  headerContainer: {
    backgroundColor: '#E65100',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    borderColor: '#E65100',
  },
  contentScroll: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    width: '30%',
    height: 100,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  plusCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E65100',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  plusEmoji: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  actionEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  cardBadgeDot: {
    position: 'absolute',
    top: 14,
    right: 32,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E74C3C',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '30%',
    height: 110,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    padding: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#7F8C8D',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default TransporterHomeScreen;
