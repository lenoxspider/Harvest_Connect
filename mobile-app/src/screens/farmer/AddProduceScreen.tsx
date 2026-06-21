// src/screens/farmer/AddProduceScreen.tsx
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
import { produceApi } from '../../api/produceApi';
import * as Location from 'expo-location';
import { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

const AddProduceScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    quantity_kg: '',
    price_per_kg: '',
    location: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<any>>();

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Reverse geocode would be better, but using coordinates for now
      setFormData({ ...formData, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
    } catch (error) {
      Alert.alert('Error', 'Could not get location');
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.category || !formData.quantity_kg || !formData.price_per_kg || !formData.location) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await produceApi.createListing({
        ...formData,
        quantity_kg: parseFloat(formData.quantity_kg),
        price_per_kg: parseFloat(formData.price_per_kg),
      });
      Alert.alert('Success', 'Produce listing created successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create listing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.form}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
          placeholder="e.g., Fresh Tomatoes"
          editable={!isLoading}
        />

        <Text style={styles.label}>Category *</Text>
        <TextInput
          style={styles.input}
          value={formData.category}
          onChangeText={(text) => setFormData({ ...formData, category: text })}
          placeholder="e.g., Vegetables, Fruits, Dairy"
          editable={!isLoading}
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Quantity (kg) *</Text>
            <TextInput
              style={styles.input}
              value={formData.quantity_kg}
              onChangeText={(text) => setFormData({ ...formData, quantity_kg: text })}
              placeholder="0"
              keyboardType="numeric"
              editable={!isLoading}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Price/kg (USD) *</Text>
            <TextInput
              style={styles.input}
              value={formData.price_per_kg}
              onChangeText={(text) => setFormData({ ...formData, price_per_kg: text })}
              placeholder="0.00"
              keyboardType="numeric"
              editable={!isLoading}
            />
          </View>
        </View>

        <Text style={styles.label}>Location *</Text>
        <View style={styles.locationContainer}>
          <TextInput
            style={[styles.input, styles.locationInput]}
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
            placeholder="Enter location or use GPS"
            editable={!isLoading}
          />
          <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
            <Text style={styles.locationButtonText}>📍</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Describe your produce (optional)"
          multiline
          numberOfLines={4}
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Creating...' : 'Create Listing'}
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
    marginRight: 10,
  },
  locationButton: {
    width: 50,
    height: 50,
    backgroundColor: '#FF6F00',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationButtonText: {
    fontSize: 20,
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
});

export default AddProduceScreen;
