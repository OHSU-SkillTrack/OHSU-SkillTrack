import { View, ScrollView, Pressable } from 'react-native';
import { signOut } from 'aws-amplify/auth';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useState, useEffect, useCallback } from 'react';

import { AppText } from '@/components/AppText';
import { Header } from '@/components/ui/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import styles from '@/app/styles';
import { BASE_URL } from '@/src/constants/api';

interface UserData {
  Email: string;
  FirstName?: string | null;
  LastName?: string | null;
  Roles?: string | null;
  TeachingTheseCourses?: string[];
}

interface UserToken {
  Token: string;
}

export default function ProfileTab() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseCount, setCourseCount] = useState(0);
  const [userToken, setUserToken] = useState<UserToken | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/FetchUserData`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UserData = await response.json();
      setUserData(data);
      setCourseCount(data.TeachingTheseCourses?.length || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const fetchToken = useCallback(async () => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${BASE_URL}/FetchUserToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as UserToken;
      setUserToken(data);
    } catch (error) {
      console.error('Error fetching user token:', error);
    }
  }, []);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const displayName = userData?.FirstName && userData?.LastName
    ? `${userData.FirstName} ${userData.LastName}`
    : userData?.FirstName || 'User';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Header text="ProfileStuff" backArrow={false} />

      {/* Profile Card */}
      <View
        style={{
          marginHorizontal: 16,
          marginTop: 24,
          padding: 20,
          backgroundColor: '#F5F5F5',
          borderRadius: 16,
          alignItems: 'center',
        }}
      >
        {/* Name */}
        <AppText
          style={{
            fontSize: 24,
            fontWeight: '700',
            marginBottom: 16,
            color: '#000',
          }}
        >
          {displayName}
        </AppText>

        {/* Email */}
        <AppText
          style={{
            fontSize: 16,
            color: '#666',
            marginBottom: 20,
          }}
        >
          {userData?.Email}
        </AppText>

        {/* Divider */}
        <View
          style={{
            width: '100%',
            height: 1,
            backgroundColor: '#E0E0E0',
            marginBottom: 20,
          }}
        />

        {/* Courses Info */}
        <View style={{ width: '100%', alignItems: 'center' }}>
          <AppText
            style={{
              fontSize: 14,
              color: '#666',
              marginBottom: 8,
            }}
          >
            Courses Teaching
          </AppText>
          <AppText
            style={{
              fontSize: 20,
              fontWeight: '600',
              color: '#4972FF',
            }}
          >
            {courseCount} course{courseCount !== 1 ? 's' : ''}
          </AppText>
        </View>
      </View>

      {/* Logout Button */}
      <Pressable
        onPress={handleLogout}
        style={{
          marginHorizontal: 16,
          marginTop: 32,
          marginBottom: 40,
          paddingVertical: 14,
          backgroundColor: '#FF3B30',
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AppText
          style={{
            color: '#fff',
            fontSize: 16,
            fontWeight: '600',
          }}
        >
          Logout
        </AppText>
      </Pressable>
    </ScrollView>
  );
}