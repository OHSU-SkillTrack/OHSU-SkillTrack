import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Pressable, FlatList, TextInput, ScrollView , Text} from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BASE_URL } from '@/src/constants/api';
import generalStyles from '@/app/styles';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/AppText'
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { SearchBar } from '@/components/ui/SearchBar';
import { Header } from '@/components/ui/Header';
import { SkillCard } from '@/components/skill/SkillCard';
import React from 'react';


interface Skill {
    skillName: string;
    status: boolean;
}

interface SkillCheckInfo {
    CheckedOff: boolean;
    CheckedOffBy: string;
    DateCheckedOff: string;
}


interface StudentData {
    Email: string;
    FirstName?: string | null;
    LastName?: string | null;
    Roles?: string | null;
    Courses?: Record<
        string,
        {
            CourseName?: string,
            Skills?: Record<string, SkillCheckInfo>
        }
    >;
}

export default function CourseDetails() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [skills, setSkills] = useState<Skill[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'complete' | 'incomplete'>('all');
    const [loading, setLoading] = useState(true);

    //for refresh control
    const [refreshing, setRefreshing] = React.useState(false);

    // Parse course data from params
    const courseName = decodeURIComponent(params.id as string); // for the UI
    const courseId = decodeURIComponent(params.courseId as string); // for the data
    // const year = parseInt(params.year as string) || 1;
    const totalSkills = parseInt(params.totalSkills as string) || 0;
    const completedSkillsFromParams = parseInt(params.completedSkills as string) || 0;

    const fetchCourseSkills = useCallback(async () => {
        try {
            setLoading(true);
            const session = await fetchAuthSession();
            const token = session.tokens?.idToken?.toString();

            if (!token) {
                console.error('No authentication token found');
                setLoading(false);
                return;
            }

            console.log('Fetching all data from /FetchUserData endpoint');
            const response = await fetch(`${BASE_URL}/FetchUserData`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: StudentData = await response.json();
            console.log('Full data received:', data);

            // Find the specific course in the data structure
            let courseSkills: Skill[] = [];

            const coursesObject = data.Courses;

            // updated to take years out and now only relies on course objects
            if (coursesObject && typeof coursesObject === 'object') {
                const matchedCourse = coursesObject?.[courseId]; // we now want to use courseId to match rather than just the name
                if (matchedCourse?.Skills) {
                    const skillEntries = Object.entries(matchedCourse.Skills);
                    courseSkills = skillEntries.map(([skillName, status]) => ({
                        skillName,
                        status: status.CheckedOff
                    }));
                    console.log(`Found ${skillEntries.length} skills for course: ${courseName}`);
                } else {
                    console.warn(`Course not found: ${courseName}`);
                }
            }

            setSkills(courseSkills);
            setLoading(false);

        } catch (error) {
            console.error('Error fetching course skills:', error);
            setLoading(false);
        }
    }, [courseName]);

    useEffect(() => {
        fetchCourseSkills();
    }, [fetchCourseSkills]);


    const onRefresh = async() =>{


        setRefreshing(true)
        await fetchCourseSkills()
        setRefreshing(false)
    }

    // const completedSkills = completedSkillsFromParams > 0 
    //   ? completedSkillsFromParams 
    //   : skills.filter(skill => skill.status).length;
    // const totalSkillsCount = totalSkills > 0 
    //   ? totalSkills 
    //   : skills.length;


    const filteredSkills = useMemo(() => {
        let filtered = skills;

        // Apply status filter
        if (filter === 'complete') {
            filtered = filtered.filter(skill => skill.status === true);
        } else if (filter === 'incomplete') {
            filtered = filtered.filter(skill => skill.status === false);
        }

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(skill =>
                skill.skillName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [searchQuery, filter, skills]);

    const handleFilterChange = (newFilter: 'all' | 'complete' | 'incomplete') => {
        setFilter(newFilter);
    };

    const handleSkillPress = (skill: Skill) => {
        router.push({
            pathname: '/mainFlow/skillDetails',  // update path to match your file structure
            params: {
                id: encodeURIComponent(skill.skillName),
                status: skill.status ? 'complete' : 'incomplete',
                courseName: encodeURIComponent(courseName),
                courseId: encodeURIComponent(courseId),
            }
        });
    };

    // we should consider making this blue to make it pop!

    // const getStatusColor = (status: boolean) => {
    //   return status ? '#4972FF' : '#000000';
    // };

    const renderSkillItem = ({ item }: { item: Skill }) => (
        <SkillCard skill={item} onPress={() => handleSkillPress(item)} />
    );

    return (
        <>
            <View style={generalStyles.container}>
                <Header text={courseName} backArrow={true} onBackPress={() => router.replace('/mainFlow/courses')} />

                {/* Search Bar */}
                <SearchBar value={searchQuery} onChange={setSearchQuery} />

                {/* Filter Buttons */}
                <View style={generalStyles.filterContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={generalStyles.filterScroll}
                    >
                        <Pressable
                            style={[
                                generalStyles.filterButton,
                                filter === 'all' && generalStyles.activeFilterButton
                            ]}
                            onPress={() => handleFilterChange('all')}
                        >
                            <AppText style={[
                                generalStyles.filterButtonText,
                                filter === 'all' && generalStyles.activeFilterButtonText
                            ]}>
                                All Skills
                            </AppText>
                        </Pressable>

                        <Pressable
                            style={[
                                generalStyles.filterButton,
                                filter === 'complete' && generalStyles.activeFilterButton
                            ]}
                            onPress={() => handleFilterChange('complete')}
                        >
                            <AppText style={[
                                generalStyles.filterButtonText,
                                filter === 'complete' && generalStyles.activeFilterButtonText
                            ]}>
                                Complete
                            </AppText>
                        </Pressable>

                        <Pressable
                            style={[
                                generalStyles.filterButton,
                                filter === 'incomplete' && generalStyles.activeFilterButton
                            ]}
                            onPress={() => handleFilterChange('incomplete')}
                        >
                            <AppText style={[
                                generalStyles.filterButtonText,
                                filter === 'incomplete' && generalStyles.activeFilterButtonText
                            ]}>
                                Incomplete
                            </AppText>
                        </Pressable>
                    </ScrollView>
                </View>

                {/* Skills List */}
                {loading ? (
                    <LoadingScreen />
                ) : filteredSkills.length === 0
                    ? (<View style={generalStyles.emptySearchContainer}>
                        <AppText style={generalStyles.emptySearchText}>No courses found!</AppText>
                    </View>)
                    : (<FlatList
                        data={filteredSkills}
                        renderItem={renderSkillItem}
                        keyExtractor={(item, index) => `${item.skillName}-${index}`}
                        contentContainerStyle={generalStyles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshing={refreshing}
                        onRefresh={onRefresh} 
                        ListFooterComponent={<View style={{ height: 100}}  />}
                    />)}
            
            </View>
        </>
    );
}