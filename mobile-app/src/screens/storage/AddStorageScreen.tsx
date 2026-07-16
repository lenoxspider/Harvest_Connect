// src/screens/storage/AddStorageScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { storageApi } from '../../api/storageApi';
import { produceApi } from '../../api/produceApi';
import * as ImagePicker from 'expo-image-picker';
import { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

const AddStorageScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    facility_name: '',
    capacity_tons: '',
    price_per_ton_per_day: '',
    location: '',
    temperature_range: '',
  });
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<any>>();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.facility_name ||
      !formData.capacity_tons ||
      !formData.price_per_ton_per_day ||
      !formData.location
    ) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setIsLoading(true);
    try {
      let uploadedUrl = null;
      if (imageUri) {
        uploadedUrl = await produceApi.uploadImage(imageUri);
      }

      await storageApi.addStorage({
        ...formData,
        capacity_tons: parseFloat(formData.capacity_tons),
        available_tons: parseFloat(formData.capacity_tons),
        price_per_ton_per_day: parseFloat(formData.price_per_ton_per_day),
        is_available: true,
        imageUrl: uploadedUrl || undefined,
      });
      Alert.alert('Success', 'Storage facility added successfully');
      navigation.goBack();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to add storage';
      const details = error.response?.data?.details ? JSON.stringify(error.response.data.details) : '';
      Alert.alert('Error', `${errorMsg} ${details}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.form}>
        <Text style={styles.label}>Facility Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.facility_name}
          onChangeText={(text) => setFormData({ ...formData, facility_name: text })}
          placeholder="e.g., ColdStore warehouse A"
          editable={!isLoading}
        />

        <Text style={styles.label}>Capacity (tons) *</Text>
        <TextInput
          style={styles.input}
          value={formData.capacity_tons}
          onChangeText={(text) => setFormData({ ...formData, capacity_tons: text })}
          placeholder="Total storage capacity"
          keyboardType="numeric"
          editable={!isLoading}
        />

        <Text style={styles.label}>Price per ton per day (GHS) *</Text>
        <TextInput
          style={styles.input}
          value={formData.price_per_ton_per_day}
          onChangeText={(text) => setFormData({ ...formData, price_per_ton_per_day: text })}
          placeholder="Daily rate per ton"
          keyboardType="numeric"
          editable={!isLoading}
        />

        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={styles.input}
          value={formData.location}
          onChangeText={(text) => setFormData({ ...formData, location: text })}
          placeholder="Facility location"
          editable={!isLoading}
        />

        <Text style={styles.label}>Temperature Range (optional)</Text>
        <TextInput
          style={styles.input}
          value={formData.temperature_range}
          onChangeText={(text) => setFormData({ ...formData, temperature_range: text })}
          placeholder="e.g., 2°C - 8°C"
          editable={!isLoading}
        />

        <Text style={styles.label}>Facility Photo (Optional)</Text>
        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage} disabled={isLoading}>
          <Text style={styles.imagePickerText}>{imageUri ? 'Change Photo' : 'Select Photo'}</Text>
        </TouchableOpacity>
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        )}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Adding...' : 'Add Storage Facility'}
          </Text>
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
  contentContainer: {
    padding: 20,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
  },
  button: {
    height: 50,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePickerButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  imagePickerText: {
    color: '#555555',
    fontSize: 16,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
    resizeMode: 'cover',
  },
});

export default AddStorageScreen;
