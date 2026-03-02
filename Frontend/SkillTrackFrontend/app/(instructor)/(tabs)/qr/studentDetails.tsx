// this file represents student detail page after an instructor has scanned that student's QR code
// the page should show the students name, email, and list of courses (along with how many skills the student has completed in those courses)

// app/(instructor)/(tabs)/qr/[email].tsx
import { useState, useEffect, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BASE_URL } from '@/src/constants/api';
import { AppText } from '@/components/AppText';
import { Header } from '@/components/ui/Header';
import { SearchBar } from '@/components/ui/SearchBar';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { CourseCard } from '@/components/course/CourseCard';
import generalStyles from '@/app/styles';

// since our QR code only provides us with the student's email,
// we have to have these interfaces so we can fetch and parse our data

// represents the format we receive the data
interface CourseData {
    CourseName?: string;
    Skills?: Record<string, SkillData>;
}

// represents the student data
interface StudentData {
    FirstName?: string | null;
    LastName?: string | null;
    Courses?: Record<string, CourseData>;
    [key: string]: any; // this lets us access our students via email like data[studentEmail] (line 67)
}

// represents a course with the fields we want shown on the UI
interface Course {
    courseId: string; // example would be "NRS-210-UNIQUEID"
    courseName: string; // example would be "Health Promotions"
    totalSkills: number;
    completedSkills: number;
}

// skill data needed for progress
interface SkillData {
  CheckedOff: boolean;
}

// this function is for when we need to make the call to fetch student data
// refactored the previous useEffect to make code cleaner for future developers/debugging
async function fetchStudentData(email: string): Promise<StudentData> {
    // instructor login token
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (!token) throw new Error('No idToken found for instructor');

    // request student data based on student email
    const response = await fetch(`${BASE_URL}/FetchUserData?Student_Emails=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        },
    });

    if (!response.ok) throw new Error(`Failed to fetch student data for ${email}`);
    return response.json();
}

export default function StudentProfileScreen() {
    const router = useRouter();

    // get student email from params we passed in on QR page
    const { email } = useLocalSearchParams();
    const studentEmail = decodeURIComponent(email as string);

    // use states to display our data
    const [student, setStudent] = useState<StudentData | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [skillStatuses, setSkillStatuses] = useState<Record<string, Record<string, boolean>>>({});

    // loading/error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // once the page loads, we can fetch and save our data
    useEffect(() => {
        async function loadStudent() {
            try {
                // try to fetch data and retrieve it using the email as the key
                const data = await fetchStudentData(studentEmail);
                const studentData: StudentData = data[studentEmail];
                setStudent(studentData);

                // we need to map our status so we can display how many skills are completed
                const statuses = Object.fromEntries(
                    Object.entries(studentData.Courses ?? {}).map(([courseId, course]) => [
                        courseId,
                        Object.fromEntries(
                            Object.entries((course as CourseData).Skills ?? {}).map(([skillName, skill]) => [
                                skillName,
                                skill.CheckedOff,
                            ])
                        ),
                    ])
                );

                setSkillStatuses(statuses);

                // converts the courses from the response into our Course array to display it as a list
                const parsed: Course[] = Object.entries(studentData.Courses ?? {}).map( // check for null cases
                    // map everything
                    ([courseId, course]) => {
                        const skillsArray = Object.values((course as CourseData).Skills ?? {});
                        const totalSkills = skillsArray.length;
                        const completedSkills = skillsArray.filter((s) => s.CheckedOff).length;

                        return{
                            courseId,
                            courseName: (course as CourseData).CourseName ?? 'Unnamed Course',
                            totalSkills,
                            completedSkills,
                        };
                    }
                );

                setCourses(parsed);
                
            } catch (e) {
                console.error('Failed to fetch student data', e);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        loadStudent();

    }, [studentEmail]); // only reloads if the email changes

    // searching feature (this is used across all pages so I wonder if theres a way to make it universally accessible...)
    const filteredCourses = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return courses;
        return courses.filter((c) => c.courseName.toLowerCase().includes(q));
    }, [courses, searchQuery]);

    // once the instructor clicks a course, it takes them to the course details page
    function handleCoursePress(course: Course) {
        router.push({
        pathname: '/(instructor)/(tabs)/qr/courseDetails',

        // pass in the needed parameters for our next screen
        params: {
            courseId: course.courseId,
            courseName: course.courseName,
            email: encodeURIComponent(studentEmail),
            firstName: student?.FirstName ?? '',
            lastName: student?.LastName ?? '',

            // NOTE: does the checkoff include the person and date of checkoff...??? doesnt seem so yet
            skillStatuses: JSON.stringify(
                skillStatuses[course.courseId]
            )
        },
        });
    }

    // render our course using our new component!
    // if we want to update it to look different, we can, but for consistency sake this is solid
    const renderCourse = ({ item }: { item: Course }) => (
    <CourseCard course={item} onPress={handleCoursePress} />
    );

    if (loading) return <LoadingScreen />;

    // NOTE: probably add some useful info in the log if needed?
    if (error) return <AppText>Error. Can't fetch data</AppText>;

    return (
        <View style={generalStyles.container}>
            {/* NOTE: if we wanted to componentize this header and subtitle thing we can... */}

            <Header 
                text={`${student?.FirstName} ${student?.LastName}`} 
                backArrow={true} 

                // NOTE: must test if this actually goes back to camera once QR code is implemented.
                onBackPress={() => router.back()}/>
            <AppText style={styles.subtitle}>Current Courses</AppText>

            <SearchBar value={searchQuery} onChange={setSearchQuery} />

            <FlatList
                data={filteredCourses}
                keyExtractor={(item) => item.courseId}
                renderItem={renderCourse}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}

                // NOTE: should probably update this UI
                ListEmptyComponent={
                <View style={styles.emptyState}>
                    <AppText style={styles.emptyIcon}>📚</AppText>
                    <AppText style={styles.emptyTitle}>No courses found</AppText>
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