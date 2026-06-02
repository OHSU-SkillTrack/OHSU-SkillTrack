import { fetchAuthSession } from 'aws-amplify/auth';
import { FlatList, View, Pressable, TouchableOpacity } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { BASE_URL } from '@/src/constants/api';

import { AppText } from "@/components/AppText";
import { SearchBar } from "@/components/ui/SearchBar";
import { Header } from "@/components/ui/Header";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

import styles from "@/app/styles";

import React from 'react';

interface Student {
    email: string;
    firstName: string;
    lastName: string;
}

interface CourseData {
    CourseName: string;
    Students: string[];
    Skills: Record<string, any>;
}

export default function CourseDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const courseId = params.courseId as string;
    const courseName = (params.courseName as string) || courseId;

    const [students, setStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    //for drag down refresh
    const [refreshing, setRefreshing] = React.useState(false);

    useEffect(() => {
        fetchStudents();
    }, [courseId]);


    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStudents();
        setRefreshing(false);
    }

    async function fetchStudents() {
        try {
            const session = await fetchAuthSession();
            const token = session.tokens?.idToken?.toString();

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(
                `${BASE_URL}/GetCourseInformation?Course_ID=${encodeURIComponent(courseId)}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": token,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const courseData: CourseData = await response.json();
            
            // Process students
            const studentsArray: Student[] = [];
            if (courseData.Students && Array.isArray(courseData.Students)) {
                courseData.Students.forEach((studentEmail: string) => {
                    // Extract name from email
                    const namePart = studentEmail.split('@')[0];
                    studentsArray.push({
                        email: studentEmail,
                        firstName: namePart,
                        lastName: '',
                    });
                });
            }

            setStudents(studentsArray);
        } catch (e) {
            setError(true);
            console.error('Error fetching students:', e);
        } finally {
            setLoading(false);
        }
    }

    const filteredStudents = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) {
            return students;
        }

        return students.filter((s) =>
            s.firstName.toLowerCase().includes(q) ||
            s.lastName.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q)
        );
    }, [students, searchQuery]);

    function handleStudentPress(student: Student) {
        router.push({
            pathname: '/(instructor)/(tabs)/courses/studentDetails' as any,
            params: {
                courseId: courseId,
                courseName: courseName,
                email: student.email,
                firstName: student.firstName,
                lastName: student.lastName,
            }
        });
    }

    const renderStudent = ({ item }: { item: Student }) => {
        return (
            <Pressable
                style={styles.courseCard}
                onPress={() => handleStudentPress(item)}
            >
                <View style={styles.courseHeader}>
                    <AppText style={styles.cardNameText}>
                        {item.firstName} {item.lastName}
                    </AppText>
                </View>
            </Pressable>
        );
    };

    if (loading) {
        return <LoadingScreen />;
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Header 
                    text={courseName} 
                    backArrow={true} 
                    onBackPress={() => router.back()}
                />
                <AppText>Error. Can't fetch data</AppText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header 
                text={courseName} 
                backArrow={true} 
                onBackPress={() => router.back()}
            />
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            
            {filteredStudents.length === 0 ? (
                <View style={styles.emptySearchContainer}>
                    <AppText style={styles.emptySearchText}>
                        {searchQuery ? "No students found" : "No students enrolled"}
                    </AppText>
                </View>
            ) : (
                <FlatList
                    data={filteredStudents}
                    renderItem={renderStudent}
                    keyExtractor={(item) => item.email}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    ListFooterComponent={
                        <View style={{ height: 100 }} />
                    }
                />
            )}

            {/* Add Student Button */}
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
                        router.push({
                            pathname: '/(instructor)/(tabs)/courses/addStudent' as any,
                            params: {
                                courseId: courseId,
                                courseName: courseName,
                            }
                        });
                    }}
                >
                    <Ionicons name="add" size={32} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
}
