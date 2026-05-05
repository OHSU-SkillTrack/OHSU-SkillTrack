import { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, Alert, ActivityIndicator, FlatList } from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useRouter } from 'expo-router';

import { BASE_URL } from '@/src/constants/api';
import { AppText } from "@/components/AppText";
import { Header } from "@/components/ui/Header";
import styles from "@/app/styles";

interface Template {
    id: string;
    name: string;
}

export default function AddCourseScreen() {
    const router = useRouter();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function fetchTemplates() {
            try {
                setLoading(true);
                const session = await fetchAuthSession();
                const token = session.tokens?.idToken?.toString();
                
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const res = await fetch(`${BASE_URL}/GetListOfTemplates`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token,
                    },
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch templates');
                }

                const data = await res.json();
                
                // Parse template data
                const parsed = Array.isArray(data)
                    ? data.map((t: any) => ({
                        id: t.ID?.split('#')[1] || t.ID || '',
                        name: t.CourseName || t.ID || '',
                    }))
                    : [];
                
                setTemplates(parsed);
                if (parsed.length > 0) {
                    setSelectedTemplate(parsed[0].id);
                }
            } catch (err) {
                console.error('Error fetching templates:', err);
                Alert.alert('Error', 'Failed to load templates');
            } finally {
                setLoading(false);
            }
        }

        fetchTemplates();
    }, []);

    async function handleAddCourse() {
        if (!selectedTemplate) {
            Alert.alert('Error', 'Please select a template');
            return;
        }

        try {
            setSubmitting(true);
            const session = await fetchAuthSession();
            const token = session.tokens?.idToken?.toString();

            if (!token) {
                throw new Error('No authentication token found');
            }

            const res = await fetch(`${BASE_URL}/CreateCourseFromTemplate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify({ Template_ID: selectedTemplate }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg);
            }

            Alert.alert('Success', 'Course created!');
            router.back();
        } catch (err: any) {
            console.error('Error creating course:', err);
            Alert.alert('Error', err.message || 'Failed to create course');
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <Header 
                    text="Add Course" 
                    backArrow={true} 
                    onBackPress={() => router.back()}
                />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#4972FF" />
                    <AppText style={{ marginTop: 12, color: '#666' }}>Loading templates...</AppText>
                </View>
            </View>
        );
    }

    const renderTemplate = ({ item }: { item: Template }) => (
        <Pressable
            style={[
                styles.courseCard,
                selectedTemplate === item.id && { 
                    backgroundColor: '#E8F0FE',
                    borderWidth: 2,
                    borderColor: '#4972FF',
                }
            ]}
            onPress={() => setSelectedTemplate(item.id)}
        >
            <View style={styles.courseHeader}>
                <AppText style={styles.cardNameText}>
                    {item.name}
                </AppText>
            </View>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <View >
                <Header 
                    text="Add Course" 
                    backArrow={true} 
                    onBackPress={() => router.back()}
                />

                <AppText style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, justifyContent:'center', textAlign:'center' }}>
                    Select a Course Template
                </AppText>
            </View>

            {templates.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
                    <AppText style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
                        No templates available
                    </AppText>
                </View>
            ) : (
                <FlatList
                    data={templates}
                    renderItem={renderTemplate}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    scrollEnabled
                />
            )}

            <View style={{ position: 'absolute', bottom: 30, left: 0, right: 0, paddingHorizontal: 20 }}>
                <Pressable
                    style={[
                        styles.refreshButton,
                        (!selectedTemplate || submitting) && { opacity: 0.6 },
                    ]}
                    onPress={handleAddCourse}
                    disabled={!selectedTemplate || submitting}
                >
                    <AppText style={styles.refreshButtonText}>
                        {submitting ? 'Creating Course...' : 'Create Course'}
                    </AppText>
                </Pressable>
            </View>
        </View>
    );
}
