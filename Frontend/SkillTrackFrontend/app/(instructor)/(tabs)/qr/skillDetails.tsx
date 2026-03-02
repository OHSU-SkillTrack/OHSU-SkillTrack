// app/(instructor)/(tabs)/qr/skillDetails.tsx
import { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, Linking, Alert, StyleSheet } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BASE_URL } from '@/src/constants/api';
import { AppText } from '@/components/AppText';
import { Header } from '@/components/ui/Header';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Ionicons } from '@expo/vector-icons';
import generalStyles from '@/app/styles';

// represents skill data we show in UI
interface SkillDetailData {
    skillName: string;
    description: string;
    requirements: string[];
    resources: Array<{ name: string; url: string }>;
    completionDetails: string;
}

// represents the response we get from /GetCourseInformation
interface CourseInfoResponse {
    Skills?: Record<string, {
        Description?: string;
        Requirements?: string[];
        Resources?: Array<{ name: string; url?: string }>;
        CompletionDetails?: string;
    }>;
}

// this function calls /GetCourseInformation again to retrieve all the skill details
// figured this would be easier than trying to pass in everything as params from the last page
async function fetchSkillDetails(courseId: string, skillName: string): Promise<SkillDetailData> {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (!token) throw new Error('No auth token');

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

    if (!response.ok) throw new Error(`Failed to fetch course info: ${response.status}`);

    // here we get the specific skill within the course
    const courseInfo: CourseInfoResponse = await response.json();
    const skillTemplate = courseInfo?.Skills?.[skillName];
    if (!skillTemplate) throw new Error(`Skill "${skillName}" not found in course`);

    // return data to display in UI
    return {
        skillName,
        description: skillTemplate.Description ?? 'No description available.',
        requirements: skillTemplate.Requirements ?? ['No requirements available.'],
        resources: (skillTemplate.Resources ?? []).map((r) => ({
            name: r.name ?? 'Resource',
            url: r.url ?? '#',
        })),
        completionDetails: skillTemplate.CompletionDetails ?? 'No completion details available.',
    };
}

// this function calls a POST to /CheckStudentOff for instructors to approve skills
async function approveSkill(courseId: string, skillName: string, studentEmail: string): Promise<void> {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (!token) throw new Error('No authentication token found');

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

    if (!response.ok) throw new Error(`Failed to approve skill: ${response.status}`);
}

export default function SkillApprovalScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // decode the params we received from courseDetails page
    const studentEmail = decodeURIComponent(params.email as string);
    const skillName = decodeURIComponent(params.skillName as string);
    const courseId = params.courseId as string;
    const firstName = params.firstName as string;
    const lastName = params.lastName as string;
    const isComplete = params.status === 'true';

    // use states to display our data
    const [skillData, setSkillData] = useState<SkillDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [approving, setApproving] = useState(false);

    // load skill details onto page
    useEffect(() => {
        async function loadSkillDetails() {
            try {
                const data = await fetchSkillDetails(courseId, skillName);
                setSkillData(data);
            } catch (e) {
                console.error('Failed to fetch skill details', e);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        loadSkillDetails();
    }, [courseId, skillName]);

    // function for when instructor decides to check off a skill
    // to show them if it was successful or not
    async function handleApproveSkill() {
        try {
            setApproving(true);
            await approveSkill(courseId, skillName, studentEmail);
            Alert.alert('Success', `${skillName} approved for ${firstName} ${lastName}`);
            router.back();
        } catch (e) {
            console.error('Error approving skill:', e);
            Alert.alert('Error', 'Failed to approve skill');
        } finally {
            setApproving(false);
        }
    }

    // we've discussed that resources would likely be URL's to another site/page
    // i.e. a google doc/drive, their canvas page, etc
    function handleResourcePress(url: string) {
        if (url && url !== '#' && url.startsWith('http')) {
            Linking.openURL(url);
        } else {
            Alert.alert('Resource link not available');
        }
    }

    if (loading || approving) return <LoadingScreen />;
    if (error) return <AppText>Error. Can't fetch skill details</AppText>;

    return (
        <View style={generalStyles.container}>   
            <Header 
                text={`${firstName} ${lastName}`} 
                backArrow={true}
                // NOTE: must test if this actually goes back to camera once QR code is implemented.
                onBackPress={() => router.back()}/>
                <AppText style={styles.subtitle}>{skillName}</AppText>

                {/* Status Badge, NOTE: do we want this in the Scroll or below the header? */}
                <View style={styles.statusSection}>
                    {isComplete ? (
                        <View style={styles.statusRow}>
                            <Ionicons name="checkmark-outline" size={20} color="#4972FF" />
                            <AppText style={[styles.statusText, { color: '#4972FF' }]}>Complete</AppText>
                        </View>
                    ) : (
                        <AppText style={[styles.statusText, { color: '#919191' }]}>Incomplete</AppText>
                    )}
                </View>

            <ScrollView showsVerticalScrollIndicator={false}>
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
                    <AppText style={styles.completionText}>{skillData?.completionDetails}</AppText>
                </View>

                {/* Approve Button, NOTE: instructors can approve a skill multiple times, let's make sure it shows that */}
                {!isComplete && (
                    <Pressable style={generalStyles.refreshButton} onPress={handleApproveSkill}>
                        <AppText style={generalStyles.refreshButtonText}>
                            Approve Skill Proficiency
                        </AppText>
                    </Pressable>
                )}

                <View style={styles.spacer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
    },
    statusSection: {
        marginBottom: 24,
        alignItems: 'center',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusText: {
        fontSize: 20,
        fontWeight: '600',
    },
    infoCard: {
        marginBottom: 24,
        padding: 16,
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    studentName: {
        fontSize: 16,
        color: '#4972FF',
        fontWeight: '500',
    },
    studentEmail: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 16,
    },
    descriptionText: {
        fontSize: 20,
        color: '#000',
        lineHeight: 24,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    bullet: {
        fontSize: 17,
        color: '#000',
        marginRight: 8,
        lineHeight: 24,
    },
    requirementText: {
        fontSize: 20,
        color: '#000',
        lineHeight: 24,
        flex: 1,
    },
    resourceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F2F2F7',
        borderRadius: 30,
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
    },
    completionText: {
        fontSize: 20,
        color: '#000',
        lineHeight: 24,
    },
    spacer: {
        height: 40,
    },
});