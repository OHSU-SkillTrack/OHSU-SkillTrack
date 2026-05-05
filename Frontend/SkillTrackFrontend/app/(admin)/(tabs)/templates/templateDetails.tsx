import { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, Pressable, Alert, ActivityIndicator, FlatList , TouchableOpacity} from 'react-native';
import { fetchAuthSession } from 'aws-amplify/auth';
import { SearchBar } from "@/components/ui/SearchBar";
import { BASE_URL } from '@/src/constants/api';
import { AppText } from "@/components/AppText";
import { Header } from "@/components/ui/Header";
import { Ionicons } from '@expo/vector-icons';
import styles from "@/app/styles";
import { useLocalSearchParams, useRouter } from "expo-router";


interface Skill {
    name: string
    description: string
}
export default function viewTemplateScreen(){

    const router = useRouter();

    const {id} = useLocalSearchParams();
    const {name} = useLocalSearchParams();
    
    const {data} = useLocalSearchParams();
    const parsedData = JSON.parse(decodeURIComponent(data as string))
    //const params = useLocalSearchParams();

    const [skillList, setSkillList] = useState<Skill[]>([])

    async function loadSkills(){


        const skills: Skill[] = Object.entries(parsedData).map(([name, value]: any) => ({
            name,
            description: value?.Description ?? ""
        }));


        setSkillList(skills)



    }


    useEffect(() => { 
        
        console.log(parsedData)
        loadSkills()


    }, [])

    const renderSkill = ({ item }: { item: Skill }) => {
        return(
            <Pressable
                style={[
                    styles.courseCard
                ]}
            >
                <View style={styles.courseHeader}>
                    <AppText style={styles.cardNameText}>
                        {item.name}
                    </AppText>
                    <AppText >
                        {item.description}
                    </AppText>
                </View>
            </Pressable>
        )
    };

    async function handleUpdateTemplate(){

        //We will go back into the NewTemplates menu but populate it with the data we have in here.
        router.push({
            pathname: '/(admin)/(tabs)/templates/newTemplates',
            params:{
                id: id,
                name: name,
                data: data
            } 

        });


    }

    

    return(

        <View style={styles.container}>
            
            <Header text={`${id}`} backArrow={false} />
            
            <AppText style = {{fontSize: 30, textAlign: "center"}}>{name}</AppText>
            <AppText style = {{fontSize: 15, textAlign: "center"}}>Skill List</AppText>


            <View>
                <FlatList 
                    data ={skillList}
                    renderItem={renderSkill}
                    contentContainerStyle={{ paddingBottom: 300 }}
                    ListFooterComponent={                
                        <View style={{ paddingVertical: 24 }}>
                            <Pressable style= {styles.generalButton} onPress={async () =>{ await handleUpdateTemplate()  }} >
                                <AppText style ={styles.generalButtonText} >
                                    Update Template
                                </AppText>
                            </Pressable> 
                        </View>}
                />
            </View>





        </View>



    );
}