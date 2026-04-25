import { View, ScrollView, Pressable } from 'react-native';
import { signOut } from 'aws-amplify/auth';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useState, useEffect, useCallback } from 'react';

import { AppText } from '@/components/AppText';
import { Header } from '@/components/ui/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import styles from '@/app/styles';
import { BASE_URL } from '@/src/constants/api';

interface SkillCheckInfo {
  CheckedOff: boolean;
  CheckedOffBy: string;
  DateCheckedOff: string;
}

interface UserData {
  Email: string;
  FirstName?: string | null;
  LastName?: string | null;
  Roles?: string | null;
  Courses?: Record<
    string,
    {
      CourseName?: string;
      Skills?: Record<string, SkillCheckInfo>;
    }
  >;
}

export default function Profile() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [totalSkills, setTotalSkills] = useState(0);
    const [completedSkills, setCompletedSkills] = useState(0);

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

            // Calculate total and completed skills
            let totalCount = 0;
            let completedCount = 0;

            if (data.Courses && typeof data.Courses === 'object') {
                Object.values(data.Courses).forEach((course) => {
                    const skills = course?.Skills || {};
                    const skillEntries = Object.entries(skills);
                    totalCount += skillEntries.length;
                    completedCount += skillEntries.filter(
                        ([_, statusInfo]) => statusInfo.CheckedOff
                    ).length;
                });
            }

            setTotalSkills(totalCount);
            setCompletedSkills(completedCount);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching user data:', error);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

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

    const progressPercentage = totalSkills > 0
        ? Math.round((completedSkills / totalSkills) * 100)
        : 0;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Header text="Profile" backArrow={false} />

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

                {/* Skills Progress */}
                <View style={{ width: '100%', alignItems: 'center' }}>
                    <AppText
                        style={{
                            fontSize: 14,
                            color: '#666',
                            marginBottom: 8,
                        }}
                    >
                        Skills Progress
                    </AppText>
                    <AppText
                        style={{
                            fontSize: 20,
                            fontWeight: '600',
                            color: '#4972FF',
                            marginBottom: 12,
                        }}
                    >
                        {completedSkills} of {totalSkills} completed
                    </AppText>

                    {/* Progress Bar */}
                    <View
                        style={{
                            width: '100%',
                            height: 8,
                            backgroundColor: '#E0E0E0',
                            borderRadius: 4,
                            overflow: 'hidden',
                        }}
                    >
                        <View
                            style={{
                                width: `${progressPercentage}%`,
                                height: '100%',
                                backgroundColor: '#4972FF',
                                borderRadius: 4,
                            }}
                        />
                    </View>
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