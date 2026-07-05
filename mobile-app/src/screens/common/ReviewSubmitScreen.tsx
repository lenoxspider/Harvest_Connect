// src/screens/common/ReviewSubmitScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp, NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { reviewApi } from '../../api/reviewApi';
import { useAuth } from '../../context/AuthContext';

type ParamList = {
  SubmitReview: {
    targetId: string;
    targetType: 'FARMER' | 'STORAGE' | 'TRANSPORTER';
    targetName: string;
    referenceId: string;
  };
};

export default function ReviewSubmitScreen() {
  const route = useRoute<RouteProp<ParamList, 'SubmitReview'>>();
  const navigation = useNavigation<NavigationProp<any>>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const { targetId, targetType, targetName, referenceId } = route.params;

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Dynamic theme colors by target type
  const theme = (() => {
    switch (targetType) {
      case 'FARMER':
        return { primary: '#1E5631', bg: '#EDF4ED', light: '#C8E6C9' };
      case 'STORAGE':
        return { primary: '#1565C0', bg: '#E3F2FD', light: '#BBDEFB' };
      case 'TRANSPORTER':
        return { primary: '#E65100', bg: '#FFE0B2', light: '#FFE0B2' };
      default:
        return { primary: '#7B1FA2', bg: '#F3E5F5', light: '#E1BEE7' };
    }
  })();

  const handleSubmit = async () => {
    if (comment.trim().length === 0) {
      Alert.alert('Validation Error', 'Please write a brief comment describing your experience.');
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewApi.submitReview({
        targetId,
        targetType,
        rating,
        comment: comment.trim(),
      });

      // Mark review status in local AsyncStorage state if needed
      Alert.alert('Review Submitted', `Thank you for reviewing ${targetName}!`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      
      {/* CURVED HEADER */}
      <View style={[styles.header, { backgroundColor: theme.primary, paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write Review</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.badgeText}>REVIEWING {targetType}</Text>
            <Text style={styles.targetNameText}>{targetName}</Text>
            <Text style={styles.refText}>ID Reference: {referenceId.substring(0, 8).toUpperCase()}</Text>
            
            <View style={styles.divider} />

            {/* STAR RATING */}
            <Text style={styles.label}>Select Rating</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starTouch}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.starText, star <= rating ? styles.starFilled : styles.starEmpty]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* COMMENT INPUT */}
            <Text style={styles.label}>Tell us about your experience</Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={4}
              placeholder={`Describe how your interaction was with this ${targetType.toLowerCase()}...`}
              placeholderTextColor="#9E9E9E"
              value={comment}
              onChangeText={setComment}
              maxLength={250}
            />
            <Text style={styles.charCount}>{comment.length}/250 chars</Text>

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.primary }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitBtnText}>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#757575',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  targetNameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  refText: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#616161',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  starTouch: {
    padding: 4,
  },
  starText: {
    fontSize: 36,
  },
  starFilled: {
    color: '#FFB300',
  },
  starEmpty: {
    color: '#E0E0E0',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    height: 120,
    fontSize: 14,
    color: '#212121',
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: '#9E9E9E',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 20,
  },
  submitBtn: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
