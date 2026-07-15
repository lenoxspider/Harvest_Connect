// src/screens/farmer/EditProduceScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { produceApi } from '../../api/produceApi';
import { ProduceListing } from '../../types';
import * as Location from 'expo-location';

type RouteParams = {
  EditProduce: { listing: ProduceListing };
};

const EditProduceScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<RouteParams, 'EditProduce'>>();
  const { listing } = route.params;

  const [formData, setFormData] = useState({
    title: listing.title,
    category: listing.category,
    quantity_kg: String(listing.quantity_kg),
    price_per_kg: String(listing.price_per_kg),
    location: listing.location,
    description: listing.description,
  });
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      setFormData(f => ({ ...f, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }));
    } catch {
      Alert.alert('Error', 'Could not get location');
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.category || !formData.quantity_kg || !formData.price_per_kg || !formData.location) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setIsLoading(true);
    try {
      await produceApi.updateListing(listing.id, {
        title: formData.title,
        category: formData.category,
        quantity_kg: parseFloat(formData.quantity_kg),
        price_per_kg: parseFloat(formData.price_per_kg),
        location: formData.location,
        description: formData.description,
      });
      Alert.alert('Success', 'Listing updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update listing');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.form}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={text => setFormData(f => ({ ...f, title: text }))}
          placeholder="e.g., Fresh Tomatoes"
          editable={!isLoading}
        />

        <Text style={styles.label}>Category *</Text>
        <TextInput
          style={styles.input}
          value={formData.category}
          onChangeText={text => setFormData(f => ({ ...f, category: text }))}
          placeholder="e.g., Vegetables, Fruits"
          editable={!isLoading}
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Quantity (kg) *</Text>
            <TextInput
              style={styles.input}
              value={formData.quantity_kg}
              onChangeText={text => setFormData(f => ({ ...f, quantity_kg: text }))}
              placeholder="0"
              keyboardType="numeric"
              editable={!isLoading}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Price/kg (GHS) *</Text>
            <TextInput
              style={styles.input}
              value={formData.price_per_kg}
              onChangeText={text => setFormData(f => ({ ...f, price_per_kg: text }))}
              placeholder="0.00"
              keyboardType="numeric"
              editable={!isLoading}
            />
          </View>
        </View>

        <Text style={styles.label}>Location *</Text>
        <View style={styles.locationRow}>
          <TextInput
            style={[styles.input, styles.locationInput]}
            value={formData.location}
            onChangeText={text => setFormData(f => ({ ...f, location: text }))}
            placeholder="Enter location or use GPS"
            editable={!isLoading}
          />
          <TouchableOpacity style={styles.gpsBtn} onPress={getCurrentLocation}>
            <Text style={styles.gpsBtnText}>📍</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={text => setFormData(f => ({ ...f, description: text }))}
          placeholder="Describe your produce (optional)"
          multiline
          numberOfLines={4}
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[styles.saveBtn, isLoading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} disabled={isLoading}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 20 },
  form: { width: '100%' },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 16 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
  },
  textArea: { height: 100, textAlignVertical: 'top', paddingTop: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationInput: { flex: 1, marginRight: 10 },
  gpsBtn: {
    width: 50,
    height: 50,
    backgroundColor: '#FF6F00',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsBtnText: { fontSize: 20 },
  saveBtn: {
    height: 50,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  saveBtnDisabled: { backgroundColor: '#CCCCCC' },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  cancelBtn: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  cancelBtnText: { fontSize: 16, color: '#666', fontWeight: '600' },
});

export default EditProduceScreen;
