import { fetchAuthSession } from 'aws-amplify/auth';
import { FlatList, View, TouchableOpacity } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { BASE_URL } from '@/src/constants/api';

import { AppText } from "@/components/AppText";
import { SearchBar } from "@/components/ui/SearchBar";
import { CourseCard } from "@/components/course/CourseCard";
import { Header } from "@/components/ui/Header";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

import React from 'react';

import styles from "@/app/styles";

interface Course {
    courseId: string;
    courseName: string;
    studentCount: number;
}

interface TeacherData {
    Email: string;
    FirstName?: string | null;
    LastName?: string | null;
    Roles?: string | null;
    TeachingTheseCourses?: string[];
}

interface CourseData {
    CourseName: string;
    Students: string[];
    Skills: Record<string, any>;
}

async function fetchInstructorCourses() {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (!token) {
        throw new Error("No idToken found");
    }

    // Get instructor's courses
    const userResponse = await fetch(`${BASE_URL}/FetchUserData`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token,
        },
    });

    if (!userResponse.ok) {
        throw new Error(`HTTP error! status: ${userResponse.status}`);
    }

    const userData: TeacherData = await userResponse.json();
    const coursesTeaching = userData.TeachingTheseCourses || [];

    // Fetch course details for each course
    const coursePromises = coursesTeaching.map(async (courseId) => {
        try {
            const res = await fetch(`${BASE_URL}/GetCourseInformation?Course_ID=${encodeURIComponent(courseId)}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token,
                },
            });
            
            if (!res.ok) {
                console.error(`Failed to fetch course ${courseId}`);
                return null;
            }

            const courseData: CourseData = await res.json();
            return {
                courseId,
                courseName: courseData.CourseName || courseId,
                studentCount: courseData.Students?.length || 0,
            };
        } catch (err) {
            console.error(`Error fetching course ${courseId}:`, err);
            return null;
        }
    });

    const coursesData = await Promise.all(coursePromises);
    return coursesData.filter((c): c is Course => c !== null);
}

export default function InstructorCourses() {
    const router = useRouter();
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = React.useState(false);

    useEffect(() => {

        loadCourses();
        
    }, []);


    const onRefresh = async () =>{
        setRefreshing(true)
        await loadCourses()
        setRefreshing(false)
    }

    async function loadCourses() {
        try {
            const fetchedCourses = await fetchInstructorCourses();
            setCourses(fetchedCourses);
        } catch (e) {
            setError(true);
            console.error("Failed to fetch instructor courses", e);
        } finally {
            setLoading(false);
        }
    }

    const filteredCourses = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) {
            return courses;
        }
        return courses.filter((c) =>
            c.courseId.toLowerCase().includes(q) ||
            c.courseName.toLowerCase().includes(q)
        );
    }, [courses, searchQuery]);

    function handleCoursePress(course: Course) {
        router.push({
            pathname: '/(instructor)/(tabs)/courses/courseDetails' as any,
            params: {
                courseId: course.courseId,
                courseName: course.courseName,
            }
        });
    }

    const renderCourse = ({ item }: { item: Course }) => {
        return (
            <CourseCard course={item} onPress={handleCoursePress} />
        );
    };

    if (loading) {
        return <LoadingScreen />;
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Header text="My Courses" backArrow={false} />
                <AppText>Error. Can't fetch data</AppText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header text="My Courses" backArrow={false} />
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            
            {filteredCourses.length === 0 ? (
                <View style={styles.emptySearchContainer}>
                    <AppText style={styles.emptySearchText}>
                        {searchQuery ? "No courses found" : "No courses assigned"}
                    </AppText>
                </View>
            ) : (
                <FlatList
                    data={filteredCourses}
                    renderItem={renderCourse}
                    keyExtractor={(item) => item.courseId}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={onRefresh} 
                    ListFooterComponent={
                        <View style={{ height: 100 }} />
                    }
                />
            )}
            
            {/* Add Course Button */}
            <View style={{ position: 'absolute', bottom: 110, alignSelf: 'center' }}>
                <TouchableOpacity
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: '#4972FF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        elevation: 8,
                    }}
                    onPress={() => {
                        router.push('/(instructor)/(tabs)/courses/addCourse' as any);
                    }}
                >
                    <Ionicons name="add" size={32} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
}
