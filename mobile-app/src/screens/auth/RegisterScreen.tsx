// src/screens/auth/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Welcome: undefined;
};

const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    password: '',
    role: 'FARMER',
    region: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { register } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleRegister = async () => {
    const cleaned = {
      full_name: formData.full_name.trim(),
      phone_number: formData.phone_number.trim(),
      password: formData.password.trim(),
      role: formData.role,
      region: formData.region.trim(),
    };

    if (!cleaned.full_name || !cleaned.phone_number || !cleaned.password || !cleaned.region) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      await register(cleaned);
    } catch (error: any) {
      const serverMessage = error?.response?.data?.message;
      const fallback = error?.message ?? 'Could not reach server';
      Alert.alert('Registration Failed', serverMessage || fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { label: 'Farmer (FARMER)', value: 'FARMER', icon: '🌾' },
    { label: 'Buyer (BUYER)', value: 'BUYER', icon: '🛒' },
    { label: 'Transporter (TRANSPORTER)', value: 'TRANSPORTER', icon: '🚚' },
    { label: 'Storage Owner (STORAGE_OWNER)', value: 'STORAGE_OWNER', icon: '🏭' },
  ];

  const getActiveRole = () => {
    return roles.find(r => r.value === formData.role) || roles[0];
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Wheat Logo */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🌾</Text>
        </View>

        {/* Titles */}
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the HarvestConnect community</Text>

        {/* Form */}
        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              value={formData.full_name}
              onChangeText={(text) => setFormData({ ...formData, full_name: text })}
              placeholder="Full Name"
              placeholderTextColor="#95A5A6"
              editable={!isLoading}
              autoCapitalize="words"
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>📱</Text>
            <TextInput
              style={styles.input}
              value={formData.phone_number}
              onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
              placeholder="Phone Number"
              placeholderTextColor="#95A5A6"
              keyboardType="phone-pad"
              editable={!isLoading}
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              placeholder="••••••"
              placeholderTextColor="#95A5A6"
              secureTextEntry={!showPassword}
              editable={!isLoading}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              disabled={isLoading}
              style={styles.eyeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={22}
                color="#7F8C8D"
              />
            </TouchableOpacity>
          </View>

          {/* Region */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>📍</Text>
            <TextInput
              style={styles.input}
              value={formData.region}
              onChangeText={(text) => setFormData({ ...formData, region: text })}
              placeholder="Region"
              placeholderTextColor="#95A5A6"
              editable={!isLoading}
              autoCapitalize="words"
            />
          </View>

          {/* Custom Role Dropdown */}
          <View style={[styles.dropdownContainer, dropdownOpen && styles.dropdownContainerActive]}>
            <Text style={[styles.dropdownLabel, dropdownOpen && styles.dropdownLabelActive]}>
              Select Role
            </Text>
            
            <TouchableOpacity 
              style={styles.dropdownTrigger}
              onPress={() => setDropdownOpen(!dropdownOpen)}
              activeOpacity={0.8}
            >
              <View style={styles.dropdownTriggerLeft}>
                <Text style={styles.dropdownRoleIcon}>{getActiveRole().icon}</Text>
                <Text style={styles.dropdownRoleText}>{getActiveRole().label}</Text>
              </View>
              <Text style={[styles.dropdownArrow, dropdownOpen && { transform: [{ rotate: '180deg' }] }]}>
                ▼
              </Text>
            </TouchableOpacity>

            {dropdownOpen && (
              <View style={styles.dropdownOptions}>
                {roles.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setFormData({ ...formData, role: r.value });
                      setDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.optionIcon}>{r.icon}</Text>
                    <Text style={styles.optionText}>{r.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{isLoading ? 'Creating Account...' : 'Create Account'}</Text>
          </TouchableOpacity>

          {/* Login Redirect */}
          <TouchableOpacity 
            style={styles.linkButton} 
            onPress={() => navigation.navigate('Login')}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.signInHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    zIndex: 10,
    padding: 4,
  },
  backText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000000',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoEmoji: {
    fontSize: 38,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 10,
    color: '#7F8C8D',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#000000',
  },
  eyeButton: {
    padding: 4,
  },
  eyeEmoji: {
    fontSize: 18,
    color: '#7F8C8D',
  },
  // Custom dropdown styles
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  dropdownContainerActive: {
    borderWidth: 1.5,
    borderColor: '#1E5631',
  },
  dropdownLabel: {
    position: 'absolute',
    top: -10,
    left: 12,
    fontSize: 11,
    color: '#7F8C8D',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    fontWeight: '700',
  },
  dropdownLabelActive: {
    color: '#1E5631',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 14,
  },
  dropdownTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownRoleIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  dropdownRoleText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  dropdownOptions: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  optionIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  optionText: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
  },
  button: {
    height: 50,
    backgroundColor: '#1E5631',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#1E5631',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#7F8C8D',
    fontSize: 14,
  },
  signInHighlight: {
    color: '#1E5631',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
