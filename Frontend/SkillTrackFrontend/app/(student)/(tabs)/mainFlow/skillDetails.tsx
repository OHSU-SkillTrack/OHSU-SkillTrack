import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Linking } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { BASE_URL } from '@/src/constants/api';
import generalStyles from '@/app/styles';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText'

interface SkillDetailData {
    skillName: string;
    description: string;
    requirements: string[];
    resources: Array<{
        name: string;
        url: string;
    }>;
    checkedOff: boolean;
    checkedOffBy?: string;
    dateCheckedOff?: string;
}

interface CourseInfoResponse {
    CourseName?: string;
    Skills?: Record<string,
        {
            Description?: string;
            Requirements?: string[];
            Resources?: Array<{ name: string; url?: string }>;
        }>;
}

interface UserDataResponse {
    Courses?: Record<
        string,
        {
            Skills?: Record<
                string,
                {
                    CheckedOff?: boolean;
                    CheckedOffBy?: string;
                    DateCheckedOff?: string;
                }
            >;
        }
    >;
}

export default function SkillDetail() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [loading, setLoading] = useState(false);

    const [skillData, setSkillData] = useState<SkillDetailData | null>(null);

    // Parse skill data from params
    const skillName = decodeURIComponent(params.id as string);
    const status = params.status as string || 'incomplete';
    const courseName = decodeURIComponent(params.courseName as string) || 'Unknown Course';

    const isComplete = status === 'complete';

    const courseId = params.courseId as string;

    const handleBack = () => {
        if (courseName) {
            router.replace({
                pathname: "/mainFlow/courseDetails",
                params: { id: encodeURIComponent(courseName), courseId },
            });
        } else {
            router.back(); // hopefully the top works so this doesnt take us to the profile page
            console.log("Error going back to course ", { courseName })
        }
    }


    useEffect(() => {
        const fetchSkillDetails = async () => {
            try {
                setLoading(true);

                const session = await fetchAuthSession();
                const token = session.tokens?.idToken?.toString();

                if (!token) {
                    console.error('No authentication token found');
                    setLoading(false);
                    return;
                }

                console.log('fetching skill details from: ', `${BASE_URL}/GetCourseInformation`)
                // Get all data to verify skill status based on courseId
                const response = await fetch(`${BASE_URL}/GetCourseInformation?Course_ID=${encodeURIComponent(courseId)}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token,
                    },
                });

                console.log('Fetching info for courseId: ', courseId);

                // friendlier error responses
                if (!response.ok) {
                    const text = await response.text();
                    console.error('/GetCourseInformation call failed:', {
                        status: response.status,
                        body: text,
                        courseIdSent: courseId,
                    });
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const courseInfo: CourseInfoResponse = await response.json();
                console.log('course info: ', courseInfo);

                const userResponse = await fetch(`${BASE_URL}/FetchUserData`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token,
                    },
                });

                if (!userResponse.ok) {
                    throw new Error(`User data request failed: ${userResponse.status}`);
                }

                const userData: UserDataResponse = await userResponse.json();
                const studentSkill = userData.Courses?.[courseId]?.Skills?.[skillName];

                const skillTemplate = courseInfo?.Skills?.[skillName];

                if (!skillTemplate) {
                    console.warn('Skill not found in course: ', { courseName, skillName });
                    setLoading(false);
                    return;
                }


                setSkillData({
                    skillName,
                    description: skillTemplate.Description ?? 'No description available.',
                    requirements: skillTemplate.Requirements ?? ['No requirements available.'],
                    resources: (skillTemplate.Resources ?? []).map((r) => ({
                        name: r.name ?? 'Resource',
                        url: r.url ?? '#',
                    })),
                    checkedOff: Boolean(studentSkill?.CheckedOff),
                    checkedOffBy: studentSkill?.CheckedOffBy,
                    dateCheckedOff: studentSkill?.DateCheckedOff,
                }),

                    setLoading(false);
            } catch (error) {
                console.error('Error verifying skill status:', error);
                setLoading(false);
            }
        };

        fetchSkillDetails();
    }, [skillName, courseName, courseId, isComplete]);

    const handleResourcePress = (url: string) => {
        if (url && url !== '#' && url.startsWith('http')) {
            Linking.openURL(url);
        } else {
            alert('Resource link not available');
        }
    };

    // NOTE: once we get the teacher checkoff functionality we must update this!
    const handleGetCheckedOff = async () => {
        try {
            router.replace('/profile')
            //alert(`Skill "${skillName}" would be marked as complete. This requires instructor verification.`);

            // Optional: Log to console for debugging
            console.log('Skill completion requested:', {
                skillName,
                courseName,
                studentEmail: 'test@example.com' // Would get from auth session
            });

        } catch (error) {
            console.error('Error marking skill as complete:', error);
            alert('Failed to update skill status');
        }
    };

    if (loading) {
        return (
            <>
                <Stack.Screen
                    options={{
                        headerTitle: skillName,
                        headerBackTitle: 'Back',
                    }}
                />
                <View style={styles.screen}>
                    <AppText style={styles.loadingText}>Loading skill details...</AppText>
                </View>
            </>
        );
    }

    return (
        <>
            <View style={styles.screen}>
                <View style={styles.topRow}>
                    <Pressable
                        onPress={() => handleBack()}
                        hitSlop={12}
                        accessibilityLabel="Back"
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back-outline" size={28} color="#000000" />
                    </Pressable>
                    <Ionicons name="checkmark-circle-outline" size={30} color="#4972FF" />
                </View>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <AppText style={styles.title}>{skillName}</AppText>

                    {/* Status Badge */}
                    <View style={styles.statusSection}>
                        {isComplete ? (
                            <View style={styles.completedBadgeRow}>
                                <Ionicons name="checkmark" size={26} color="#4972FF" />
                                <AppText style={styles.completedBadgeText}>Completed Skill</AppText>
                            </View>
                        ) : (
                            <AppText style={styles.incompleteBadgeText}>Not Completed Yet</AppText>
                        )}
                    </View>

                    {/* Details Section */}
                    <View style={styles.section}>
                        <AppText style={styles.sectionTitle}>Details</AppText>
                        <AppText style={styles.descriptionText}>{skillData?.description}</AppText>
                    </View>

                    {/* Requirements Section */}
                    <View style={styles.section}>
                        <AppText style={styles.sectionTitle}>Requirements</AppText>
                        {skillData?.requirements.map((requirement, index) => (
                            <View key={index} style={styles.requirementItem}>
                                <AppText style={styles.bullet}>•</AppText>
                                <AppText style={styles.requirementText}>{requirement}</AppText>
                            </View>
                        ))}
                    </View>

                    {/* Resources Section */}
                    <View style={styles.section}>
                        <AppText style={styles.sectionTitle}>Resources</AppText>
                        {skillData?.resources.map((resource, index) => (
                            <Pressable
                                key={index}
                                style={styles.resourceItem}
                                onPress={() => handleResourcePress(resource.url)}
                            >
                                <AppText style={styles.resourceName}>{resource.name}</AppText>
                                <AppText style={styles.resourceArrow}>›</AppText>
                            </Pressable>
                        ))}
                    </View>

                    {/* Completion Details */}
                    <View style={styles.section}>
                        <AppText style={styles.sectionTitle}>Completion Details</AppText>
                        {skillData?.checkedOff ? (
                            <View style={styles.completionCard}>
                                <AppText style={styles.completionLine}>
                                    <AppText style={styles.completionLabelInline}>Instructor Name: </AppText>
                                    {skillData.checkedOffBy || 'Unknown Instructor'}
                                </AppText>
                                {skillData.checkedOffBy ? (
                                    <AppText style={styles.completionLine}>
                                        <AppText style={styles.completionLabelInline}>Date: </AppText>
                                        {skillData.dateCheckedOff || 'Not provided'}
                                    </AppText>
                                ) : null}
                            </View>
                        ) : (
                            <View style={styles.completionCard}>
                                <AppText style={styles.completionLine}>
                                    <AppText style={styles.completionLabelInline}>Status: </AppText>
                                    This skill has not been checked off yet.
                                </AppText>
                            </View>
                        )}
                    </View>

                    {/* Action Button */}
                    <Pressable
                        style={[
                            styles.actionButton,
                            { backgroundColor: isComplete ? '#4972FF' : '#F4F4F4' }
                        ]}
                        onPress={handleGetCheckedOff}
                    >
                        <AppText style={[
                            styles.actionButtonText,
                            { color: isComplete ? '#ffffff' : '#000000' }
                        ]}>
                            {isComplete ? 'Skill Complete' : 'Get Checked Off'}
                        </AppText>
                    </Pressable>

                    {/* Spacer */}
                    <View style={styles.spacer} />
                </ScrollView>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: 35,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginBottom: 42,
    },
    backButton: {
        padding: 4,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 36,
        paddingBottom: 120,
    },
    title: {
        width: '100%',
        maxWidth: 325,
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 25,
        fontWeight: '400',
        color: '#000000',
        lineHeight: 33,
        marginBottom: 20,
    },

    statusSection: {
        marginBottom: 24,
        alignItems: 'center',
    },
    completedBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    completedBadgeText: {
        fontSize: 20,
        fontWeight: '400',
        color: '#4972FF',
        lineHeight: 27,
        textAlign: 'center',
    },
    incompleteBadgeText: {
        fontSize: 20,
        fontWeight: '400',
        color: '#919191',
        lineHeight: 27,
        textAlign: 'center',
    },

    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000000',
        lineHeight: 27,
        marginBottom: 10,
    },

    descriptionText: {
        fontSize: 20,
        color: '#000000',
        lineHeight: 27,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    bullet: {
        fontSize: 17,
        color: '#000000',
        marginRight: 8,
        lineHeight: 24,
    },
    requirementText: {
        fontSize: 20,
        color: '#000000',
        lineHeight: 27,
        flex: 1,
    },
    resourceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F2F2F7',
        borderRadius: 24,
        padding: 16,
        marginBottom: 10,
    },
    resourceName: {
        fontSize: 17,
        color: '#4972FF',
        fontWeight: '500',
    },
    resourceArrow: {
        fontSize: 20,
        color: '#C7C7CC',
        fontWeight: '300',
    },
    completionCard: {
        paddingHorizontal: 18,
        paddingVertical: 16,
        backgroundColor: '#F2F2F7',
        borderRadius: 18,
    },
    completionLine: {
        fontSize: 20,
        color: '#000000',
        lineHeight: 27,
        marginBottom: 6,
    },
    completionLabelInline: {
        fontSize: 20,
        color: '#666666',
        fontWeight: '400',
    },
    actionButton: {
        borderRadius: 30,
        paddingVertical: 12,
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: 8,
        width: 250,
    },
    actionButtonText: {
        fontSize: 20,
        fontWeight: '600',
    },
    spacer: {
        height: 24,
    },
    loadingText: {
        fontSize: 17,
        color: '#8E8E93',
        textAlign: 'center',
        marginTop: 40,
    },
});