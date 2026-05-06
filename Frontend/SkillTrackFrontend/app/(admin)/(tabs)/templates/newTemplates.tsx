import { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Pressable, Alert, ActivityIndicator, FlatList, TouchableOpacity, TextInput, StyleSheet} from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { BASE_URL } from '@/src/constants/api';
import { AppText } from "@/components/AppText";
import { Header } from "@/components/ui/Header";
import styles from "@/app/styles";


export default function AddCourseScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [courseName, setCourseName] = useState("");
    const [courseCode, setCourseCode] = useState("");
    const [courseDetails, setCourseDetails] = useState("");
    const [skills, setSkills] = useState<Skill[]>([]);
    const [submitting, setSubmitting] = useState(false);



    //if params are passed in, this will be populated. This means that the user has selected to
    //edit a existing template. So we will pre-fill this page with that content
    const {data} = useLocalSearchParams();
    let {id} = useLocalSearchParams();
    const {name} = useLocalSearchParams();


    interface TemplateOffering {
    CourseName: string;
    ID: string;
    Skills: Record<string, unknown>;
    }

    type Skill = {
        Name: string;
        Description: string;
    };

    useFocusEffect(
        useCallback(() => {




            if (params?.newSkill) {
                console.log("we have some skills in the running")
                try {
                    const parsedSkill: Skill = JSON.parse(params.newSkill as string);
    
                    setSkills(prev => {
                        const exists = prev.some(s => s.Name === parsedSkill.Name);
                        if (exists) return prev;
                        return [...prev, parsedSkill];
                    });
    
                    router.setParams({ newSkill: undefined,                     
                    id: undefined,
                    data: undefined,
                    name: undefined,});
    
                } catch (e) {
                    console.log("Failed to parse skill:", e);
                }
            }else if(id){
                console.log("---------------------------")
                console.log(id)
                
                console.log("We obtained an ID meaning we have course data: ")
                const parsedData = JSON.parse(decodeURIComponent(data as string))
                console.log(parsedData)
                const existingSkills: Skill[] = Object.entries(parsedData).map(([name, value]: any) => ({
                    Name: name,
                    Description: value?.Description ?? ""
                }));
                setSkills(existingSkills)
                setCourseName(Array.isArray(name) ? name[0] : name);
                setCourseCode(Array.isArray(id) ? id[0] : id);   

                id =""
                router.setParams({
                    id: undefined,
                    data: undefined,
                    name: undefined,
                });

            }
        }, [params?.newSkill])
    );



    function confirmOverwrite(): Promise<boolean> {
    return new Promise((resolve) => {
        Alert.alert(
        'Confirm Action',
        'This template ID already exists! Submitting this will overwrite that template with this template entry. Are you sure you want to overwrite the existing template and replace it with what you have entered here? If you would like to not overwrite an existing template you can simply change the course code in the second box and make a new template.',
        [
            {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(false),
            },
            {
            text: 'OK',
            onPress: () => resolve(true),
            },
        ],
        { cancelable: true }
        );
    });
    }

    async function handleRemoveSkill(skillName: String){


        Alert.alert(
            'Confirm Action',
            `Are you sure you want to delete this skill '${skillName}'` ,
            [
            {
                text: 'Cancel',
                style: 'cancel', // iOS only, but safe to include
            },
            {
                text: 'Yes',
                onPress: () => setSkills(prevSkills => prevSkills.filter(skill => skill.Name !== skillName)),
            },
            ],
            { cancelable: true } // Android: tapping outside closes the alert
        );


    }


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

            /* 
            When the user attempts to submit their template entry. They may enter a ID for a template that already exists.
            This is OK. They can do this and overwrite what is currently in place with this new tempate OR template update if that's how they got to this screen.
            
            If it is an overwrite situation we will display this warning to ask the user if they want to move forward with the modification.
            */
            const current_template_offering_res = await fetch(`${BASE_URL}/GetListOfTemplates`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
            });

            const current_template_offering: TemplateOffering[]  = await current_template_offering_res.json(); 

            const appendedCode = "COURSE_TEMPLATE#" + courseCode 
            
            const exists = current_template_offering.some(
                item => item.ID === appendedCode
            );


            if (exists) {
                const userConfirmed = await confirmOverwrite()

                if (!userConfirmed) return; // stop everything here
            }





            console.log("testing")
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
                    Skills: skills,
                }),
            });

            if (!res.ok) {
                const msg = await res.text();
                throw new Error(msg);
            }

            Alert.alert('Success', 'Template created!');
            router.replace('/(admin)/(tabs)/templates');
        } catch (err: any) {
            console.error('Error creating template course:', err);
            Alert.alert('Error', err.message || 'Failed to create template course');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <View style={{ flex: 1 }}>
            
            <ScrollView>
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

                    {skills.map((skill, index) => (

                    <View style={[ localStyles.skillCard]} key ={index}>
                        
                        <View style={localStyles.textContainer}>
                            <AppText style={localStyles.skillName}>
                                {skill.Name}
                            </AppText>
                            <AppText style={localStyles.skillDesc} >
                                {skill.Description}
                            </AppText>
                        </View>
                        <Pressable style={localStyles.iconContainer}
                            onPress={() => handleRemoveSkill(skill.Name)} 
                        >
                            <Ionicons name="remove-circle-outline" size={28} color="red"  />
                        </Pressable>
                    </View>


                ))}
                
                </View>
                


                <View style = {styles.spacer}/>


            </ScrollView>
    


            {/* Add Course Button */}
            <View style={{ position: 'absolute', bottom: 100, alignSelf: 'center' }}>
                <TouchableOpacity
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: '#000000',
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
                        {submitting ? 'Creating Template...' : 'Create/Update Template'}
                    </AppText>
                </Pressable>
            </View>
        </View>
    );
}



const localStyles = StyleSheet.create({

    skillCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        marginHorizontal: 5,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 25,
        backgroundColor: '#F5F5F5'
    },

    textContainer:{
        flex: 1,
        paddingRight: 10

    },

    skillName: {
        fontSize: 20,
        flexWrap: 'wrap'
    },
    
    skillDesc: {
        fontSize: 15,
        flexWrap: 'wrap'
    },

    iconContainer: {
        width: 32,
        alignItems: 'center',
        justifyContent: 'center'
    },


})