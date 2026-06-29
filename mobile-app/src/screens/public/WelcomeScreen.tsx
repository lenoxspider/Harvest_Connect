import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';

type WelcomeStackParamList = {
  Login: undefined;
  Register: undefined;
  Explore: undefined;
};

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<WelcomeStackParamList>>();

  const handleCardPress = () => {
    // Navigate to login/registration if they tap a role card
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E5631" />
      
      {/* Curved Green Header */}
      <View style={styles.headerBackground}>
        {/* White Circular Logo */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🌾</Text>
        </View>
        
        <Text style={styles.title}>HarvestConnect</Text>
        <Text style={styles.subtitle}>
          Connecting Farmers, Storage &{'\n'}Transport across Ghana
        </Text>
        
        {/* Overlapping Feature Cards */}
        <View style={styles.cardsContainer}>
          <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={handleCardPress}>
            <Text style={styles.cardEmoji}>🌽</Text>
            <Text style={styles.cardText}>Farmers</Text>
          </TouchableOpacity>
          
          <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={handleCardPress}>
            <Text style={styles.cardEmoji}>🏭</Text>
            <Text style={styles.cardText}>Storage</Text>
          </TouchableOpacity>
          
          <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={handleCardPress}>
            <Text style={styles.cardEmoji}>🚛</Text>
            <Text style={styles.cardText}>Transport</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* White Bottom Section */}
      <View style={styles.bottomSection}>
        <Text style={styles.tagline}>
          Your agricultural marketplace —{'\n'}all in one place
        </Text>
        
        {/* Buttons */}
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.createBtn}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.createBtnText}>Create Account</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>
        
        {/* Legal Disclaimer */}
        <Text style={styles.legalText}>
          By continuing you agree to our{' '}
          <Text style={styles.underline}>Terms & Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBackground: {
    backgroundColor: '#1E5631',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingTop: 50,
    paddingBottom: 70, // extra padding to allow overlapping cards
    alignItems: 'center',
    position: 'relative',
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  logoEmoji: {
    fontSize: 42,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 22,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: -45, // overlaps the bottom edge
    left: 0,
    right: 0,
    gap: 14,
  },
  card: {
    width: 94,
    height: 94,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
  cardEmoji: {
    fontSize: 30,
    marginBottom: 6,
  },
  cardText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
  },
  bottomSection: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40, // spacer for the cards
  },
  tagline: {
    fontSize: 15,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  createBtn: {
    width: '100%',
    height: 50,
    backgroundColor: '#1E5631',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginBtn: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1E5631',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginBtnText: {
    color: '#1E5631',
    fontSize: 16,
    fontWeight: 'bold',
  },
  legalText: {
    fontSize: 11,
    color: '#95A5A6',
    textAlign: 'center',
  },
  underline: {
    textDecorationLine: 'underline',
  },
});

export default WelcomeScreen;
