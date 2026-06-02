import { Pressable, StyleSheet } from 'react-native';
import { AppText } from "@/components/AppText";
import { Ionicons } from '@expo/vector-icons';
import { View } from "react-native";

interface Skill {
  skillName: string;
  status: boolean;
}

interface SkillCardProps {
    skill: Skill
    onPress: (skill: Skill) => void
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill, onPress }: SkillCardProps) => {
    return (
        <Pressable
            style={styles.skillCard}
            onPress={() => onPress(skill)}>
            
            <View style ={styles.textContainer}>
                <AppText style={styles.skillName}>
                    {skill.skillName}
                </AppText>
            </View>

            <View style = {styles.iconContainer}>
                {skill.status ? (
                    <Ionicons name="checkmark-outline" size={28} color="#4972FF"/>

                ) : (<View style={{width: 28}}/>

                )
                }

            </View>


            
        </Pressable>
    )
}

const styles = StyleSheet.create({

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

    iconContainer: {
        width: 32,
        alignItems: 'center',
        justifyContent: 'center'
    },


})