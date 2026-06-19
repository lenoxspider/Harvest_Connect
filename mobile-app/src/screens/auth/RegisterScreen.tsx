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
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Picker } from '@react-native-picker/picker';
import { GlassBackground } from '../../ui/GlassBackground';
import { GlassCard } from '../../ui/GlassCard';
import { colors } from '../../theme/colors';

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
  const { register } = useAuth();

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

  return (
    <GlassBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join HarvestConnect Today</Text>
        </View>

        <GlassCard strength="strong">
          <View style={styles.form}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={formData.full_name}
              onChangeText={(text) => setFormData({ ...formData, full_name: text })}
              placeholder="Enter your full name"
              placeholderTextColor={colors.muted}
              editable={!isLoading}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={formData.phone_number}
              onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
              placeholder="Enter your phone number"
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              editable={!isLoading}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                placeholder="Create a password"
                placeholderTextColor={colors.muted}
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
                <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>I am a:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                style={styles.picker}
                dropdownIconColor={colors.text}
              >
                <Picker.Item label="Farmer" value="FARMER" />
                <Picker.Item label="Buyer" value="BUYER" />
                <Picker.Item label="Transporter" value="TRANSPORTER" />
                <Picker.Item label="Storage Owner" value="STORAGE_OWNER" />
              </Picker>
            </View>

            <Text style={styles.label}>Region</Text>
            <TextInput
              style={styles.input}
              value={formData.region}
              onChangeText={(text) => setFormData({ ...formData, region: text })}
              placeholder="Enter your region"
              placeholderTextColor={colors.muted}
              editable={!isLoading}
              autoCapitalize="words"
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>{isLoading ? 'Creating Account...' : 'Create Account'}</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </ScrollView>
    </GlassBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: 'rgba(10, 14, 26, 0.55)',
    color: colors.text,
  },
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  eyeText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: 'rgba(10, 14, 26, 0.55)',
  },
  picker: {
    height: 50,
    color: colors.text,
  },
  button: {
    height: 50,
    backgroundColor: 'rgba(124, 255, 178, 0.18)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(124, 255, 178, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 30,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
