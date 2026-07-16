// src/screens/transporter/AddTruckScreen.tsx
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
import { transportApi } from '../../api/transportApi';
import { produceApi } from '../../api/produceApi';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';

const AddTruckScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    truck_type: '',
    capacity_kg: '',
    price_per_km: '',
    available_from: '',
    location: '',
  });
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

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
      !formData.truck_type ||
      !formData.capacity_kg ||
      !formData.price_per_km ||
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

      await transportApi.addTruck({
        ...formData,
        capacity_kg: parseFloat(formData.capacity_kg),
        price_per_km: parseFloat(formData.price_per_km),
        imageUrl: uploadedUrl || undefined,
      });
      Alert.alert('Success', 'Truck added successfully');
      navigation.goBack();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to add truck';
      const details = error.response?.data?.details ? JSON.stringify(error.response.data.details) : '';
      Alert.alert('Error', `${errorMsg} ${details}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.form}>
        <Text style={styles.label}>Truck Type *</Text>
        <TextInput
          style={styles.input}
          value={formData.truck_type}
          onChangeText={(text) => setFormData({ ...formData, truck_type: text })}
          placeholder="e.g., Small Van, Medium Truck, Large Truck"
          editable={!isLoading}
        />

        <Text style={styles.label}>Capacity (kg) *</Text>
        <TextInput
          style={styles.input}
          value={formData.capacity_kg}
          onChangeText={(text) => setFormData({ ...formData, capacity_kg: text })}
          placeholder="Maximum load capacity"
          keyboardType="numeric"
          editable={!isLoading}
        />

        <Text style={styles.label}>Price per KM (USD) *</Text>
        <TextInput
          style={styles.input}
          value={formData.price_per_km}
          onChangeText={(text) => setFormData({ ...formData, price_per_km: text })}
          placeholder="Rate per kilometer"
          keyboardType="numeric"
          editable={!isLoading}
        />

        <Text style={styles.label}>Available From</Text>
        <TextInput
          style={styles.input}
          value={formData.available_from}
          onChangeText={(text) => setFormData({ ...formData, available_from: text })}
          placeholder="YYYY-MM-DD (optional)"
          editable={!isLoading}
        />

        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={styles.input}
          value={formData.location}
          onChangeText={(text) => setFormData({ ...formData, location: text })}
          placeholder="Your current location"
          editable={!isLoading}
        />

        <Text style={styles.label}>Truck Photo (Optional)</Text>
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
            {isLoading ? 'Adding...' : 'Add Truck'}
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

export default AddTruckScreen;