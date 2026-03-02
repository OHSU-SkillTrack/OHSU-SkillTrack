import { AppText } from "@/components/AppText";
import { signOut } from "aws-amplify/auth";
import { Pressable, View } from "react-native";

import { router } from "expo-router";

export default function InstructorIndex() {

    const handleLogout = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <View>
            <Pressable style={{margin: 16}} onPress={handleLogout}>
                <AppText>Logout</AppText>
            </Pressable>
            <AppText>Instructor</AppText>
            <Pressable onPress={() => router.push({
            pathname: '/(instructor)/(tabs)/qr/studentDetails',
            params: { email: encodeURIComponent('test100100@test100100abcdefghi123.com') }
            })}>
            <AppText>Test Student Profile</AppText>
            </Pressable>
        </View>
    )
}