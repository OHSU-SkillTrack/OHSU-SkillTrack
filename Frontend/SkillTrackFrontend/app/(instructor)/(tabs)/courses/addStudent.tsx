import { useState } from 'react';
import { View, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { fetchAuthSession } from 'aws-amplify/auth';

import { AppText } from '@/components/AppText';
import { Header } from '@/components/ui/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import styles from '@/app/styles';
import { BASE_URL } from '@/src/constants/api';

export default function AddStudentToCourse() {
  const router = useRouter();
  const { courseId, courseName } = useLocalSearchParams();
  const [studentEmail, setStudentEmail] = useState('');
  const [adding, setAdding] = useState(false);

  async function handleAddStudent() {
    if (!studentEmail.trim()) {
      Alert.alert('Please enter a student email.');
      return;
    }
    setAdding(true);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) throw new Error('No auth token');
      const res = await fetch(`${BASE_URL}/AddStudentToCourse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          Course_ID: courseId,
          Student_ID: studentEmail.trim(),
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to add student.');
      }
      Alert.alert('Student added!');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not add student.');
    } finally {
      setAdding(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header text={`Add Student${courseName ? ` to ${courseName}` : ''}`} backArrow onBackPress={() => router.back()} />
      <View style={{ marginTop: 32, width: '100%', alignItems: 'center' }}>
        <AppText style={{ fontSize: 18, marginBottom: 16 }}>Student Email</AppText>
        <TextInput
          value={studentEmail}
          onChangeText={setStudentEmail}
          placeholder="Enter student email"
          autoCapitalize="none"
          keyboardType="email-address"
          style={{
            width: '90%',
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 12,
            padding: 14,
            fontSize: 16,
            marginBottom: 24,
            backgroundColor: '#fff',
          }}
        />
        <Pressable
          style={{
            backgroundColor: adding ? '#9AA0A6' : '#4972FF',
            borderRadius: 20,
            paddingVertical: 14,
            paddingHorizontal: 36,
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 160,
          }}
          onPress={handleAddStudent}
          disabled={adding}
        >
          <AppText style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
            {adding ? 'Adding...' : 'Add Student'}
          </AppText>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
