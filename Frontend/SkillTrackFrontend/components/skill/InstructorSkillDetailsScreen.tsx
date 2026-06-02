import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, View } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { BASE_URL } from '@/src/constants/api';

import { AppText } from '@/components/AppText';
import { Header } from '@/components/ui/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

import styles from '@/app/styles';

interface SkillDetailData {
    description: string;
    requirements: string[];
    resources: Array<{ name: string; url: string }>;
    completionDetails: string;
}

interface CourseInfoResponse {
    Skills?: Record<string, {
        Description?: string;
        Requirements?: string[];
        Resources?: Array<{ name?: string; url?: string }>;
        CompletionDetails?: string;
    }>;
}

function decodeParam(value: string | string[] | undefined): string {
    const raw = Array.isArray(value) ? value[0] : value;
    if (!raw) {
        return '';
    }

    try {
        return decodeURIComponent(raw);
    } catch {
        return raw;
    }
}

async function fetchSkillDetails(courseId: string, skillName: string): Promise<SkillDetailData> {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(
        `${BASE_URL}/GetCourseInformation?Course_ID=${encodeURIComponent(courseId)}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch course info: ${response.status}`);
    }

    const courseInfo: CourseInfoResponse = await response.json();
    const skillTemplate = courseInfo?.Skills?.[skillName];

    return {
        description: skillTemplate?.Description ?? 'No description available.',
        requirements: skillTemplate?.Requirements ?? [],
        resources: (skillTemplate?.Resources ?? []).map((resource) => ({
            name: resource.name ?? 'Resource',
            url: resource.url ?? '',
        })),
        completionDetails: skillTemplate?.CompletionDetails ?? '',
    };
}

async function approveSkill(courseId: string, skillName: string, studentEmail: string): Promise<void> {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${BASE_URL}/CheckStudentOff`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
        },
        body: JSON.stringify({
            Course_ID: courseId,
            Skill_Name: skillName,
            Student_List: [studentEmail],
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to approve skill: ${response.status}`);
    }
}

export default function InstructorSkillDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const studentEmail = decodeParam(params.email);
    const skillName = decodeParam(params.skillName);
    const courseId = decodeParam(params.courseId);
    const courseName = decodeParam(params.courseName) || courseId;
    const firstName = decodeParam(params.firstName);
    const lastName = decodeParam(params.lastName);

    const checkedOffParam = decodeParam(params.checkedOff);
    const statusParam = decodeParam(params.status);
    const checkedOff = checkedOffParam === 'true' || statusParam === 'true';

    const checkedOffBy = decodeParam(params.checkedOffBy);
    const dateCheckedOff = decodeParam(params.dateCheckedOff);

    const [skillData, setSkillData] = useState<SkillDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [approving, setApproving] = useState(false);

    useEffect(() => {
        async function loadSkillDetails() {
            try {
                const data = await fetchSkillDetails(courseId, skillName);
                setSkillData(data);
            } catch (loadError) {
                console.error('Failed to fetch skill details:', loadError);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        loadSkillDetails();
    }, [courseId, skillName]);

    async function handleApproveSkill() {
        try {
            setApproving(true);
            await approveSkill(courseId, skillName, studentEmail);
            Alert.alert('Success', `${skillName} approved for ${firstName} ${lastName}`);
            router.back();
        } catch (approveError) {
            console.error('Error approving skill:', approveError);
            Alert.alert('Error', 'Failed to approve skill');
        } finally {
            setApproving(false);
        }
    }

    function handleResourcePress(url: string) {
        if (!url || !url.startsWith('http')) {
            Alert.alert('Resource link not available');
            return;
        }

        Linking.openURL(url);
    }

    if (loading) {
        return <LoadingScreen />;
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Header
                    text={skillName || 'Skill Details'}
                    backArrow={true}
                    onBackPress={() => router.back()}
                />
                <AppText>Error. Can't fetch skill details</AppText>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Header
                text={skillName}
                backArrow={true}
                onBackPress={() => router.back()}
            />

            <View style={{ marginBottom: 24, padding: 16, backgroundColor: '#F2F2F7', borderRadius: 12 }}>
                <AppText style={{ fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 }}>
                    Student
                </AppText>
                <AppText style={{ fontSize: 16, color: '#4972FF', fontWeight: '500' }}>
                    {firstName} {lastName}
                </AppText>
                <AppText style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    {studentEmail}
                </AppText>
                <AppText style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                    Course: {courseName}
                </AppText>
            </View>

            {checkedOff && (
                <View style={{ marginBottom: 24, padding: 16, backgroundColor: '#D4F4DD', borderRadius: 12 }}>
                    <AppText style={{ fontSize: 14, fontWeight: '600', color: '#2E7D32', marginBottom: 4 }}>
                        ✓ Skill Completed
                    </AppText>
                    {dateCheckedOff ? (
                        <AppText style={{ fontSize: 12, color: '#2E7D32', marginTop: 4 }}>
                            Date: {dateCheckedOff}
                        </AppText>
                    ) : null}
                    {checkedOffBy ? (
                        <AppText style={{ fontSize: 12, color: '#2E7D32', marginTop: 2 }}>
                            By: {checkedOffBy}
                        </AppText>
                    ) : null}
                </View>
            )}

            <View style={{ marginBottom: 24 }}>
                <AppText style={{ fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 8 }}>
                    Skill Description
                </AppText>
                <View style={{ padding: 12, backgroundColor: '#F9F9F9', borderRadius: 8 }}>
                    <AppText style={{ fontSize: 14, color: '#333', lineHeight: 20 }}>
                        {skillData?.description}
                    </AppText>
                </View>
            </View>

            {skillData?.requirements.length ? (
                <View style={{ marginBottom: 24 }}>
                    <AppText style={{ fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 8 }}>
                        Requirements
                    </AppText>
                    <View style={{ padding: 12, backgroundColor: '#F9F9F9', borderRadius: 8 }}>
                        {skillData.requirements.map((requirement, index) => (
                            <AppText key={`${requirement}-${index}`} style={{ fontSize: 14, color: '#333', lineHeight: 20, marginBottom: index === skillData.requirements.length - 1 ? 0 : 6 }}>
                                • {requirement}
                            </AppText>
                        ))}
                    </View>
                </View>
            ) : null}

            {skillData?.resources.length ? (
                <View style={{ marginBottom: 24 }}>
                    <AppText style={{ fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 8 }}>
                        Resources
                    </AppText>
                    {skillData.resources.map((resource, index) => (
                        <Pressable
                            key={`${resource.name}-${index}`}
                            style={{
                                marginBottom: 10,
                                paddingHorizontal: 12,
                                paddingVertical: 10,
                                backgroundColor: '#F2F2F7',
                                borderRadius: 10,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                            onPress={() => handleResourcePress(resource.url)}
                        >
                            <AppText style={{ fontSize: 14, color: '#4972FF', flex: 1 }}>
                                {resource.name}
                            </AppText>
                            <AppText style={{ fontSize: 16, color: '#9AA0A6' }}>›</AppText>
                        </Pressable>
                    ))}
                </View>
            ) : null}

            {skillData?.completionDetails ? (
                <View style={{ marginBottom: 24 }}>
                    <AppText style={{ fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 8 }}>
                        Completion Details
                    </AppText>
                    <View style={{ padding: 12, backgroundColor: '#F9F9F9', borderRadius: 8 }}>
                        <AppText style={{ fontSize: 14, color: '#333', lineHeight: 20 }}>
                            {skillData.completionDetails}
                        </AppText>
                    </View>
                </View>
            ) : null}

            {!checkedOff ? (
                <>
                    <Pressable
                        style={[styles.refreshButton, approving && { opacity: 0.6 }]}
                        onPress={handleApproveSkill}
                        disabled={approving}
                    >
                        <AppText style={styles.refreshButtonText}>
                            {approving ? 'Approving...' : 'Approve Skill Proficiency'}
                        </AppText>
                    </Pressable>

                    <View style={{ marginTop: 24, padding: 12, backgroundColor: '#E8F0FE', borderRadius: 8, marginBottom: 40 }}>
                        <AppText style={{ fontSize: 12, color: '#1F47B6', lineHeight: 16 }}>
                            By approving this skill, you confirm that {firstName} has demonstrated proficiency and this skill will be marked as complete.
                        </AppText>
                    </View>
                </>
            ) : (
                <View style={{ marginTop: 24, padding: 12, backgroundColor: '#F2F2F7', borderRadius: 8, marginBottom: 40 }}>
                    <AppText style={{ fontSize: 12, color: '#666', lineHeight: 16 }}>
                        This skill has already been approved for {firstName}. If you need to make changes, please contact an administrator.
                    </AppText>
                </View>
            )}
        </ScrollView>
    );
}