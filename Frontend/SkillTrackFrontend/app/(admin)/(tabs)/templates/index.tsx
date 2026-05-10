import { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, Pressable, Alert, ActivityIndicator, FlatList , TouchableOpacity} from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { usePathname, useRouter } from 'expo-router';
import { SearchBar } from "@/components/ui/SearchBar";
import { BASE_URL } from '@/src/constants/api';
import { AppText } from "@/components/AppText";
import { Header } from "@/components/ui/Header";
import { Ionicons } from '@expo/vector-icons';
import styles from "@/app/styles";

interface Template {
    id: string;
    name: string;
    data: Record<string, unknown>
}

export default function AddCourseScreen() {
    const router = useRouter();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchTemplates() {
            try {
                setLoading(true);
                const session = await fetchAuthSession();
                const token = session.tokens?.idToken?.toString();
                
                if (!token) {
                    throw new Error('No authentication token found');
                }

                console.log("fetching template list, again...")
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
                        data: t.Skills
                    }))
                    : [];
                
                setTemplates(parsed);

            } catch (err) {
                console.error('Error fetching templates:', err);
                Alert.alert('Error', 'Failed to load templates');
            } finally {
                setLoading(false);
            }
        }

        fetchTemplates();
    }, []);


    const filteredTemplates = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) {
            return templates;
        }
        return templates.filter((c) =>
            c.id.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q)
        );
    }, [templates, searchQuery]);


    if (loading) {
        return (
            <View style={styles.container}>
                <Header 
                    text="Templates" 
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

    function handleTemplatePress(template: Template){
        router.push({
            pathname: '/(admin)/(tabs)/templates/templateDetails',
            params: {
                id: encodeURIComponent(template.id),
                name: encodeURIComponent(template.name) ,
                data: encodeURIComponent(JSON.stringify(template.data))
            }
        });

    }

    const renderTemplate = ({ item }: { item: Template }) => (
        <Pressable
            style={[
                styles.courseCard
            ]}
            onPress={() => handleTemplatePress(item)}
        >
            <View style={styles.courseHeader}>
                <AppText style={styles.cardNameText}>
                    {item.id}
                </AppText>
                <AppText >
                    {item.name}
                </AppText>
            </View>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <Header text="All OHSU Templates" backArrow={false} />
            <AppText>Click on a template to view its contents or edit it. Note that any teacher can make a course from any templates you create here.</AppText>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            
            {filteredTemplates.length === 0 ? (
                <View style={styles.emptySearchContainer}>
                    <AppText style={styles.emptySearchText}>
                        {searchQuery ? "No courses found" : "No courses assigned"}
                    </AppText>
                </View>
            ) : (
                <FlatList
                    data={filteredTemplates}
                    renderItem={renderTemplate}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
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
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                    }}
                    onPress={() => {
                        router.push('/(admin)/(tabs)/templates/newTemplates' as any);
                    }}
                >
                    <Ionicons name="add" size={32} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
            
        </View>
    );
}
