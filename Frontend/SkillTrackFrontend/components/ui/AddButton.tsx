import { Ionicons } from "@expo/vector-icons"
import { Pressable, StyleSheet } from "react-native"

interface AddButtonProps {
  onPress: () => void;
}

export const AddButton = ({onPress}: AddButtonProps) => {
    return (
        <Pressable onPress={onPress} style={styles.button}>
            <Ionicons name="add-outline" size={30} color="#FFFFFF"/>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    button: {
        justifyContent: "center",
        alignItems: "center",
        width: 50,
        height: 50,
        backgroundColor: "#4972FF",
        borderRadius: 25
    }
})