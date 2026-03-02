// this file represents the list of skills associated to a particular course
// app/(instructor)/(tabs)/qr/courseDetails.tsx
import { useState, useEffect, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BASE_URL } from '@/src/constants/api';
import { AppText } from '@/components/AppText';
import { Header } from '@/components/ui/Header';
import { SearchBar } from '@/components/ui/SearchBar';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { SkillCard } from '@/components/skill/SkillCard';
import generalStyles from '@/app/styles';

// represnts a skill
interface SkillItem {
    skillName: string;
    status: boolean;
}

// represents the data from API for /GetCourseInformation
interface CourseSkillsData 
{
    Skills?: 
        Record<string, 
        { 
            Description?: string; 
            CheckedOff?: boolean 
        }
        >;
}

// this function fetches the skills from a course and uses the skillStatuses that were passed in
// so that we can show the teacher which skills the students have been checked off on for a particular course 
async function fetchCourseSkills(courseId: string, skillStatuses: Record<string, boolean>): Promise<SkillItem[]> {
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

    if (!response.ok) throw new Error(`Failed to fetch course ${courseId}: ${response.status}`);

    const data: CourseSkillsData = await response.json();

    // meap the name and completion status for each skill
    return Object.entries(data.Skills ?? {}).map(([skillName]) => ({
        skillName,
        status: skillStatuses[skillName] ?? false
    }));
}

export default function StudentCourseSkills() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // decode the params we received from QR Code Scan
    const studentEmail = decodeURIComponent(params.email as string);
    const firstName = params.firstName as string;
    const lastName = params.lastName as string;
    const courseId = params.courseId as string;
    const courseName = params.courseName as string;
    const skillStatuses: Record<string, boolean> = JSON.parse(params.skillStatuses as string ?? '{}');

    // use states for displaying data
    const [skills, setSkills] = useState<SkillItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // load course details on the page
    // of course, it shows the classes you teach that the student is enrolled in
    useEffect(() => {
        async function loadSkills() {
        try {
            const parsed = await fetchCourseSkills(courseId, skillStatuses);
            setSkills(parsed);
        } catch (e) {
            console.error('Failed to fetch course skills', e);
            setError(true);
        } finally {
            setLoading(false);
        }
        }

        loadSkills();
    }, [courseId]);

    // useful for search bar and to filter completed courses at the bottom
    const filteredSkills = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        const filtered = !q ? skills : skills.filter((s) => s.skillName.toLowerCase().includes(q));
        return [...filtered].sort((a, b) => Number(a.status) - Number(b.status));
    }, [skills, searchQuery]);

    // when an instructor clicks a skill,
    // navifate to that skillDetail page to check off
    function handleSkillPress(skill: SkillItem) {
        router.push({
        pathname: '/(instructor)/(tabs)/qr/skillDetails',
        params: {
            email: encodeURIComponent(studentEmail),
            skillName: encodeURIComponent(skill.skillName),
            courseId,
            firstName,
            lastName,
        },
        });
    }

    if (loading) return <LoadingScreen />;
    if (error) return <AppText>Error. Can't fetch course skills</AppText>;

    return (
        <View style={generalStyles.container}>
            <Header 
                text={`${firstName} ${lastName}`} 
                backArrow={true}
                // NOTE: must test if this actually goes back to camera once QR code is implemented.
                onBackPress={() => router.back()}/>
                <AppText style={styles.subtitle}>{courseName ?? courseId}</AppText>

        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <FlatList
            data={filteredSkills}
            keyExtractor={(item) => item.skillName}
            renderItem={({ item }) => (
            <SkillCard 
            skill={item} 
            onPress={handleSkillPress} />
            )}
            contentContainerStyle={generalStyles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
            <View style={styles.emptyState}>
                <AppText style={styles.subtitle}>No skills found</AppText>
            </View>
            }
        />
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
listContent: {
    paddingBottom: 40,
},
emptyState: {
    alignItems: 'center',
    marginTop: 40,
},
emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
},
emptyTitle: {
    fontSize: 16,
    color: '#666',
},
});