import { Pressable, StyleSheet } from 'react-native';
import { AppText } from "@/components/AppText";
import { Ionicons } from '@expo/vector-icons';

interface Resource {
    id: number
    name: string
}

interface ResourceCardProps {
    resource: Resource
    onPress: (resource: Resource) => void
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onPress }: ResourceCardProps) => {
    return (
        <Pressable
            style={styles.resourceCard}
            onPress={() => onPress(resource)}>
            
            <AppText style={styles.resourceName}>
                {resource.name}
            </AppText>
        </Pressable>
    )
}

const styles = StyleSheet.create({

    resourceCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        marginHorizontal: 5,
        paddingVertical: 10,
        paddingHorizontal: 15,
        gap: 15,
        borderRadius: 25,
        backgroundColor: '#F5F5F5'
    },

    resourceName: {
        fontSize: 20
    }
})