import { fetchAuthSession } from 'aws-amplify/auth';
import { FlatList, View } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useLocalSearchParams } from 'expo-router';

import { BASE_URL } from '@/src/constants/api';

import { AppText } from "@/components/AppText";
import { SearchBar } from "@/components/ui/SearchBar";
import { SkillCard } from "@/components/skill/SkillCard";
import { Header } from "@/components/ui/Header";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

import styles from "@/app/styles";

interface Skill {
    skillName: string;
    description: string;
    checkedOff: boolean;
    checkedOffBy?: string;
    dateCheckedOff?: string;
}

interface CourseData {
    CourseName: string;
    Students: string[];
    Skills: Record<string, { Description: string }>;
    StudentsExtended?: Record<string, {
        FirstName?: string;
        LastName?: string;
        Courses: Record<string, {
            CourseName: string;
            Skills: Record<string, {
                CheckedOff: boolean;
                CheckedOffBy?: string;
                DateCheckedOff?: string;
            }>;
        }>;
    }>;
}

export default function StudentDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const studentEmail = params.email as string;
    const [firstName, setFirstName] = useState<string>(params.firstName as string);
    const [lastName, setLastName] = useState<string>(params.lastName as string);
    const courseId = params.courseId as string;
    const courseName = (params.courseName as string) || courseId;

    const [skills, setSkills] = useState<Skill[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchSkills() {
            try {
                const session = await fetchAuthSession();
                const token = session.tokens?.idToken?.toString();
                
                if (!token) {
                    throw new Error('No auth token');
                }

                const url = `${BASE_URL}/GetCourseInformation?Course_ID=${encodeURIComponent(courseId)}&Student_Emails=${encodeURIComponent(studentEmail)}`;
                
                const res = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token,
                    },
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data: CourseData = await res.json();

                // Extract skills with their status for this student
                const items: Skill[] = [];
                
                // StudentsExtended is an object keyed by email
                const studentData = data.StudentsExtended?.[studentEmail];
                

                //set actual name and last name now that we have it
                setFirstName(studentData?.FirstName as string)
                setLastName(studentData?.LastName as string)


                // Skills are nested under Courses[courseId].Skills
                const studentSkills = studentData?.Courses?.[courseId]?.Skills;
                
                if (data?.Skills && typeof data.Skills === 'object') {
                    Object.entries(data.Skills).forEach(([skillName, skillInfo]) => {
                        // Check if this student has completed this skill
                        const skillStatus = studentSkills?.[skillName];
                        
                        items.push({
                            skillName,
                            description: skillInfo?.Description || '',
                            checkedOff: skillStatus?.CheckedOff || false,
                            checkedOffBy: skillStatus?.CheckedOffBy,
                            dateCheckedOff: skillStatus?.DateCheckedOff,
                        });
                    });
                }

                setSkills(items);
            } catch (e) {
                setError(true);
                console.error('Error fetching skills:', e);
            } finally {
                setLoading(false);
            }
        }

        fetchSkills();
    }, [courseId, studentEmail]);

    const filteredSkills = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) {
            return skills;
        }

        return skills.filter(skill =>
            skill.skillName.toLowerCase().includes(q)
        );
    }, [skills, searchQuery]);

    function handleSkillPress(skill: Skill) {
        router.push({
            pathname: '/(instructor)/(tabs)/courses/skillDetails' as any,
            params: {
                courseId: courseId,
                courseName: courseName,
                email: studentEmail,
                skillName: skill.skillName,
                description: skill.description,
                firstName,
                lastName,
                checkedOff: skill.checkedOff.toString(),
                checkedOffBy: skill.checkedOffBy || '',
                dateCheckedOff: skill.dateCheckedOff || '',
            }
        });
    }

    const renderSkill = ({ item }: { item: Skill }) => {
        return (
            <SkillCard 
                skill={{ skillName: item.skillName, status: item.checkedOff }}
                onPress={() => handleSkillPress(item)}
            />
        );
    };

    if (loading) {
        return <LoadingScreen />;
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Header 
                    text={`${firstName} ${lastName}`} 
                    backArrow={true} 
                    onBackPress={() => router.back()}
                />
                <AppText>Error. Can't fetch data</AppText>
            </View>
        );
    }

    const completedCount = skills.filter(s => s.checkedOff).length;
    const totalCount = skills.length;

    return (
        <View style={styles.container}>
            <Header 
                text={`${firstName} ${lastName}`} 
                backArrow={true} 
                onBackPress={() => router.back()}
            />
            
            <View style={{ marginBottom: 16 }}>
                <AppText style={styles.courseProgressText}>
                    {completedCount} of {totalCount} skills completed
                </AppText>
            </View>

            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            
            {filteredSkills.length === 0 ? (
                <View style={styles.emptySearchContainer}>
                    <AppText style={styles.emptySearchText}>
                        {searchQuery ? "No skills found" : "No skills available"}
                    </AppText>
                </View>
            ) : (
                <FlatList
                    data={filteredSkills}
                    renderItem={renderSkill}
                    keyExtractor={(item) => item.skillName}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}
