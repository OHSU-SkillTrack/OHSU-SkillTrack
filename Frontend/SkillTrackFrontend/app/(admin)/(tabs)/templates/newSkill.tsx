import { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, Alert, ActivityIndicator, FlatList, TouchableOpacity, TextInput} from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { BASE_URL } from '@/src/constants/api';
import { AppText } from "@/components/AppText";
import { Header } from "@/components/ui/Header";
import styles from "@/app/styles";


export default function AddSkillScreen() {
    const router = useRouter();
    const [skillName, setskillName] = useState("");
    const [skillDetails, setskillDetails] = useState("");
    

    function handleAddSkill() {
        if (!skillName || !skillDetails) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        const newSkill = {
            Name: skillName,
            Description: skillDetails,
        };

        router.back();

    
    setTimeout(() => {
        router.setParams({
            newSkill: JSON.stringify(newSkill),
        });
    }, 0);
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.container}>
                <Header 
                    text="New Skill Template" 
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
                    placeholder='Skill Name'
                    value={skillName}
                    onChangeText={setskillName}
                    placeholderTextColor="#999"
                />
                <AppText style={{fontWeight:'bold'}}>Details</AppText>
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
                    value={skillDetails}
                    onChangeText={setskillDetails}
                    multiline
                />
                
            </View>
            
            

            <View style={{ position: 'absolute', bottom: 30, left: 0, right: 0, paddingHorizontal: 20 }}>
                <Pressable
                    style={[
                        styles.templateButton,
                        (skillName || skillDetails ) && { opacity: 0.6 },
                    ]}
                    onPress={handleAddSkill}
                    disabled={!skillName || !skillDetails }
                >
                    <AppText style={styles.templateButtonText}>
                        Add Skill
                    </AppText>
                </Pressable>
            </View>
        </View>
    );
}