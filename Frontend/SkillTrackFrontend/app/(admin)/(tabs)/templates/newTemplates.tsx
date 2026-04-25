import { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, Alert, ActivityIndicator, FlatList, TouchableOpacity, TextInput} from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { BASE_URL } from '@/src/constants/api';
import { AppText } from "@/components/AppText";
import { Header } from "@/components/ui/Header";
import styles from "@/app/styles";


export default function AddCourseScreen() {
    const router = useRouter();
    const [courseName, setCourseName] = useState("");
    const [courseCode, setCourseCode] = useState("");
    const [courseDetails, setCourseDetails] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleAddCourse() {
        if (!courseName || !courseCode ) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            setSubmitting(true);

            const session = await fetchAuthSession();
            const token = session.tokens?.idToken?.toString();

            if (!token) {
                throw new Error('No authentication token found');
            }

            const res = await fetch(`${BASE_URL}/CreateTemplate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify({
                    ID: courseCode,
                    Name: courseName,
                    Course_Details: courseDetails,
                }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg);
            }

            Alert.alert('Success', 'Template created!');
            router.back();
        } catch (err: any) {
            console.error('Error creating template course:', err);
            Alert.alert('Error', err.message || 'Failed to create template course');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.container}>
                <Header 
                    text="New Course Template" 
                    backArrow={true} 
                    onBackPress={() => router.back()}
                />

            
                <TextInput
                    style={{
                        borderBottomWidth: 1,
                        borderBottomColor: '#ccc',
                        paddingVertical: 8,
                        marginBottom: 16,
                        textAlign:'center',
                    }}
                    placeholder='Course Name'
                    value={courseName}
                    onChangeText={setCourseName}
                    placeholderTextColor="#999"
                />

                <TextInput
                    style={{
                        borderBottomWidth: 1,
                        borderBottomColor: '#ccc',
                        paddingVertical: 8,
                        marginBottom: 16,
                        textAlign:'center',
                    }}
                    placeholder='Course Code'
                    value={courseCode}
                    onChangeText={(text) => setCourseCode(text.toUpperCase())}
                    placeholderTextColor="#999"
                />

                <AppText style={{fontWeight:'bold'}}>Course Details</AppText>
                <TextInput
                    style={{
                        height: 100,
                        borderWidth: 1,             
                        borderColor: '#ccc',        
                        borderRadius: 12,           
                        padding: 10,
                        textAlignVertical: 'top',   
                        backgroundColor: '#fff',    
                        shadowColor: '#000',        
                        shadowOffset: { width: 0, height: -3 }, 
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 5,  
                    }}
                    value={courseDetails}
                    onChangeText={setCourseDetails}
                    multiline
                />
                <AppText style={{fontWeight:'bold'}}>Skills</AppText>
                
            
            </View>
            
            {/* Add Course Button */}
            <View style={{ position: 'absolute', bottom: 100, alignSelf: 'center' }}>
                <TouchableOpacity
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: '#4972FF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                    }}
                    onPress={() => {
                        router.push('/(admin)/(tabs)/templates/newSkill' as any);
                    }}
                >
                    <Ionicons name="add" size={32} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <View style={{ position: 'absolute', bottom: 30, left: 0, right: 0, paddingHorizontal: 20 }}>
                <Pressable
                    style={[
                        styles.templateButton,
                        (courseName && courseCode || submitting) && { opacity: 0.6 },
                    ]}
                    onPress={handleAddCourse}
                    disabled={!courseName || !courseCode || submitting}
                >
                    <AppText style={styles.templateButtonText}>
                        {submitting ? 'Creating Template...' : 'Create Template'}
                    </AppText>
                </Pressable>
            </View>
        </View>
    );
}